// ============================================================
//  xolito/packages/vscode/src/extension.ts
//  v8 — Sistema de Corrupción + Deploy Suicida
// ============================================================

import * as vscode from 'vscode';
import * as fs from 'fs';
import { Xolito, evaluateCodeOffline, evaluateCodeWithGemini } from '@xolito/core';
import type { XolitoEvent, XolitoMood, CodeEvaluationResult } from '@xolito/core';
import { glitchText } from '@xolito/core';
import type { CorruptionState } from '@xolito/core';
import { DiagnosticsWatcher } from './diagnostics-watcher.js';
import { XolitoDecorations } from './decorations.js';
import { CorruptionWatcher } from './corruption-watcher.js';
import type { FileWithErrors } from './corruption-watcher.js';

// ── Frases de corrupción ──────────────────────────────────
const CORRUPTION_PHRASES: Record<string, string[]> = {
  clean:    ['Repo limpio. Así se hace.', '0 corrupción. Xolito respira.', 'Clean. Todo en orden.'],
  warning:  ['Algo huele raro en este repo...', 'Los errores se acumulan, mijo.', 'El repo empieza a crujir.', 'Xolito siente perturbaciones en el código.'],
  critical: ['EL REPO ESTÁ EN PELIGRO.', 'Demasiados errores. La corrupción avanza.', 'El linter ya no puede salvarte.', 'Xolito está muy preocupado. Muy.'],
  possessed:['ALIMENTASTE DEMASIADOS BUGS.', 'EL LINTER YA NO PUEDE SALVARTE.', 'Ese undefined ya tiene conciencia.', 'ERROR: XOLITO.EXE HA DEJADO DE RESPONDER.', 'Demasiada corrupción. Demasiada.'],
};


let xolito:      Xolito;
let statusBar:   vscode.StatusBarItem;
let diagWatcher: DiagnosticsWatcher;
let decorations: XolitoDecorations;
let corruptionWatcher: CorruptionWatcher;
let idleTimer:   NodeJS.Timeout | undefined;
let panel:       vscode.WebviewPanel | undefined;
let extContext:  vscode.ExtensionContext;

// ── Boss Mode ────────────────────────────────────────────────
let isPanicMode     = false;
let originalEditor  : vscode.TextEditor | undefined;
let dummyDocUri     : vscode.Uri | undefined;

// ── Sistema de Corrupción ────────────────────────────────────
let currentCorruption: CorruptionState = {
  level: 0, tier: 'clean',
  glitchText: false, redEyes: false, screenShake: false,
};
let deployFridayActive = false;
let isCurrentlyExorcised = false;

// ── Evaluador de Código de Xolito ────────────────────────────
let lastEvaluationResult: CodeEvaluationResult | undefined;
let lastSelectedText: string = "";
let lastSelectedEditor: vscode.TextEditor | undefined;
let lastSelectedRange: vscode.Range | undefined;

// ── Sistema de Logros ─────────────────────────────────────────
const BADGES_LIST = [
  {
    id: 'late_night',
    name: 'La Noche es Joven',
    hint: 'Pista: Intenta programar entre las 3 AM y las 5 AM.',
    desc: 'Programar a altas horas de la madrugada.',
    emoji: '🦉'
  },
  {
    id: 'junior_errors',
    name: 'Junior de Corazón',
    hint: 'Pista: Acumula 10 errores de sintaxis activos.',
    desc: 'Tener 10 o más errores concurrentes en tu código.',
    emoji: '👶'
  },
  {
    id: 'merge_hero',
    name: 'Héroe Nacional',
    hint: 'Pista: Resuelve y limpia un conflicto de Git (Merge Conflict).',
    desc: 'Resolver y guardar limpio un conflicto de Git.',
    emoji: '⚔️'
  },
  {
    id: 'friday_danger',
    name: 'Viernes de Peligro',
    hint: 'Pista: Intenta compilar código un viernes por la tarde.',
    desc: 'Programar o compilar código un viernes después de las 3 PM.',
    emoji: '🌶️'
  },
  {
    id: 'no_commits',
    name: '¿Qué es un Commit?',
    hint: 'Pista: Trabaja un buen rato sin guardar tu progreso en Git.',
    desc: 'Guardar cambios 50 veces seguidas sin realizar un commit.',
    emoji: '💾'
  },
  {
    id: 'limpiador',
    name: 'El Limpiador',
    hint: 'Pista: Haz una limpieza profunda borrando mucho código de golpe.',
    desc: 'Borrar más de 100 líneas de código de un solo golpe.',
    emoji: '🧹'
  },
  {
    id: 'terco',
    name: 'El Terco',
    hint: 'Pista: Intenta compilar lo mismo roto una y otra vez.',
    desc: 'Guardar el mismo archivo roto 5 veces seguidas sin corregir errores.',
    emoji: '🐂'
  }
];
const inConflictFiles = new Set<string>();
let consecutiveSavesWithoutCommit = 0;
const lastSaveErrorsMap = new Map<string, { count: number; consecutiveSaves: number }>();


// ── Stats de sesión ──────────────────────────────────────────
const sessionStart  = Date.now();
let   buildsToday   = 0;
let   buildsSuccess = 0;
let   buildsFail    = 0;
let   filesChanged  = new Set<string>();

// ── Sistema de estrés ────────────────────────────────────────
let consecutiveErrors = 0;
const STRESS_THRESHOLD = 5;

const NOTIF_COOLDOWN = 8000;
let   lastPhrase     = "¡Órale! Xolito en línea. 🦎";
const messageHistory: { text: string; mood: string; time: string }[] = [];
let   lastNotifTime  = 0;

const MOOD_ICONS: Record<XolitoMood, string> = {
  idle:'🦎', happy:'🦎✨', mad:'🦎💢', sleepy:'🦎💤', sassy:'🦎👀',
  proud:'🦎⭐', worried:'🦎😬', hyped:'🦎🔥', tired:'🦎😮', judging:'🦎🧐',
  panic:'💼🦎', corrupt:'👹🦎', deploy_friday:'🔥🦎',
};

const MOOD_COLORS: Record<XolitoMood, string> = {
  idle:'#4ec9b0', happy:'#4ec9b0', proud:'#4ec9b0', hyped:'#4ec9b0',
  mad:'#f44747',  tired:'#f44747', corrupt:'#ff2222', deploy_friday:'#ff6600',
  worried:'#cca700', sassy:'#cca700', judging:'#cca700', sleepy:'#888888',
  panic:'#a8ffb2',
};

// ── Frases estrés ─────────────────────────────────────────────
const STRESS_PHRASES = [
  { text: "Ya van 5 errores seguidos, mijo. ¿Todo bien?",          mood: 'tired'   as XolitoMood },
  { text: "El compilador te odia hoy. Respira.",                    mood: 'tired'   as XolitoMood },
  { text: "5 errores seguidos. Xolito oficialmente preocupado.",    mood: 'tired'   as XolitoMood },
  { text: "¿Cuándo fue la última vez que compiló? Pregunta sincera.", mood: 'mad'  as XolitoMood },
  { text: "Error tras error. ¿Comiste? A veces eso ayuda.",         mood: 'worried' as XolitoMood },
  { text: "Tantos errores seguidos que ya ni cuento.",              mood: 'mad'     as XolitoMood },
  { text: "Párate, respira, lee el error completo. En serio.",      mood: 'worried' as XolitoMood },
];

