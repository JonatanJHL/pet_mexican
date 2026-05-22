// ============================================================
//  xolito/packages/vscode/src/extension.ts
//  v8 — Sistema de Corrupción + Deploy Suicida
// ============================================================

import * as vscode from 'vscode';
import * as fs from 'fs';
import { Xolito } from '@xolito/core';
import type { XolitoEvent, XolitoMood } from '@xolito/core';
import { CORRUPTION_PHRASES, glitchText } from '@xolito/core';
import type { CorruptionState } from '@xolito/core';
import { DiagnosticsWatcher } from './diagnostics-watcher.js';
import { XolitoDecorations } from './decorations.js';
import { CorruptionWatcher } from './corruption-watcher.js';

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
    if (panel) updatePanel();
  });
  corruptionWatcher.start();

  context.subscriptions.push(
    vscode.commands.registerCommand('xolito.show',        showPanel),
    vscode.commands.registerCommand('xolito.greet',       () => fireEvent('greeted')),
    vscode.commands.registerCommand('xolito.toggle',      toggleDecorations),
    vscode.commands.registerCommand('xolito.panicButton', handlePanicButton),
    statusBar,
    { dispose: () => { diagWatcher.stop(); decorations.stop(); corruptionWatcher.stop(); } },
    vscode.workspace.onDidSaveTextDocument(onSave),
    vscode.tasks.onDidEndTaskProcess(onTaskEnd),
    vscode.window.onDidChangeTextEditorSelection(() => resetIdleTimer()),
    vscode.workspace.onDidChangeTextDocument(() => resetIdleTimer()),
  );

  try {
    const td = (vscode.window as any).onDidWriteTerminalData(
      (e: { data: string }) => onTerminalData(e.data)
    );
    if (td) context.subscriptions.push(td);
  } catch (_) {}

  fireEvent('greeted');
  resetIdleTimer();
}

// ── onSave ────────────────────────────────────────────────────
function onSave(doc: vscode.TextDocument): void {
  const text = doc.getText();
  filesChanged.add(doc.fileName);
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
  else if (/git push.*origin (main|master)/i.test(data))    fireEvent('push_to_main');
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
  if (event === 'build_success') { buildsToday++; buildsSuccess++; }
  if (event === 'build_fail')    { buildsToday++; buildsFail++; }
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
  const mood      = xolito.getMood();
  const errors    = xolito.getErrorCount();
  const counts    = diagWatcher.getCurrentCounts();
  const phrase    = lastPhrase;
  const spriteUrl = getSpriteUri(mood);
  const mc        = MOOD_COLORS[mood] ?? '#4ec9b0';
  const corrupt   = currentCorruption;

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
    <div class="bar-bg">
      <div class="bar-fill" style="width:${corrupt.level}%;background:${corruptColor}"></div>
    </div>
    <div class="corrupt-label" style="color:${corruptColor}">${corruptPhrase}</div>
    ${corrupt.tier !== 'clean' ? `
    <div class="corrupt-factors">
      <span>TODOs: ${factors.todoCount}</span>
      <span>Errors: ${factors.errorCount}</span>
      <span>Fails: ${factors.consecutiveFails}</span>
    </div>` : ''}
  </div>

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

export function deactivate(): void {
  diagWatcher?.stop();
  decorations?.stop();
  corruptionWatcher?.stop();
  if (idleTimer) clearTimeout(idleTimer);
  panel?.dispose();
}
