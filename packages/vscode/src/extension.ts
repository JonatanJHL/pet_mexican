// ============================================================
//  xolito/packages/vscode/src/extension.ts  (v4 — con decoraciones)
// ============================================================

import * as vscode from 'vscode';
import { Xolito, generateSpriteSVG } from '@xolito/core';
import type { XolitoEvent, XolitoMood } from '@xolito/core';
import { DiagnosticsWatcher } from './diagnostics-watcher.js';
import { XolitoDecorations } from './decorations.js';

let xolito:       Xolito;
let statusBar:    vscode.StatusBarItem;
let diagWatcher:  DiagnosticsWatcher;
let decorations:  XolitoDecorations;
let idleTimer:    NodeJS.Timeout | undefined;
let panel:        vscode.WebviewPanel | undefined;

const NOTIF_COOLDOWN = 8000;
let   lastNotifTime  = 0;

const MOOD_ICONS: Record<XolitoMood, string> = {
  idle:'🦎', happy:'🦎✨', mad:'🦎💢', sleepy:'🦎💤', sassy:'🦎👀',
  proud:'🦎⭐', worried:'🦎😬', hyped:'🦎🔥', tired:'🦎😮', judging:'🦎🧐',
};

export function activate(context: vscode.ExtensionContext): void {
  xolito = new Xolito({ spiciness: 3, language: 'spanglish' });

  // Status bar
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'xolito.show';
  statusBar.show();

  // Watcher LSP
  diagWatcher = new DiagnosticsWatcher((event, detail) => fireEvent(event, detail));
  diagWatcher.start();

  // Decoraciones inline — Xolito aparece en el código
  decorations = new XolitoDecorations();
  decorations.start();

  context.subscriptions.push(
    vscode.commands.registerCommand('xolito.show',  showPanel),
    vscode.commands.registerCommand('xolito.greet', () => fireEvent('greeted')),
    vscode.commands.registerCommand('xolito.toggle', toggleDecorations),
    statusBar,
    { dispose: () => { diagWatcher.stop(); decorations.stop(); } },
    vscode.workspace.onDidSaveTextDocument(onSave),
    vscode.tasks.onDidEndTaskProcess(onTaskEnd),
    vscode.window.onDidChangeTextEditorSelection(() => resetIdleTimer()),
    vscode.workspace.onDidChangeTextDocument(() => resetIdleTimer()),
  );

  // Terminal watcher (API nueva, envuelto en try/catch)
  try {
    const td = (vscode.window as any).onDidWriteTerminalData(
      (e: { data: string }) => onTerminalData(e.data)
    );
    if (td) context.subscriptions.push(td);
  } catch (_) {}

  fireEvent('greeted');
  resetIdleTimer();
}

// ── Handlers ─────────────────────────────────────────────────

function onSave(doc: vscode.TextDocument): void {
  const text = doc.getText();
  if (/console\.log/.test(text))      { fireEvent('console_log_left'); return; }
  if (/\/\/\s*TODO/i.test(text))      { fireEvent('todo_comment');     return; }
  if (/\{[^{}]{3000,}\}/s.test(text)) { fireEvent('long_function');    return; }
  const isCode = ['typescript','javascript','typescriptreact','javascriptreact']
    .includes(doc.languageId);
  if (isCode && !/\/\/|\/\*/.test(text) && text.length > 400)
    fireEvent('save_no_comments');
}

function onTaskEnd(e: vscode.TaskProcessEndEvent): void {
  const name = e.execution.task.name.toLowerCase();
  const ok   = e.exitCode === 0;
  if (name.includes('build') || name.includes('tsc'))
    fireEvent(ok ? 'build_success' : 'build_fail');
  else if (name.includes('test') || name.includes('vitest'))
    fireEvent(ok ? 'test_pass' : 'test_fail');
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

function resetIdleTimer(): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    const ev = xolito.checkIdle();
    if (ev) fireEvent(ev);
  }, 600000);
}

// ── Core ──────────────────────────────────────────────────────

function fireEvent(event: XolitoEvent, _detail?: string): void {
  const { text } = xolito.react(event);
  updateStatusBar(text);
  const now = Date.now();
  if (now - lastNotifTime < NOTIF_COOLDOWN) return;
  lastNotifTime = now;
  const sev = getMoodSeverity(xolito.getMood());
  const msg = `🦎 Xolito: ${text}`;
  if (sev === 'error')        vscode.window.showErrorMessage(msg);
  else if (sev === 'warning') vscode.window.showWarningMessage(msg);
  else                         vscode.window.showInformationMessage(msg);
  if (panel) updatePanel();
}