// ── Frases viernes / finde ────────────────────────────────────
const FRIDAY_PHRASES = [
  { text: "Viernes a las 4pm. El código puede esperar al lunes, mijo.", mood: 'sassy'   as XolitoMood },
  { text: "¿Sigues aquí en viernes por la tarde? La vida te espera.",   mood: 'worried' as XolitoMood },
  { text: "Viernes 4pm. Cierra el IDE y agarra una chela.",             mood: 'hyped'   as XolitoMood },
  { text: "Son las 4 del viernes. El código puede esperar, tú no.",     mood: 'sassy'   as XolitoMood },
  { text: "Viernes tarde. ¿A qué hora es el taco run?",                mood: 'hyped'   as XolitoMood },
];

const WEEKEND_RELAX_PHRASES = [
  { text: "Es fin de semana. El código puede esperar al lunes.",        mood: 'worried' as XolitoMood },
  { text: "¿Código en sábado? Sal. Respira. Come tacos.",               mood: 'sassy'   as XolitoMood },
  { text: "Domingo de código. Tu cuerpo merece descanso, mijo.",        mood: 'worried' as XolitoMood },
  { text: "Finde programando. Tu therapist no aprueba, yo tampoco.",    mood: 'judging' as XolitoMood },
  { text: "¿No tienes algo mejor que hacer un domingo?",                mood: 'sassy'   as XolitoMood },
];

