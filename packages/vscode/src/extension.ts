// ============================================================
//  xolito/packages/vscode/src/extension.ts
//  v7 — Boss Mode, Linter Spanglish, Sistema de Estrés,
//       Contexto Dinámico (viernes 4pm, finde)
// ============================================================

import * as vscode from 'vscode';
import * as fs from 'fs';
import { Xolito } from '@xolito/core';
import type { XolitoEvent, XolitoMood } from '@xolito/core';
import { DiagnosticsWatcher } from './diagnostics-watcher.js';
import { XolitoDecorations } from './decorations.js';

let xolito:      Xolito;
let statusBar:   vscode.StatusBarItem;
let diagWatcher: DiagnosticsWatcher;
let decorations: XolitoDecorations;
let idleTimer:   NodeJS.Timeout | undefined;
let panel:       vscode.WebviewPanel | undefined;
let extContext:  vscode.ExtensionContext;

// ── Boss Mode ────────────────────────────────────────────────
let isPanicMode    = false;
let originalEditor : vscode.TextEditor | undefined;
let dummyDocUri    : vscode.Uri | undefined;

// ── Stats de sesión ──────────────────────────────────────────
const sessionStart = Date.now();
let   buildsToday  = 0;
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
  panic:'💼🦎',
};

const MOOD_COLORS: Record<XolitoMood, string> = {
  idle:'#4ec9b0', happy:'#4ec9b0', proud:'#4ec9b0', hyped:'#4ec9b0',
  mad:'#f44747',  tired:'#f44747',
  worried:'#cca700', sassy:'#cca700', judging:'#cca700', sleepy:'#888888',
  panic:'#a8ffb2',
};

// ── Frases de estrés alto (5+ errores seguidos) ───────────────
const STRESS_PHRASES = [
  { text: "Ya van 5 errores seguidos, mijo. ¿Todo bien?", mood: 'tired' as XolitoMood },
  { text: "El compilador te odia hoy. Respira.", mood: 'tired' as XolitoMood },
  { text: "5 errores seguidos. Xolito oficialmente preocupado.", mood: 'tired' as XolitoMood },
  { text: "¿Cuándo fue la última vez que compiló? Pregunta sincera.", mood: 'mad' as XolitoMood },
  { text: "Error tras error. ¿Comiste? A veces eso ayuda.", mood: 'worried' as XolitoMood },
  { text: "Tantos errores seguidos que ya ni cuento.", mood: 'mad' as XolitoMood },
  { text: "Párate, respira, lee el error completo. En serio.", mood: 'worried' as XolitoMood },
];

// ── Frases de viernes tarde / fin de semana ───────────────────
const FRIDAY_PHRASES = [
  { text: "Viernes a las 4pm. El código puede esperar al lunes, mijo.", mood: 'sassy' as XolitoMood },
  { text: "¿Sigues aquí en viernes por la tarde? La vida te espera.", mood: 'worried' as XolitoMood },
  { text: "Viernes 4pm. Cierra el IDE y agarra una chela.", mood: 'hyped' as XolitoMood },
  { text: "Son las 4 del viernes. El código puede esperar, tú no.", mood: 'sassy' as XolitoMood },
  { text: "Viernes tarde. ¿A qué hora es el taco run?", mood: 'hyped' as XolitoMood },
];

const WEEKEND_RELAX_PHRASES = [
  { text: "Es fin de semana. El código puede esperar al lunes.", mood: 'worried' as XolitoMood },
  { text: "¿Código en sábado? Sal. Respira. Come tacos.", mood: 'sassy' as XolitoMood },
  { text: "Domingo de código. Tu cuerpo merece descanso, mijo.", mood: 'worried' as XolitoMood },
  { text: "Finde programando. Tu therapist no aprueba, yo tampoco.", mood: 'judging' as XolitoMood },
  { text: "¿No tienes algo mejor que hacer un domingo?", mood: 'sassy' as XolitoMood },
];