function updateStatusBar(message: string): void {
  const icon = MOOD_ICONS[xolito.getMood()] ?? '🦎';
  statusBar.text    = `${icon} ${message.length > 38 ? message.slice(0,35)+'...' : message}`;
  statusBar.tooltip = `${message}\n\nClic para abrir Xolito`;
}

function getMoodSeverity(mood: XolitoMood): 'info' | 'warning' | 'error' {
  if (['mad','tired'].includes(mood))        return 'error';
  if (['worried','judging'].includes(mood))  return 'warning';
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

// ── Panel webview ─────────────────────────────────────────────

function showPanel(): void {
  if (panel) { panel.reveal(vscode.ViewColumn.Beside); updatePanel(); return; }
  panel = vscode.window.createWebviewPanel(
    'xolito', '🦎 Xolito', vscode.ViewColumn.Beside, { enableScripts: true }
  );
  panel.onDidDispose(() => { panel = undefined; });
  updatePanel();
}

function updatePanel(): void {
  if (!panel) return;
  const mood   = xolito.getMood();
  const errors = xolito.getErrorCount();
  const counts = diagWatcher.getCurrentCounts();
  const sprite = generateSpriteSVG(mood, 160);
  const phrase = xolito.react('greeted').text;
  const mColor: Record<XolitoMood, string> = {
    idle:'#4ec9b0', happy:'#4ec9b0', proud:'#4ec9b0', hyped:'#4ec9b0',
    mad:'#f44747',  tired:'#f44747',
    worried:'#cca700', sassy:'#cca700', judging:'#cca700', sleepy:'#888888',
  };
  const mc = mColor[mood];

  panel.webview.html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',sans-serif;background:#1e1e1e;color:#d4d4d4;
       display:flex;flex-direction:column;align-items:center;padding:2rem 1rem;min-height:100vh}
  .name{font-size:1.4rem;color:#4ec9b0;font-weight:700;margin-bottom:.25rem}
  .sprite{margin:.75rem 0;animation:float 3s ease-in-out infinite}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  .badge{font-size:.8rem;padding:3px 12px;border-radius:99px;
         background:${mc}22;color:${mc};border:1px solid ${mc}55;
         margin-bottom:.75rem;font-family:monospace}
  .phrase{font-size:.9rem;color:#9cdcfe;text-align:center;max-width:240px;
          line-height:1.5;font-style:italic;margin-bottom:1.25rem}
  .stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;
         max-width:240px;margin-bottom:1rem}
  .stat{background:#2d2d2d;border-radius:8px;padding:8px;text-align:center}
  .sv{font-size:1.4rem;font-weight:700}
  .sl{font-size:.65rem;color:#666;margin-top:2px}
  .hint{font-size:.7rem;color:#444;text-align:center;margin-top:.5rem;line-height:1.4}
  .btn{margin-top:1rem;padding:6px 16px;border-radius:6px;border:1px solid #555;
       background:transparent;color:#ccc;font-size:.8rem;cursor:pointer}
  .btn:hover{background:#2d2d2d}
</style></head>
<body>
  <div class="name">🦎 Xolito</div>
  <div class="sprite">${sprite}</div>
  <div class="badge">${mood}</div>
  <div class="phrase">"${phrase}"</div>
  <div class="stats">
    <div class="stat">
      <div class="sv" style="color:#f44747">${counts.errors}</div>
      <div class="sl">errores</div>
    </div>
    <div class="stat">
      <div class="sv" style="color:#cca700">${counts.warnings}</div>
      <div class="sl">warnings</div>
    </div>
    <div class="stat">
      <div class="sv" style="color:#4ec9b0">${errors}</div>
      <div class="sl">racha</div>
    </div>
    <div class="stat">
      <div class="sv" style="color:${mc}">${mood}</div>
      <div class="sl">mood</div>
    </div>
  </div>
  <div class="hint">
    Xolito aparece inline en tu código<br>junto a errores, warnings y console.logs
  </div>
  <div class="footer" style="font-size:.65rem;color:#444;margin-top:1.5rem;text-align:center">
    "Aquí estoy, cuidándote...<br>y juzgándote con cariño."
  </div>
</body></html>`;
}

export function deactivate(): void {
  diagWatcher?.stop();
  decorations?.stop();
  if (idleTimer) clearTimeout(idleTimer);
  panel?.dispose();
}