// ── Linter Spanglish ──────────────────────────────────────────
const SPANGLISH_PATTERNS = [
  /\bget_[a-z]*[A-Z]|\bfetch[_]?[A-ZÁÉÍÓÚÑ]/,
  /\b[a-z]+_[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b/,
  /\b(get|set|fetch|update|delete|create)[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/,
];

const SPANGLISH_PHRASES = [
  { text: "get_datos_cliente detectado. ¿Español o inglés? Decide.", mood: 'sassy'   as XolitoMood },
  { text: "fetchUsuarios. Mijo, consistencia. Elige un idioma.",     mood: 'judging' as XolitoMood },
  { text: "Nombre en spanglish. El código no sabe qué eres.",        mood: 'sassy'   as XolitoMood },
  { text: "Variables en dos idiomas. Xolito está confundido.",       mood: 'judging' as XolitoMood },
  { text: "Spanglish en el código. Ni tú sabes qué hace.",           mood: 'mad'     as XolitoMood },
];


// ── Código dummy C++ ──────────────────────────────────────────
const GODÍN_CPP_CODE = `/**
 * @fileoverview Enterprise Cloud Matrix Sync Core
 * @version 14.8.2-stable
 * @security-level CRITICAL_INFRASTRUCTURE
 */
#pragma once
#include <iostream>
#include <vector>
#include <memory>
#include <mutex>
#include <atomic>
#include <future>
#include <unordered_map>

namespace Enterprise::Core::Network::Optimizer {
    template <typename T, size_t Alignment = 64>
    class alignas(Alignment) MemoryClusterBalancer {
    private:
        std::vector<std::shared_ptr<T>>              nodeRegistry;
        std::unordered_map<size_t, std::weak_ptr<T>> nodeCache;
        mutable std::mutex                           allocationMutex;
        std::atomic<size_t>                          totalAllocations{0};

        [[nodiscard]] inline bool validateNodeIntegrity(
            const std::shared_ptr<T>& node) const noexcept {
            return node && node.use_count() > 0;
        }

    public:
        MemoryClusterBalancer() = default;
        ~MemoryClusterBalancer() noexcept {
            std::lock_guard<std::mutex> lock(allocationMutex);
            nodeRegistry.clear();
            nodeCache.clear();
        }

        [[nodiscard]] auto synchronizeClusterMatrices(
            size_t threadPoolDepth
        ) -> std::future<bool> {
            return std::async(std::launch::async,
                [this, threadPoolDepth]() mutable -> bool {
                    std::lock_guard<std::mutex> lock(this->allocationMutex);
                    this->nodeRegistry.reserve(threadPoolDepth);
                    for (size_t i = 0; i < threadPoolDepth; ++i) {
                        auto node = std::make_shared<T>();
                        if (!this->validateNodeIntegrity(node)) return false;
                        this->nodeRegistry.emplace_back(std::move(node));
                        ++this->totalAllocations;
                    }
                    return true;
                }
            );
        }

        [[nodiscard]] size_t getTotalAllocations() const noexcept {
            return totalAllocations.load(std::memory_order_acquire);
        }
    };
} // namespace Enterprise::Core::Network::Optimizer
`;

// ── Helpers tiempo ────────────────────────────────────────────
function isFridayAfternoon(): boolean {
  const n = new Date(); return n.getDay() === 5 && n.getHours() >= 16;
}
function isWeekend(): boolean {
  const d = new Date().getDay(); return d === 0 || d === 6;
}
function getContextualOverride(event: XolitoEvent): { text: string; mood: XolitoMood } | null {
  if (isFridayAfternoon() && Math.random() < 0.4)
    return FRIDAY_PHRASES[Math.floor(Math.random() * FRIDAY_PHRASES.length)];
  if (isWeekend() && Math.random() < 0.3)
    return WEEKEND_RELAX_PHRASES[Math.floor(Math.random() * WEEKEND_RELAX_PHRASES.length)];
  return null;
}
function getSessionTime(): string {
  const mins = Math.floor((Date.now() - sessionStart) / 60000);
  return mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h ${mins%60}m`;
}
function getBuildRate(): string {
  return buildsToday === 0 ? '—' : `${Math.round((buildsSuccess/buildsToday)*100)}%`;
}


// ── activate ─────────────────────────────────────────────────
export function activate(context: vscode.ExtensionContext): void {
  extContext = context;
  xolito     = new Xolito({ spiciness: 3, language: 'spanglish' });

  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'xolito.show';
  statusBar.show();

  diagWatcher = new DiagnosticsWatcher((event, detail) => fireEvent(event, detail));
  diagWatcher.start();

  decorations = new XolitoDecorations();
  decorations.start();

  // ── Sistema de Corrupción ──────────────────────────────────
  corruptionWatcher = new CorruptionWatcher((state) => {
    if (isCurrentlyExorcised) {
      state.level = 0;
      state.tier = 'clean';
      state.glitchText = false;
      state.redEyes = false;
      state.screenShake = false;
    }
    const prevTier = currentCorruption.tier;
    currentCorruption = state;
    if (state.tier !== prevTier) {
      const phrases = CORRUPTION_PHRASES[state.tier];
      const phrase  = phrases[Math.floor(Math.random() * phrases.length)];
      const mood: XolitoMood = state.tier === 'possessed' ? 'corrupt'
                             : state.tier === 'critical'  ? 'mad'
                             : 'worried';
      forcePhrase(phrase, mood);
    }

    // Chequeo de Logro: Junior de Corazón
    const factors = corruptionWatcher.getCurrentFactors();
    if (factors.errorCount >= 10) {
      unlockBadge('junior_errors', 'Junior de Corazón', '¡Ajúa! 10 errores seguidos. Te recomiendo apagar la computadora y respirar aire fresco.', 'mad');
    }

    if (panel) updatePanel();
  });
  corruptionWatcher.start();

  context.subscriptions.push(
    vscode.commands.registerCommand('xolito.show',        showPanel),
    vscode.commands.registerCommand('xolito.greet',       () => fireEvent('greeted')),
    vscode.commands.registerCommand('xolito.toggle',      toggleDecorations),
    vscode.commands.registerCommand('xolito.panicButton', handlePanicButton),
    vscode.commands.registerCommand('xolito.exorcise',    handleExorcise),
    vscode.commands.registerCommand('xolito.evaluateCodeSelection', handleEvaluateCodeSelection),
    statusBar,
    { dispose: () => { diagWatcher.stop(); decorations.stop(); corruptionWatcher.stop(); } },
    vscode.workspace.onDidSaveTextDocument(onSave),
    vscode.tasks.onDidEndTaskProcess(onTaskEnd),
    vscode.window.onDidChangeTextEditorSelection(() => resetIdleTimer()),
    vscode.workspace.onDidChangeTextDocument((e) => {
      isCurrentlyExorcised = false;
      resetIdleTimer();

      let linesDeleted = 0;
      if (e.contentChanges && e.contentChanges.length > 0) {
        for (const change of e.contentChanges) {
          const rangeLines = change.range.end.line - change.range.start.line;
          const textLines = (change.text.match(/\n/g) || []).length;
          if (rangeLines - textLines > 0) {
            linesDeleted += (rangeLines - textLines);
          }
        }
      }
      if (linesDeleted >= 100) {
        unlockBadge('limpiador', 'El Limpiador', '¡Eso! Borrando código inútil. Menos código, menos bugs. Ya te pareces a un programador de a verdad.', 'proud');
      }
    }),
  );

  try {
    const td = (vscode.window as any).onDidWriteTerminalData(
      (e: { data: string }) => onTerminalData(e.data)
    );
    if (td) context.subscriptions.push(td);
  } catch (_) {}

  fireEvent('greeted');
  resetIdleTimer();

  // ── Timer de contexto horario — revisa cada 30 min ──────────
  const timeContextTimer = setInterval(() => {
    const h = new Date().getHours();
    const day = new Date().getDay();
    if (h >= 23 || h < 4)        fireEvent('late_night_coding');
    if (day === 0 || day === 6)   fireEvent('weekend_coding');
  }, 30 * 60 * 1000); // cada 30 minutos
  context.subscriptions.push({ dispose: () => clearInterval(timeContextTimer) });

}

// ── onSave ────────────────────────────────────────────────────
function onSave(doc: vscode.TextDocument): void {
  isCurrentlyExorcised = false;
  const text = doc.getText();
  filesChanged.add(doc.fileName);

  // Chequeo de Logro: La Noche es Joven
  const hour = new Date().getHours();
  if (hour >= 3 && hour < 5) {
    unlockBadge('late_night', 'La Noche es Joven', '¿Qué haces despierto a estas horas? A dormir, mijo, que mañana andas arrastrando la cobija.', 'worried');
  }

  // Chequeo de Logro: Viernes de Peligro
  const now = new Date();
  if (now.getDay() === 5 && now.getHours() >= 15) {
    unlockBadge('friday_danger', 'Viernes de Peligro', '¿Compilando en viernes por la tarde? Eres bien valiente, cuate. Dios guarde la hora si rompes producción.', 'panic');
  }

  // Chequeo de Logro: ¿Qué es un Commit?
  consecutiveSavesWithoutCommit++;
  if (consecutiveSavesWithoutCommit >= 50) {
    unlockBadge('no_commits', '¿Qué es un Commit?', '¿Git? ¿Qué es eso? ¿Se come con salsa? Haz un commit ya, mijo, que si se te va la luz vas a llorar.', 'tired');
  }

  // Chequeo de Logro: El Terco
  const diags = vscode.languages.getDiagnostics(doc.uri);
  const errs = diags.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
  if (errs > 0) {
    const prev = lastSaveErrorsMap.get(doc.fileName);
    if (prev && prev.count === errs) {
      prev.consecutiveSaves++;
      if (prev.consecutiveSaves >= 5) {
        unlockBadge('terco', 'El Terco', '¿Otra vez lo mismo? El compilador ya te dijo que no, cuate. El código no se va a arreglar solo por rezarle.', 'mad');
      }
    } else {
      lastSaveErrorsMap.set(doc.fileName, { count: errs, consecutiveSaves: 1 });
    }
  } else {
    lastSaveErrorsMap.delete(doc.fileName);
  }

  // Chequeo de Logro: Héroe Nacional
  if (text.includes('<<<<<<<')) {
    inConflictFiles.add(doc.fileName);
  } else if (inConflictFiles.has(doc.fileName)) {
    inConflictFiles.delete(doc.fileName);
    unlockBadge('merge_hero', 'Héroe Nacional', 'Resolviste un conflicto sin romper la base. Ya te ganaste tu sombrero de charro honorario.', 'proud');
  }

  if (doc.languageId !== 'markdown') {
    for (const pattern of SPANGLISH_PATTERNS) {
      if (pattern.test(text)) {
        const p = SPANGLISH_PHRASES[Math.floor(Math.random() * SPANGLISH_PHRASES.length)];
        forcePhrase(p.text, p.mood);
        return;
      }
    }
  }
  if (/console\.log/.test(text))      { fireEvent('console_log_left'); return; }
  if (/\/\/\s*TODO/i.test(text))      { fireEvent('todo_comment');     return; }
  if (/\{[^{}]{3000,}\}/s.test(text)) { fireEvent('long_function');    return; }
  const isCode = ['typescript','javascript','typescriptreact','javascriptreact'].includes(doc.languageId);
  if (isCode && !/\/\/|\/\*/.test(text) && text.length > 400) fireEvent('save_no_comments');
}

// ── onTaskEnd ─────────────────────────────────────────────────
function onTaskEnd(e: vscode.TaskProcessEndEvent): void {
  const name = e.execution.task.name.toLowerCase();
  const ok   = e.exitCode === 0;
  if (name.includes('build') || name.includes('tsc')) {
    if (ok) {
      consecutiveErrors = 0; buildsToday++; buildsSuccess++;
      corruptionWatcher.reportBuildSuccess();
      fireEvent('build_success');
    } else {
      consecutiveErrors++; buildsToday++; buildsFail++;
      corruptionWatcher.reportBuildFail();
      checkStress(); fireEvent('build_fail');
    }
  } else if (name.includes('test') || name.includes('vitest')) {
    if (ok) { consecutiveErrors = 0; fireEvent('test_pass'); }
    else    { consecutiveErrors++; checkStress(); fireEvent('test_fail'); }
  }
}

// ── onTerminalData ────────────────────────────────────────────
function onTerminalData(data: string): void {
  // Deploy Suicida — viernes, sábado y domingo
  const day = new Date().getDay();
  const isDeployDanger = day === 5 || day === 6 || day === 0;
  if (isDeployDanger && /npm run (deploy|release|prod)|vercel|netlify deploy/i.test(data)) {
    if (!deployFridayActive) {
      deployFridayActive = true;
      triggerDeployFriday();
      setTimeout(() => { deployFridayActive = false; }, 30000);
    }
  }
  if (/git push.*--force/i.test(data))                      fireEvent('git_force_push');
  else if (/git push.*origin (main|master)/i.test(data))  { corruptionWatcher.reportCommit(); consecutiveSavesWithoutCommit = 0; fireEvent('push_to_main'); }
  else if (/git commit/i.test(data))                      { corruptionWatcher.reportCommit(); consecutiveSavesWithoutCommit = 0; }
  else if (/npm install|pnpm install|yarn add/i.test(data)) fireEvent('npm_install');
  else if (/CONFLICT \(content\)/i.test(data))              fireEvent('merge_conflict');
  const h = new Date().getHours(), dow = new Date().getDay();
  if (h >= 23 || h < 4)       fireEvent('late_night_coding');
  if (dow === 0 || dow === 6) fireEvent('weekend_coding');
}


// ── Deploy Suicida ────────────────────────────────────────────
async function triggerDeployFriday(): Promise<void> {
  const day = new Date().getDay();
  const dayPhrases: Record<number, string[]> = {
    5: [
      "NO SE HACE DEPLOY EN VIERNES. NUNCA. JAMÁS.",
      "¿DEPLOY EN VIERNES? Xolito no se hace responsable.",
      "El on-call ya te odia. Acabas de confirmarlo.",
      "ALARM: FRIDAY DEPLOY DETECTED. GOD HELP US ALL.",
      "Viernes + deploy = weekend on-call. Suerte.",
    ],
    6: [
      "¿DEPLOY EN SÁBADO? ¿En serio, mijo?",
      "Sábado de deploy. Tu familia no te conoce.",
      "Deploy en finde. El on-call llora en algún lugar.",
      "¿No podía esperar al lunes? Pregunta sincera.",
    ],
    0: [
      "DOMINGO de deploy. Xolito reza por ti.",
      "¿Deploy en domingo? La semana no empezó y ya la regaste.",
      "Domingo + deploy = lunes muy largo. Math.",
      "Deploy dominical. Tu terapeuta va a escuchar mucho el lunes.",
    ],
  };
  const phrases = dayPhrases[day] ?? dayPhrases[5];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  vscode.window.showErrorMessage(
    `🔥 Xolito: ${phrase}`,
    'Cancelar deploy', 'Vivir peligroso'
  ).then(sel => {
    if (sel === 'Cancelar deploy')
      vscode.window.showInformationMessage('🦎 Xolito: Decisión correcta. El lunes te lo agradeces.');
    else if (sel === 'Vivir peligroso')
      vscode.window.showWarningMessage('🦎 Xolito: Está bien. Ya avisé. Lo que pase es tuyo.');
  });
  forcePhrase(phrase, 'deploy_friday');
}

// ── Sistema de estrés ────────────────────────────────────────
function checkStress(): void {
  if (consecutiveErrors >= STRESS_THRESHOLD) {
    const p = STRESS_PHRASES[Math.floor(Math.random() * STRESS_PHRASES.length)];
    forcePhrase(p.text, p.mood);
  }
}

// ── forcePhrase ───────────────────────────────────────────────
function forcePhrase(text: string, mood: XolitoMood): void {
  lastPhrase = text;
  const t = new Date();
  const ts = `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;
  messageHistory.unshift({ text, mood, time: ts });
  if (messageHistory.length > 5) messageHistory.pop();
  updateStatusBarRaw(text, mood);
  const now = Date.now();
  if (now - lastNotifTime < NOTIF_COOLDOWN) { if (panel) updatePanel(); return; }
  lastNotifTime = now;
  const sev = getMoodSeverity(mood);
  const msg = `🦎 Xolito: ${text}`;
  if (sev === 'error')        vscode.window.showErrorMessage(msg);
  else if (sev === 'warning') vscode.window.showWarningMessage(msg);
  else                        vscode.window.showInformationMessage(msg);
  if (panel) updatePanel();
}

function resetIdleTimer(): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { const ev = xolito.checkIdle(); if (ev) fireEvent(ev); }, 600000);
}