// ── Patrones Spanglish / Chambazos ───────────────────────────
const SPANGLISH_PATTERNS = [
  /\bget_[a-z]*[A-Z]|\bfetch[_]?[A-ZÁÉÍÓÚÑ]/,  // fetchUsuarios, get_datos
  /\b[a-z]+_[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b/,         // get_Datos, set_Nombre
  /\b(get|set|fetch|update|delete|create)[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/,  // getDatos, setNombre
  /\b[a-záéíóúñ]{3,}[A-Z][a-z]+[A-Z]/,          // mezcla camelCase con tildes
];

const SPANGLISH_PHRASES = [
  { text: "get_datos_cliente detectado. ¿Español o inglés? Decide.", mood: 'sassy' as XolitoMood },
  { text: "fetchUsuarios. Mijo, consistencia. Elige un idioma.", mood: 'judging' as XolitoMood },
  { text: "Nombre en spanglish. El código no sabe qué eres.", mood: 'sassy' as XolitoMood },
  { text: "Variables en dos idiomas. Xolito está confundido.", mood: 'judging' as XolitoMood },
  { text: "Spanglish en el código. Ni tú sabes qué hace.", mood: 'mad' as XolitoMood },
];

// ── Código dummy apantalla-jefes ──────────────────────────────
const GODÍN_CPP_CODE = `/**
 * @fileoverview Enterprise Cloud Matrix Sync Core
 * @version 14.8.2-stable  
 * @security-level CRITICAL_INFRASTRUCTURE
 * @author Platform Engineering Team
 * @copyright 2024 — Confidential
 */

#pragma once
#include <iostream>
#include <vector>
#include <memory>
#include <thread>
#include <future>
#include <mutex>
#include <atomic>
#include <functional>
#include <unordered_map>

namespace Enterprise::Core::Network::Optimizer {

    /**
     * @brief Distributed cluster node abstraction with
     *        lock-free memory allocation semantics.
     */
    template <typename T, size_t Alignment = 64>
    class alignas(Alignment) MemoryClusterBalancer {
    private:
        std::vector<std::shared_ptr<T>>         nodeRegistry;
        std::unordered_map<size_t, std::weak_ptr<T>> nodeCache;
        mutable std::mutex                      allocationMutex;
        std::atomic<size_t>                     totalAllocations{0};

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

        /**
         * @brief Synchronizes distributed matrices across
         *        the cluster thread pool asynchronously.
         * @param threadPoolDepth Depth of the execution pool.
         * @return std::future<bool> resolving on completion.
         */
        [[nodiscard]] auto synchronizeClusterMatrices(
            size_t threadPoolDepth,
            std::function<void(size_t)> progressCallback = nullptr
        ) -> std::future<bool> {
            return std::async(std::launch::async,
                [this, threadPoolDepth, cb = std::move(progressCallback)]() mutable -> bool {
                    std::lock_guard<std::mutex> lock(this->allocationMutex);
                    this->nodeRegistry.reserve(threadPoolDepth);
                    for (size_t i = 0; i < threadPoolDepth; ++i) {
                        auto node = std::make_shared<T>();
                        if (!this->validateNodeIntegrity(node)) return false;
                        this->nodeRegistry.emplace_back(std::move(node));
                        this->nodeCache.emplace(i, this->nodeRegistry.back());
                        ++this->totalAllocations;
                        if (cb) cb(i);
                    }
                    return true;
                }
            );
        }

        [[nodiscard]] size_t getTotalAllocations() const noexcept {
            return totalAllocations.load(std::memory_order_acquire);
        }
    };

    // ── Singleton registry for cluster lifecycle management ──
    template <typename T>
    using ClusterHandle = std::unique_ptr<MemoryClusterBalancer<T>>;

    template <typename T>
    [[nodiscard]] ClusterHandle<T> createCluster(size_t depth) {
        auto cluster = std::make_unique<MemoryClusterBalancer<T>>();
        cluster->synchronizeClusterMatrices(depth).wait();
        return cluster;
    }

} // namespace Enterprise::Core::Network::Optimizer
`;

// ── Helpers de contexto temporal ─────────────────────────────
function isFridayAfternoon(): boolean {
  const now = new Date();
  return now.getDay() === 5 && now.getHours() >= 16;
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

function getContextualOverride(baseEvent: XolitoEvent): { text: string; mood: XolitoMood } | null {
  // Viernes tarde — intercept en eventos de error/save
  if (isFridayAfternoon() && Math.random() < 0.4) {
    const p = FRIDAY_PHRASES[Math.floor(Math.random() * FRIDAY_PHRASES.length)];
    return p;
  }
  // Fin de semana — intercept ocasional
  if (isWeekend() && Math.random() < 0.3) {
    const p = WEEKEND_RELAX_PHRASES[Math.floor(Math.random() * WEEKEND_RELAX_PHRASES.length)];
    return p;
  }
  return null;
}

function getSessionTime(): string {
  const mins = Math.floor((Date.now() - sessionStart) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function getBuildRate(): string {
  if (buildsToday === 0) return '—';
  return `${Math.round((buildsSuccess / buildsToday) * 100)}%`;
}

// ── Activate ─────────────────────────────────────────────────
export function activate(context: vscode.ExtensionContext): void {
  extContext = context;
  xolito = new Xolito({ spiciness: 3, language: 'spanglish' });

  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'xolito.show';
  statusBar.show();

  diagWatcher = new DiagnosticsWatcher((event, detail) => fireEvent(event, detail));
  diagWatcher.start();

  decorations = new XolitoDecorations();
  decorations.start();

  context.subscriptions.push(
    vscode.commands.registerCommand('xolito.show',        showPanel),
    vscode.commands.registerCommand('xolito.greet',       () => fireEvent('greeted')),
    vscode.commands.registerCommand('xolito.toggle',      toggleDecorations),
    vscode.commands.registerCommand('xolito.panicButton', handlePanicButton),
    statusBar,
    { dispose: () => { diagWatcher.stop(); decorations.stop(); } },
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

// ── onSave — Linter de Chambazos + Spanglish ─────────────────
function onSave(doc: vscode.TextDocument): void {
  const text = doc.getText();
  filesChanged.add(doc.fileName);

  // Linter Spanglish — detecta mezcla de idiomas en nombres
  if (doc.languageId !== 'markdown') {
    for (const pattern of SPANGLISH_PATTERNS) {
      if (pattern.test(text)) {
        const phrase = SPANGLISH_PHRASES[Math.floor(Math.random() * SPANGLISH_PHRASES.length)];
        forcePhrase(phrase.text, phrase.mood);
        return;
      }
    }
  }

  if (/console\.log/.test(text))      { fireEvent('console_log_left'); return; }
  if (/\/\/\s*TODO/i.test(text))      { fireEvent('todo_comment');     return; }
  if (/\{[^{}]{3000,}\}/s.test(text)) { fireEvent('long_function');    return; }

  const isCode = ['typescript','javascript','typescriptreact','javascriptreact'].includes(doc.languageId);
  if (isCode && !/\/\/|\/\*/.test(text) && text.length > 400) {
    fireEvent('save_no_comments');
  }
}

function onTaskEnd(e: vscode.TaskProcessEndEvent): void {
  const name = e.execution.task.name.toLowerCase();
  const ok   = e.exitCode === 0;
  if (name.includes('build') || name.includes('tsc')) {
    if (ok) { consecutiveErrors = 0; buildsToday++; buildsSuccess++; fireEvent('build_success'); }
    else    { consecutiveErrors++; buildsToday++; buildsFail++; checkStress(); fireEvent('build_fail'); }
  } else if (name.includes('test') || name.includes('vitest')) {
    if (ok) { consecutiveErrors = 0; fireEvent('test_pass'); }
    else    { consecutiveErrors++; checkStress(); fireEvent('test_fail'); }
  }
}

function onTerminalData(data: string): void {
  if (/git push.*--force/i.test(data))                      fireEvent('git_force_push');
  else if (/git push.*origin (main|master)/i.test(data))    fireEvent('push_to_main');
  else if (/npm install|pnpm install|yarn add/i.test(data)) fireEvent('npm_install');
  else if (/CONFLICT \(content\)/i.test(data))              fireEvent('merge_conflict');
  const h = new Date().getHours(), day = new Date().getDay();
  if (h >= 23 || h < 4)       fireEvent('late_night_coding');
  if (day === 0 || day === 6) fireEvent('weekend_coding');
}

// ── Sistema de estrés ────────────────────────────────────────
function checkStress(): void {
  if (consecutiveErrors >= STRESS_THRESHOLD) {
    const phrase = STRESS_PHRASES[Math.floor(Math.random() * STRESS_PHRASES.length)];
    forcePhrase(phrase.text, phrase.mood);
  }
}

// ── forcePhrase — bypass del core para frases de sistema ─────
function forcePhrase(text: string, mood: XolitoMood): void {
  lastPhrase = text;
  const now2 = new Date();
  const timeStr = `${now2.getHours().toString().padStart(2,'0')}:${now2.getMinutes().toString().padStart(2,'0')}`;
  messageHistory.unshift({ text, mood, time: timeStr });
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
  // Contexto dinámico — viernes tarde y fin de semana
  const override = getContextualOverride(event);
  if (override) {
    forcePhrase(override.text, override.mood);
    return;
  }

  const { text } = xolito.react(event);

  if (event === 'build_success') { buildsToday++; buildsSuccess++; }
  if (event === 'build_fail')    { buildsToday++; buildsFail++; }

  lastPhrase = text;
  const now2 = new Date();
  const timeStr = `${now2.getHours().toString().padStart(2,'0')}:${now2.getMinutes().toString().padStart(2,'0')}`;
  messageHistory.unshift({ text, mood: xolito.getMood(), time: timeStr });
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
  if (isPanicMode) return; // No tocar la status bar en modo pánico
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
  if (['mad','tired','panic'].includes(mood))        return 'error';
  if (['worried','judging'].includes(mood))          return 'warning';
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

// ── Panel ────────────────────────────────────────────────────
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
  const candidates = [
    `assets/xolito_${mood}.png`,
    'assets/xolito_idle.png',
    'assets/sprite_xolito.png',
  ];
  for (const c of candidates) {
    const uri = vscode.Uri.joinPath(extContext.extensionUri, c);
    if (fs.existsSync(uri.fsPath)) return panel.webview.asWebviewUri(uri).toString();
  }
  return '';
}

function updatePanel(): void {
  if (!panel) return;
  const mood       = xolito.getMood();
  const errors     = xolito.getErrorCount();
  const counts     = diagWatcher.getCurrentCounts();
  const phrase     = lastPhrase;
  const spriteUrl  = getSpriteUri(mood);
  const mc         = MOOD_COLORS[mood] ?? '#4ec9b0';

  const isPanic = isPanicMode;

  const spriteAnim = mood === 'mad' || mood === 'panic'
    ? 'animation: shake 0.4s ease-in-out 2, float 3s ease-in-out 0.8s infinite'
    : mood === 'sleepy' || mood === 'tired'
    ? 'animation: float 5s ease-in-out infinite; opacity:0.85'
    : mood === 'hyped'
    ? 'animation: float 1s ease-in-out infinite'
    : 'animation: float 3s ease-in-out infinite';

  // Fondo especial en modo pánico
  const panelBg = isPanic ? '#0a1a0a' : '#1e1e1e';
  const panelBorder = isPanic ? 'border: 1px solid #a8ffb255;' : '';

  panel.webview.html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none'; img-src ${panel.webview.cspSource} data:; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',sans-serif;background:${panelBg};color:#d4d4d4;
       display:flex;flex-direction:column;align-items:center;padding:1.5rem 1rem;min-height:100vh;
       transition:background .4s ease;${panelBorder}}
  .name{font-size:1.3rem;color:${isPanic ? '#a8ffb2' : '#4ec9b0'};font-weight:700;margin-bottom:.5rem;
        font-family:${isPanic ? 'monospace' : 'inherit'}}
  ${isPanic ? '.name::before{content:"[PROD] "}.name::after{content:" — LIVE"}' : ''}
  .sprite-wrap{margin:.5rem 0 .75rem;filter:drop-shadow(0 4px 16px ${mc}44)}
  .sprite{width:160px;height:160px;object-fit:contain;image-rendering:pixelated;${spriteAnim}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
  .badge{font-size:.8rem;padding:3px 12px;border-radius:99px;
         background:${mc}22;color:${mc};border:1px solid ${mc}55;margin-bottom:.75rem;font-family:monospace}
  .phrase{font-size:.88rem;color:${isPanic ? '#a8ffb2' : '#9cdcfe'};text-align:center;max-width:220px;
          line-height:1.5;font-style:italic;margin-bottom:1.25rem;
          font-family:${isPanic ? 'monospace' : 'inherit'}}
  .section-title{font-size:.65rem;color:#555;text-transform:uppercase;letter-spacing:.08em;
                 width:100%;max-width:220px;margin:.75rem 0 .3rem;text-align:left}
  .stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:220px;margin-bottom:1rem}
  .stat{background:#2d2d2d;border-radius:8px;padding:8px;text-align:center}
  .sv{font-size:1.3rem;font-weight:700} .sl{font-size:.65rem;color:#666;margin-top:2px}
  .stat-bar-wrap{width:100%;max-width:220px;margin:.5rem 0}
  .stat-bar-label{font-size:.7rem;color:#666;margin-bottom:4px}
  .stat-bar-bg{background:#2d2d2d;border-radius:99px;height:6px;overflow:hidden}
  .stat-bar-fill{background:#4ec9b0;height:100%;border-radius:99px;transition:width .4s ease}
  .stress-bar-fill{background:#f44747}
  .history-title{font-size:.65rem;color:#555;text-transform:uppercase;letter-spacing:.08em;
                 width:100%;max-width:220px;margin:.75rem 0 .3rem;text-align:left}
  .history{width:100%;max-width:220px}
  .history-item{display:flex;gap:6px;padding:4px 0;border-bottom:1px solid #2a2a2a;align-items:flex-start}
  .hi-time{font-size:.65rem;color:#444;font-family:monospace;white-space:nowrap;margin-top:1px}
  .hi-text{font-size:.72rem;color:#7a7a7a;font-style:italic;line-height:1.4}
  .panic-banner{background:#a8ffb211;border:1px solid #a8ffb244;border-radius:8px;
                padding:6px 12px;font-size:.72rem;color:#a8ffb2;font-family:monospace;
                width:100%;max-width:220px;text-align:center;margin-bottom:1rem;
                animation:blink 1.5s ease-in-out infinite}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.5}}
  .footer{font-size:.65rem;color:#333;text-align:center;margin-top:1.5rem}
</style></head>
<body>
  <div class="name">🦎 Xolito</div>
  ${isPanic ? '<div class="panic-banner">🔒 MODO GODÍN ACTIVADO — DISIMULA</div>' : ''}
  <div class="sprite-wrap">
    ${spriteUrl
      ? `<img class="sprite" src="${spriteUrl}" alt="Xolito ${mood}"/>`
      : `<div style="font-size:100px;line-height:1;text-align:center;${spriteAnim}">🦎</div>`}
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

  <div class="section-title">Sesión</div>
  <div class="stats">
    <div class="stat"><div class="sv" style="color:#9cdcfe">${getSessionTime()}</div><div class="sl">tiempo</div></div>
    <div class="stat"><div class="sv" style="color:#9cdcfe">${filesChanged.size}</div><div class="sl">archivos</div></div>
    <div class="stat"><div class="sv" style="color:${buildsSuccess > 0 ? '#4ec9b0' : '#666'}">${buildsSuccess}</div><div class="sl">builds ok</div></div>
    <div class="stat"><div class="sv" style="color:${buildsFail > 0 ? '#f44747' : '#666'}">${buildsFail}</div><div class="sl">builds fail</div></div>
  </div>

  <div class="stat-bar-wrap">
    <div class="stat-bar-label">Tasa de éxito: <span style="color:${getBuildRate() === '—' ? '#444' : '#4ec9b0'}">${getBuildRate()}</span></div>
    <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${buildsToday > 0 ? Math.round((buildsSuccess/buildsToday)*100) : 0}%"></div></div>
  </div>

  <div class="stat-bar-wrap">
    <div class="stat-bar-label">Estrés: <span style="color:${consecutiveErrors >= STRESS_THRESHOLD ? '#f44747' : '#666'}">${consecutiveErrors}/${STRESS_THRESHOLD}</span></div>
    <div class="stat-bar-bg"><div class="stat-bar-fill stress-bar-fill" style="width:${Math.min((consecutiveErrors/STRESS_THRESHOLD)*100,100)}%"></div></div>
  </div>

  <div class="history-title">Últimas frases</div>
  <div class="history">
    ${messageHistory.map(m => `<div class="history-item"><span class="hi-time">${m.time}</span><span class="hi-text">"${m.text}"</span></div>`).join('')}
  </div>
  <div class="footer">"Aquí estoy, cuidándote...<br>y juzgándote con cariño."</div>
</body></html>`;
}

// ── Boss Mode ─────────────────────────────────────────────────
async function handlePanicButton(): Promise<void> {
  isPanicMode = !isPanicMode;

  if (isPanicMode) {
    // 1. Guardar el editor real donde estaba el dev
    originalEditor = vscode.window.activeTextEditor;

    // 2. Disparar evento al core
    fireEvent('boss_alert');

    // 3. Camuflar la status bar
    statusBar.text    = `💼 [PROD] cluster_matrix_balancer.cpp`;
    statusBar.color   = '#a8ffb2';
    statusBar.tooltip = 'Enterprise Platform Core — v14.8.2';

    // 4. Abrir documento C++ apantalla-jefes
    const doc = await vscode.workspace.openTextDocument({
      language: 'cpp',
      content: GODÍN_CPP_CODE,
    });
    dummyDocUri = doc.uri;
    await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);

    if (panel) updatePanel();

  } else {
    // --- Falsa alarma — el jefe ya se fue ---
    statusBar.color   = undefined;
    statusBar.tooltip = undefined;

    // Cerrar el archivo dummy si sigue abierto
    if (dummyDocUri) {
    for (const tabGroup of vscode.window.tabGroups.all) {
      for (const tab of tabGroup.tabs) {
        const input = tab.input as any;
        if (input?.uri?.toString() === dummyDocUri.toString()) {
          await vscode.window.tabGroups.close(tab);
        }
      }
    }
  }

    // Regresar al archivo real
    if (originalEditor) {
      await vscode.window.showTextDocument(
        originalEditor.document,
        originalEditor.viewColumn
      );
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
  if (idleTimer) clearTimeout(idleTimer);
  panel?.dispose();
}