function fireEvent(event: XolitoEvent, _detail?: string): void {
  const override = getContextualOverride(event);
  if (override) { forcePhrase(override.text, override.mood); return; }
  const { text } = xolito.react(event);
  // El conteo de builds ya lo hace onTaskEnd — no contar aquí de nuevo
  lastPhrase = text;
  const t = new Date();
  const ts = `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;
  messageHistory.unshift({ text, mood: xolito.getMood(), time: ts });
  if (messageHistory.length > 5) messageHistory.pop();
  updateStatusBar(text);
  const now = Date.now();
  if (now - lastNotifTime < NOTIF_COOLDOWN) { if (panel) updatePanel(); return; }
  lastNotifTime = now;
  const sev = getMoodSeverity(xolito.getMood());
  const msg = `🦎 Xolito: ${text}`;
  if (sev === 'error')        vscode.window.showErrorMessage(msg);
  else if (sev === 'warning') vscode.window.showWarningMessage(msg);
  else                        vscode.window.showInformationMessage(msg);
  if (panel) updatePanel();
}

function updateStatusBar(message: string): void {
  if (isPanicMode) return;
  const icon = MOOD_ICONS[xolito.getMood()] ?? '🦎';
  statusBar.text    = `${icon} ${message.length > 38 ? message.slice(0,35)+'...' : message}`;
  statusBar.color   = MOOD_COLORS[xolito.getMood()];
  statusBar.tooltip = `${message}\n\nClic para abrir Xolito`;
}

function updateStatusBarRaw(message: string, mood: XolitoMood): void {
  if (isPanicMode) return;
  const icon = MOOD_ICONS[mood] ?? '🦎';
  statusBar.text    = `${icon} ${message.length > 38 ? message.slice(0,35)+'...' : message}`;
  statusBar.color   = MOOD_COLORS[mood];
  statusBar.tooltip = `${message}\n\nClic para abrir Xolito`;
}

function getMoodSeverity(mood: XolitoMood): 'info' | 'warning' | 'error' {
  if (['mad','tired','panic','corrupt','deploy_friday'].includes(mood)) return 'error';
  if (['worried','judging'].includes(mood))                             return 'warning';
  return 'info';
}

let decorationsEnabled = true;
function toggleDecorations(): void {
  decorationsEnabled = !decorationsEnabled;
  if (decorationsEnabled) {
    decorations.start();
    vscode.window.showInformationMessage('🦎 Xolito: Ahora sí te veo el código.');
  } else {
    decorations.stop();
    vscode.window.showInformationMessage('🦎 Xolito: Okey, me quedo callado... por ahora.');
  }
}


// ── Panel ─────────────────────────────────────────────────────
function showPanel(): void {
  if (panel) { panel.reveal(vscode.ViewColumn.Beside); updatePanel(); return; }
  panel = vscode.window.createWebviewPanel(
    'xolito', '🦎 Xolito', vscode.ViewColumn.Beside,
    { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(extContext.extensionUri, 'assets')] }
  );
  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.command === 'exorcise') {
      vscode.commands.executeCommand('xolito.exorcise');
    } else if (message.command === 'evaluate_custom') {
      const customText = message.text;
      const customLang = message.language || 'typescript';
      
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.getText(editor.selection).trim() === customText.trim()) {
        lastSelectedEditor = editor;
        lastSelectedRange = new vscode.Range(editor.selection.start, editor.selection.end);
      } else {
        lastSelectedEditor = undefined;
        lastSelectedRange = undefined;
      }

      const apiKey = vscode.workspace.getConfiguration('xolito').get<string>('geminiApiKey', '').trim();
      let result: CodeEvaluationResult;
      try {
        if (apiKey) {
          result = await evaluateCodeWithGemini(customText, customLang, apiKey);
        } else {
          result = evaluateCodeOffline(customText, customLang);
        }
      } catch (err) {
        result = evaluateCodeOffline(customText, customLang);
      }

      lastEvaluationResult = result;
      panel?.webview.postMessage({ command: 'evaluation_result', result });
    } else if (message.command === 'apply_refactor') {
      if (!lastEvaluationResult || !lastEvaluationResult.refactoredCode) {
        vscode.window.showErrorMessage('🦎 Xolito: No hay ninguna refactorización propuesta para aplicar, mijo.');
        return;
      }

      const editor = lastSelectedEditor || vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('🦎 Xolito: No encuentro un editor abierto para aplicar los cambios.');
        return;
      }

      const targetRange = lastSelectedRange || editor.selection;

      editor.edit(editBuilder => {
        editBuilder.replace(targetRange, lastEvaluationResult!.refactoredCode!);
      }).then(success => {
        if (success) {
          vscode.window.showInformationMessage('🦎 Xolito: ¡Refactorización aplicada con éxito! Chulada de código. ✨');
        } else {
          vscode.window.showErrorMessage('🦎 Xolito: No se pudo editar el documento.');
        }
      });
    } else if (message.command === 'import_selection') {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        const text = editor.document.getText(selection).trim();
        const language = editor.document.languageId;
        lastSelectedEditor = editor;
        lastSelectedRange = new vscode.Range(selection.start, selection.end);
        panel?.webview.postMessage({ command: 'import_selection_result', text, language });
      } else {
        vscode.window.showWarningMessage('🦎 Xolito: No hay ningún editor activo para importar.');
      }
    }
  });
  panel.onDidDispose(() => { panel = undefined; });
  updatePanel();
}

function getSpriteUri(mood: XolitoMood): string {
  if (!panel || !extContext) return '';
  for (const c of [`assets/xolito_${mood}.png`, 'assets/xolito_idle.png']) {
    const uri = vscode.Uri.joinPath(extContext.extensionUri, c);
    if (fs.existsSync(uri.fsPath)) return panel.webview.asWebviewUri(uri).toString();
  }
  return '';
}

function updatePanel(): void {
  if (!panel) return;
  const baseMood    = xolito.getMood();
  const mood: XolitoMood = currentCorruption.tier === "possessed" ? "corrupt"
               : currentCorruption.tier === "critical" && baseMood !== "panic" ? "mad"
               : baseMood;
  const errors    = xolito.getErrorCount();
  const counts    = diagWatcher.getCurrentCounts();
  const phrase    = lastPhrase;
  const spriteUrl = getSpriteUri(mood);
  const mc        = MOOD_COLORS[mood] ?? '#4ec9b0';
  const corrupt   = isCurrentlyExorcised ? { level: 0, tier: 'clean' as const, glitchText: false, redEyes: false, screenShake: false } : currentCorruption;
  const unlockedBadges = extContext.globalState.get<string[]>('xolito.badges', []);

  // Colores de corrupción
  const corruptColor =
    corrupt.tier === 'possessed' ? '#ff2222' :
    corrupt.tier === 'critical'  ? '#f44747' :
    corrupt.tier === 'warning'   ? '#cca700' : '#4ec9b0';

  const corruptLabel =
    corrupt.tier === 'possessed' ? 'POSEÍDO 👹' :
    corrupt.tier === 'critical'  ? '⚠️ CRÍTICO'  :
    corrupt.tier === 'warning'   ? '🟡 Advertencia' : '✓ Limpio';

  const corruptPhrase = corrupt.glitchText
    ? glitchText(`${corrupt.level}% — ${corruptLabel}`, corrupt.level)
    : `${corrupt.level}% — ${corruptLabel}`;

  const shakeCSS    = corrupt.screenShake ? 'animation:shake .3s ease-in-out infinite' : '';
  const redOverlay  = corrupt.redEyes
    ? `<div style="position:absolute;inset:0;background:radial-gradient(circle,#ff000033 0%,transparent 70%);border-radius:8px;pointer-events:none"></div>`
    : '';

  const spriteAnim  =
    mood === 'mad' || mood === 'corrupt' || mood === 'deploy_friday'
      ? 'animation:shake .4s ease-in-out 2,float 3s ease-in-out .8s infinite'
      : mood === 'sleepy' || mood === 'tired'
      ? 'animation:float 5s ease-in-out infinite;opacity:.85'
      : mood === 'hyped' ? 'animation:float 1s ease-in-out infinite'
      : 'animation:float 3s ease-in-out infinite';

  const panelBg     = isPanicMode ? '#0a1a0a' : corrupt.tier === 'possessed' ? '#1a0a0a' : '#1e1e1e';
  const factors     = corruptionWatcher.getCurrentFactors();

  panel.webview.html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none';img-src ${panel.webview.cspSource} data:;style-src 'unsafe-inline';script-src 'unsafe-inline';">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',sans-serif;background:${panelBg};color:#d4d4d4;
       display:flex;flex-direction:column;align-items:center;padding:1.5rem 1rem;min-height:100vh}
  .name{font-size:1.3rem;color:#4ec9b0;font-weight:700;margin-bottom:.5rem}
  ${isPanicMode ? '.name::before{content:"[PROD] "}.name::after{content:" — LIVE"}' : ''}
  .sprite-wrap{margin:.5rem 0 .75rem;filter:drop-shadow(0 4px 16px ${mc}44)}
  .sprite{width:160px;height:160px;object-fit:contain;image-rendering:pixelated;${spriteAnim}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
  .badge{font-size:.8rem;padding:3px 12px;border-radius:99px;background:${mc}22;color:${mc};border:1px solid ${mc}55;margin-bottom:.75rem;font-family:monospace}
  .phrase{font-size:.88rem;color:#9cdcfe;text-align:center;max-width:220px;line-height:1.5;font-style:italic;margin-bottom:1.25rem}
  .section-title{font-size:.65rem;color:#555;text-transform:uppercase;letter-spacing:.08em;width:100%;max-width:220px;margin:.75rem 0 .3rem;text-align:left}
  .stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:220px;margin-bottom:.5rem}
  .stat{background:#2d2d2d;border-radius:8px;padding:8px;text-align:center}
  .sv{font-size:1.3rem;font-weight:700}.sl{font-size:.65rem;color:#666;margin-top:2px}
  .bar-wrap{width:100%;max-width:220px;margin:.4rem 0}
  .bar-label{font-size:.7rem;color:#666;margin-bottom:3px}
  .bar-bg{background:#2d2d2d;border-radius:99px;height:6px;overflow:hidden}
  .bar-fill{height:100%;border-radius:99px;transition:width .4s ease}
  .corrupt-wrap{width:100%;max-width:220px;padding:8px;background:#1a1a1a;border-radius:8px;margin:.5rem 0;position:relative;${shakeCSS}}
  .corrupt-label{font-size:.72rem;font-family:monospace;text-align:center;margin-top:4px}
  .corrupt-factors{display:flex;gap:8px;justify-content:center;margin-top:5px;font-size:.62rem;color:#555;font-family:monospace}
  .corrupt-files{width:100%;margin-top:6px;font-family:monospace}
  .corrupt-file{display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #2a2a2a;font-size:.62rem}
  .corrupt-file-name{color:#666;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px}
  .corrupt-file-count{color:#f44747;flex-shrink:0}
  .history{width:100%;max-width:220px}
  .history-item{display:flex;gap:6px;padding:4px 0;border-bottom:1px solid #2a2a2a}
  .hi-time{font-size:.65rem;color:#444;font-family:monospace;white-space:nowrap;margin-top:1px}
  .hi-text{font-size:.72rem;color:#7a7a7a;font-style:italic;line-height:1.4}
  .panic-banner{background:#a8ffb211;border:1px solid #a8ffb244;border-radius:8px;padding:6px 12px;font-size:.72rem;color:#a8ffb2;font-family:monospace;width:100%;max-width:220px;text-align:center;margin-bottom:1rem;animation:blink 1.5s ease-in-out infinite}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.5}}
  .footer{font-size:.65rem;color:#333;text-align:center;margin-top:1.5rem}
</style></head><body>
  <div class="name">🦎 Xolito</div>
  ${isPanicMode ? '<div class="panic-banner">🔒 MODO GODÍN ACTIVADO — DISIMULA</div>' : ''}
  <div class="sprite-wrap">
    ${spriteUrl
      ? `<img class="sprite" src="${spriteUrl}" alt="Xolito ${mood}"/>`
      : `<div style="font-size:100px;line-height:1;${spriteAnim}">🦎</div>`}
  </div>
  <div class="badge">${mood}</div>
  <div class="phrase">"${phrase}"</div>

  <div class="section-title">Ahora mismo</div>
  <div class="stats">
    <div class="stat"><div class="sv" style="color:#f44747">${counts.errors}</div><div class="sl">errores</div></div>
    <div class="stat"><div class="sv" style="color:#cca700">${counts.warnings}</div><div class="sl">warnings</div></div>
    <div class="stat"><div class="sv" style="color:#4ec9b0">${errors}</div><div class="sl">racha</div></div>
    <div class="stat"><div class="sv" style="color:${mc}">${mood}</div><div class="sl">mood</div></div>
  </div>

  <div class="section-title" style="color:${corruptColor}">Estado del Repo</div>
  <div class="corrupt-wrap">
    ${redOverlay}
    ${!vscode.workspace.workspaceFolders?.length ? `
    <div style="font-size:.7rem;color:#555;text-align:center;padding:6px 0;line-height:1.5">
      💡 Abre una carpeta de proyecto<br>para activar el monitor de corrupción.<br>
      <span style="color:#333">File → Open Folder</span>
    </div>` : `
    <div class="bar-bg">
      <div class="bar-fill" style="width:${corrupt.level}%;background:${corruptColor}"></div>
    </div>
    <div class="corrupt-label" style="color:${corruptColor}">${corruptPhrase}</div>
    ${corrupt.tier === 'clean' ? '<div style="font-size:.65rem;color:#333;text-align:center;margin-top:4px">0 errores detectados en este workspace</div>' : ''}
    `}
    ${corrupt.tier !== 'clean' ? `
    <div class="corrupt-factors">
      <span>Errors: ${factors.errorCount}</span>
      <span>Fails: ${factors.consecutiveFails}</span>
    </div>
    ${corrupt.tier === 'possessed' ? `
    <button onclick="exorcise()" style="width:100%;margin-top:8px;padding:6px;background:#ff2222;color:white;border:none;border-radius:4px;font-weight:bold;font-family:monospace;cursor:pointer;animation:blink 1.2s infinite;box-shadow:0 0 8px #ff2222aa;">🔮 REALIZAR EXORCISMO</button>
    ` : ''}
    ${corruptionWatcher.getFilesWithErrors().length > 0 ? `
    <div class="corrupt-files">
      ${corruptionWatcher.getFilesWithErrors().map(f => `
        <div class="corrupt-file">
          <span class="corrupt-file-name" title="${f.name}">${f.name.split('/').pop()}</span>
          <span class="corrupt-file-count">${f.errors} err</span>
        </div>
      `).join('')}
    </div>` : ''}` : ''}
  </div>

  <!-- SECCIÓN AUDITORÍA DE CÓDIGO -->
  <div class="section-title">Auditoría de Código 📊</div>
  <div style="width:100%;max-width:220px;background:#2d2d2d;border:1px solid #444;border-radius:8px;padding:8px;margin-bottom:1rem;display:flex;flex-direction:column;gap:8px;">
    <div style="position:relative;display:flex;flex-direction:column;">
      <label style="font-size:0.65rem;color:#7a7a7a;margin-bottom:3px;text-align:left;">Código a evaluar:</label>
      <textarea id="code-input" placeholder="Selecciona código en tu editor y haz clic derecho -> Evaluar Código, o pégalo aquí..." style="width:100%;height:100px;background:#1e1e1e;border:1px solid #444;border-radius:4px;color:#d4d4d4;font-family:monospace;font-size:0.65rem;padding:6px;resize:vertical;outline:none;text-align:left;"></textarea>
    </div>
    
    <div style="display:flex;gap:6px;justify-content:space-between;align-items:center;">
      <select id="lang-select" style="background:#1e1e1e;color:#d4d4d4;border:1px solid #444;border-radius:4px;font-size:0.62rem;padding:3px;outline:none;cursor:pointer;">
        <option value="auto" selected>Auto-detectar ✨</option>
        <option value="typescript">TypeScript</option>
        <option value="javascript">JavaScript</option>
        <option value="kotlin">Kotlin</option>
        <option value="java">Java</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
      </select>
      <button onclick="importSelection()" style="background:#3c3c3c;color:#d4d4d4;border:none;border-radius:4px;padding:4px 8px;font-size:0.62rem;cursor:pointer;font-weight:bold;">Importar 📝</button>
    </div>

    <button onclick="evaluateCustomCode()" id="btn-eval" style="width:100%;background:#4ec9b0;color:#1e1e1e;border:none;border-radius:4px;padding:6px;font-size:0.7rem;font-weight:bold;cursor:pointer;transition:background 0.2s;">EVALUAR CÓDIGO 🦎</button>

    <!-- Spinner de carga -->
    <div id="eval-loading" style="display:none;align-items:center;justify-content:center;gap:6px;font-size:0.65rem;color:#4ec9b0;padding:6px 0;font-family:monospace;">
      <span style="display:inline-block;animation:spin 1s linear infinite;">🔄</span> Pensando...
    </div>

    <!-- Resultados de la Auditoría -->
    <div id="eval-results" style="display:none;flex-direction:column;gap:6px;margin-top:4px;border-top:1px solid #3c3c3c;padding-top:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.65rem;">
        <span style="color:#7a7a7a;">Modo: <span id="eval-mode" style="font-weight:bold;color:#9cdcfe;">Local</span></span>
        <span style="font-weight:bold;color:#4ec9b0;">Score: <span id="eval-score" style="font-size:0.9rem;">0</span>/10</span>
      </div>
      
      <div id="eval-score-bar-bg" style="width:100%;height:6px;background:#1e1e1e;border-radius:3px;overflow:hidden;">
        <div id="eval-score-bar-fill" style="width:0%;height:100%;background:#4ec9b0;transition:width 0.3s ease;"></div>
      </div>

      <!-- Desglose de rúbricas -->
      <div style="display:flex;flex-direction:column;gap:3px;font-size:0.6rem;font-family:monospace;margin:4px 0;text-align:left;">
        <div style="display:flex;justify-content:space-between;"><span>Semántica:</span><span id="rubric-semantica" style="font-weight:bold;">❌</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Robustez:</span><span id="rubric-robustez" style="font-weight:bold;">❌</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Modularidad:</span><span id="rubric-modularidad" style="font-weight:bold;">❌</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Documentación:</span><span id="rubric-documentacion" style="font-weight:bold;">❌</span></div>
      </div>

      <!-- Regaño de Xolito -->
      <div style="background:#1e1e1e;border-left:3px solid #ff2222;border-radius:3px;padding:6px;font-size:0.65rem;color:#cca700;font-style:italic;line-height:1.3;margin-top:2px;text-align:left;">
        <span id="eval-regaño">""</span>
      </div>

      <!-- Propuesta de Refactorización -->
      <div id="refactor-section" style="display:none;flex-direction:column;gap:4px;margin-top:4px;text-align:left;">
        <label style="font-size:0.62rem;color:#7a7a7a;">Propuesta limpia (IA):</label>
        <pre id="refactor-code" style="max-width:100%;max-height:120px;overflow:auto;background:#1e1e1e;padding:6px;font-size:0.55rem;border-radius:4px;border:1px solid #3c3c3c;color:#9cdcfe;text-align:left;white-space:pre-wrap;word-break:break-all;font-family:monospace;"></pre>
        <button onclick="applyRefactor()" style="background:#cca700;color:#1e1e1e;border:none;border-radius:4px;padding:5px;font-size:0.65rem;font-weight:bold;cursor:pointer;">APLICAR REFACTORIZACIÓN ✨</button>
      </div>
    </div>
  </div>

  <details style="width:100%;max-width:220px;margin-bottom:1rem;background:#2d2d2d;border:1px solid #444;border-radius:8px;overflow:hidden;text-align:left;">
    <summary style="font-size:.75rem;font-weight:bold;color:#4ec9b0;padding:8px 12px;cursor:pointer;user-select:none;display:flex;justify-content:space-between;align-items:center;outline:none;">
      <span>Tus Medallas 🏅</span>
      <span style="font-size:0.65rem;color:#7a7a7a;">(${unlockedBadges.length}/${BADGES_LIST.length}) ▼</span>
    </summary>
    <div style="display:flex;flex-direction:column;gap:6px;padding:8px;background:#1e1e1e;border-top:1px solid #3c3c3c;max-height:250px;overflow-y:auto;">
      ${BADGES_LIST.map(badge => {
        const unlocked = unlockedBadges.includes(badge.id);
        return `
          <div style="display:flex;align-items:center;gap:8px;background:${unlocked ? '#2d2d2d' : '#1a1a1a'};border:1px solid ${unlocked ? '#4ec9b044' : '#2a2a2a'};border-radius:6px;padding:6px;opacity:${unlocked ? 1 : 0.55};">
            <div style="font-size:1.3rem;flex-shrink:0;">${unlocked ? badge.emoji : '🔒'}</div>
            <div style="display:flex;flex-direction:column;text-align:left;overflow:hidden;flex-grow:1;">
              <span style="font-size:.7rem;font-weight:bold;color:${unlocked ? '#4ec9b0' : '#666'};line-height:1.2;">${badge.name}</span>
              <span style="font-size:.6rem;color:#7a7a7a;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;margin-top:2px;" title="${unlocked ? badge.desc : badge.hint}">
                ${unlocked ? badge.desc : badge.hint}
              </span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  </details>

  <div class="section-title">Sesión</div>
  <div class="stats">
    <div class="stat"><div class="sv" style="color:#9cdcfe">${getSessionTime()}</div><div class="sl">tiempo</div></div>
    <div class="stat"><div class="sv" style="color:#9cdcfe">${filesChanged.size}</div><div class="sl">archivos</div></div>
    <div class="stat"><div class="sv" style="color:${buildsSuccess>0?'#4ec9b0':'#666'}">${buildsSuccess}</div><div class="sl">builds ok</div></div>
    <div class="stat"><div class="sv" style="color:${buildsFail>0?'#f44747':'#666'}">${buildsFail}</div><div class="sl">builds fail</div></div>
  </div>

  <div class="bar-wrap">
    <div class="bar-label">Tasa de éxito: <span style="color:${getBuildRate()==='—'?'#444':'#4ec9b0'}">${getBuildRate()}</span></div>
    <div class="bar-bg"><div class="bar-fill" style="width:${buildsToday>0?Math.round((buildsSuccess/buildsToday)*100):0}%;background:#4ec9b0"></div></div>
  </div>
  <div class="bar-wrap">
    <div class="bar-label">Estrés: <span style="color:${consecutiveErrors>=STRESS_THRESHOLD?'#f44747':'#666'}">${consecutiveErrors}/${STRESS_THRESHOLD}</span></div>
    <div class="bar-bg"><div class="bar-fill" style="width:${Math.min((consecutiveErrors/STRESS_THRESHOLD)*100,100)}%;background:#f44747"></div></div>
  </div>

  <div class="section-title">Últimas frases</div>
  <div class="history">
    ${messageHistory.map(m=>`<div class="history-item"><span class="hi-time">${m.time}</span><span class="hi-text">"${m.text}"</span></div>`).join('')}
  </div>
  <div class="footer">"Aquí estoy, cuidándote...<br>y juzgándote con cariño."</div>

  <!-- Fullscreen Exorcism Overlay -->
  <div id="exorcism-overlay" style="display:none;position:fixed;inset:0;background:radial-gradient(circle,#0e2b1b 0%,#050f0a 100%);color:#4ec9b0;flex-direction:column;align-items:center;justify-content:center;z-index:9999;font-family:monospace;padding:2rem;text-align:center;overflow:hidden;">
    <div id="emoji-container" style="position:absolute;inset:0;pointer-events:none;z-index:9990;overflow:hidden;"></div>
    <div style="width:120px;height:120px;border:4px dashed #4ec9b0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3rem;margin-bottom:1.5rem;animation:rotateCircle 4s linear infinite;z-index:9999;">🔮</div>
    <h2 style="font-size:1.1rem;margin-bottom:0.5rem;text-shadow:0 0 10px #4ec9b055;z-index:9999;">EXORCISMO RITUAL</h2>
    <div id="exorcism-step" style="font-size:0.75rem;color:#7a7a7a;height:30px;z-index:9999;">Iniciando ritual copal...</div>
    <div style="width:180px;height:4px;background:#1a3a2a;border-radius:2px;overflow:hidden;margin-top:1rem;z-index:9999;">
      <div id="exorcism-bar" style="width:0%;height:100%;background:#4ec9b0;transition:width 0.1s ease;"></div>
    </div>
  </div>

  <style>
    @keyframes rotateCircle{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @keyframes floatUp {
      0% { transform: translateY(0) rotate(0deg); opacity: 0; }
      10% { opacity: 0.6; }
      90% { opacity: 0.6; }
      100% { transform: translateY(-105vh) rotate(360deg); opacity: 0; }
    }
    @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.5}}
  </style>

  <script>
    const vscode = acquireVsCodeApi();
    
    function exorcise() {
      vscode.postMessage({ command: 'exorcise' });
    }

    function setLanguageInSelect(lang) {
      if (!lang) return;
      const select = document.getElementById('lang-select');
      let exists = false;
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === lang) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        const opt = document.createElement('option');
        opt.value = lang;
        opt.innerText = lang.charAt(0).toUpperCase() + lang.slice(1);
        select.appendChild(opt);
      }
      select.value = lang;
    }

    function evaluateCustomCode() {
      const code = document.getElementById('code-input').value;
      const language = document.getElementById('lang-select').value;
      if (!code.trim()) return;
      
      document.getElementById('btn-eval').disabled = true;
      document.getElementById('eval-loading').style.display = 'flex';
      document.getElementById('eval-results').style.display = 'none';
      
      vscode.postMessage({ command: 'evaluate_custom', text: code, language: language });
    }

    function importSelection() {
      vscode.postMessage({ command: 'import_selection' });
    }

    function applyRefactor() {
      vscode.postMessage({ command: 'apply_refactor' });
    }

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'exorcise_start') {
        const overlay = document.getElementById('exorcism-overlay');
        const container = document.getElementById('emoji-container');
        overlay.style.display = 'flex';
        container.innerHTML = '';
        
        // Spawn emojis in background
        const emojis = ['🌿', '💧', '💻', '🔮', '✨', '🔥', '🦎', '🌿', '💧', '💻'];
        const emojiInterval = setInterval(() => {
          if (overlay.style.display === 'none') {
            clearInterval(emojiInterval);
            return;
          }
          const div = document.createElement('div');
          div.innerText = emojis[Math.floor(Math.random() * emojis.length)];
          div.style.position = 'absolute';
          div.style.bottom = '-40px';
          div.style.left = Math.random() * 90 + 5 + '%';
          div.style.fontSize = (Math.random() * 1.5 + 1.2) + 'rem';
          div.style.pointerEvents = 'none';
          div.style.zIndex = '9998';
          div.style.animation = 'floatUp 4s linear forwards';
          container.appendChild(div);
          
          setTimeout(() => div.remove(), 4000);
        }, 220);

        let progress = 0;
        const steps = [
          { p: 0, text: "Defumando con copal digital... 🌿" },
          { p: 30, text: "Echando agua bendita al package.json... 💧" },
          { p: 65, text: "Rezándole 3 Padre Nuestro al server... 💻" },
          { p: 95, text: "¡Exorcismo exitoso! 🌟" }
        ];
        
        const bar = document.getElementById('exorcism-bar');
        const stepText = document.getElementById('exorcism-step');
        
        let currentStep = 0;
        const interval = setInterval(() => {
          progress += 2; // +2% every 110ms = 50 steps * 110ms = 5500ms total
          if (progress > 100) progress = 100;
          bar.style.width = progress + '%';
          
          if (currentStep < steps.length && progress >= steps[currentStep].p) {
            stepText.innerText = steps[currentStep].text;
            currentStep++;
          }
          
          if (progress >= 100) {
            clearInterval(interval);
            clearInterval(emojiInterval);
            setTimeout(() => {
              overlay.style.display = 'none';
              container.innerHTML = '';
            }, 800);
          }
        }, 110);
      } else if (message.command === 'evaluation_start') {
        document.getElementById('code-input').value = message.text || '';
        if (message.language) {
          setLanguageInSelect(message.language);
        }
        document.getElementById('btn-eval').disabled = true;
        document.getElementById('eval-loading').style.display = 'flex';
        document.getElementById('eval-results').style.display = 'none';
      } else if (message.command === 'evaluation_result') {
        document.getElementById('btn-eval').disabled = false;
        document.getElementById('eval-loading').style.display = 'none';
        document.getElementById('eval-results').style.display = 'flex';
        
        const result = message.result;
        
        // Modo y Score
        document.getElementById('eval-mode').innerText = (result.mode === 'online' ? 'IA Activa ⚡' : 'Local Offline 🔌') + ' (' + result.language + ')';
        document.getElementById('eval-score').innerText = result.score;
        if (result.language) {
          setLanguageInSelect(result.language);
        }
        
        // Barra de progreso y colores
        const barFill = document.getElementById('eval-score-bar-fill');
        barFill.style.width = (result.score * 10) + '%';
        if (result.score >= 8) {
          barFill.style.background = '#4ec9b0'; // Verde
        } else if (result.score >= 5) {
          barFill.style.background = '#cca700'; // Amarillo
        } else {
          barFill.style.background = '#ff2222'; // Rojo
        }
        
        // Rúbricas
        document.getElementById('rubric-semantica').innerText = (result.semantica.passed ? '✅ ' : '❌ ') + result.semantica.comment;
        document.getElementById('rubric-robustez').innerText = (result.robustez.passed ? '✅ ' : '❌ ') + result.robustez.comment;
        document.getElementById('rubric-modularidad').innerText = (result.modularidad.passed ? '✅ ' : '❌ ') + result.modularidad.comment;
        document.getElementById('rubric-documentacion').innerText = (result.documentacion.passed ? '✅ ' : '❌ ') + result.documentacion.comment;
        
        // Regaño
        document.getElementById('eval-regaño').innerText = '"' + result.xolitoRegaño + '"';
        
        // Refactorización
        const refactorSec = document.getElementById('refactor-section');
        if (result.refactoredCode) {
          refactorSec.style.display = 'flex';
          document.getElementById('refactor-code').innerText = result.refactoredCode;
        } else {
          refactorSec.style.display = 'none';
        }
      } else if (message.command === 'import_selection_result') {
        document.getElementById('code-input').value = message.text || '';
        if (message.language) {
          setLanguageInSelect(message.language);
        }
      }
    });
  </script>
</body></html>`;
}


// ── Boss Mode ─────────────────────────────────────────────────
async function handlePanicButton(): Promise<void> {
  isPanicMode = !isPanicMode;
  if (isPanicMode) {
    originalEditor = vscode.window.activeTextEditor;
    fireEvent('boss_alert');
    statusBar.text    = '💼 [PROD] cluster_matrix_balancer.cpp';
    statusBar.color   = '#a8ffb2';
    statusBar.tooltip = 'Enterprise Platform Core — v14.8.2';
    const doc = await vscode.workspace.openTextDocument({ language: 'cpp', content: GODÍN_CPP_CODE });
    dummyDocUri = doc.uri;
    await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
    if (panel) updatePanel();
  } else {
    statusBar.color   = undefined;
    statusBar.tooltip = undefined;
    if (dummyDocUri) {
      for (const tg of vscode.window.tabGroups.all) {
        for (const tab of tg.tabs) {
          const input = tab.input as any;
          if (input?.uri?.toString() === dummyDocUri.toString())
            await vscode.window.tabGroups.close(tab);
        }
      }
    }
    if (originalEditor) {
      await vscode.window.showTextDocument(originalEditor.document, originalEditor.viewColumn);
      originalEditor = undefined;
    }
    dummyDocUri = undefined;
    fireEvent('greeted');
    if (panel) updatePanel();
  }
}

async function handleExorcise(): Promise<void> {
  isCurrentlyExorcised = true;
  if (panel) {
    panel.webview.postMessage({ command: 'exorcise_start' });
  }

  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "Exorcizando a Xolito 🔮",
    cancellable: false
  }, async (progress) => {
    progress.report({ increment: 0, message: "Preparando copal digital... 🌿" });
    await new Promise(resolve => setTimeout(resolve, 1800));
    progress.report({ increment: 35, message: "Echando agua bendita al package.json... 💧" });
    await new Promise(resolve => setTimeout(resolve, 1800));
    progress.report({ increment: 35, message: "Rezándole 3 Padre Nuestro al servidor de producción... 💻" });
    await new Promise(resolve => setTimeout(resolve, 1900));
    progress.report({ increment: 30, message: "¡Exorcismo exitoso!" });
  });

  consecutiveErrors = 0;
  corruptionWatcher.reportBuildSuccess();
  xolito.react('build_success');
  vscode.window.showInformationMessage("🦎 Xolito: Uff... ya regresó el alma al cuerpo, mijo. ¡A darle de volada!");
  forcePhrase("Uff... ya regresó el alma al cuerpo, mijo. ¡A darle de volada!", 'happy');
  if (panel) updatePanel();
}

async function handleEvaluateCodeSelection(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('🦎 Xolito: No hay ningún editor activo, mijo.');
    return;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection).trim();

  if (!selectedText) {
    vscode.window.showWarningMessage('🦎 Xolito: Primero selecciona un bloque de código para evaluar.');
    return;
  }

  lastSelectedText = selectedText;
  lastSelectedEditor = editor;
  lastSelectedRange = new vscode.Range(selection.start, selection.end);

  const language = editor.document.languageId;

  // Mostrar el panel de Xolito
  showPanel();

  // Señalizar al webview que empiece a cargar
  if (panel) {
    panel.webview.postMessage({ command: 'evaluation_start', text: selectedText, language });
  }

  const apiKey = vscode.workspace.getConfiguration('xolito').get<string>('geminiApiKey', '').trim();

  let result: CodeEvaluationResult;
  try {
    if (apiKey) {
      result = await evaluateCodeWithGemini(selectedText, language, apiKey);
    } else {
      result = evaluateCodeOffline(selectedText, language);
    }
  } catch (err) {
    result = evaluateCodeOffline(selectedText, language);
  }

  lastEvaluationResult = result;

  if (panel) {
    panel.webview.postMessage({ command: 'evaluation_result', result });
  }
}

function unlockBadge(badgeId: string, badgeName: string, reactionPhrase: string, reactionMood: XolitoMood = 'proud'): void {
  const currentBadges = extContext.globalState.get<string[]>('xolito.badges', []);
  if (!currentBadges.includes(badgeId)) {
    currentBadges.push(badgeId);
    extContext.globalState.update('xolito.badges', currentBadges);
    vscode.window.showInformationMessage(`🏅 ¡Medalla Desbloqueada! "${badgeName}" — Xolito está orgulloso.`);
    forcePhrase(reactionPhrase, reactionMood);
    if (panel) updatePanel();
  }
}

export function deactivate(): void {
  diagWatcher?.stop();
  decorations?.stop();
  corruptionWatcher?.stop();
  if (idleTimer) clearTimeout(idleTimer);
  panel?.dispose();
}
