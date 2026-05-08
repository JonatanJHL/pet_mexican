// ============================================================
//  xolito/packages/vscode/src/extension.ts  (v6 — sprites por mood)
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

const NOTIF_COOLDOWN = 8000;
let   lastPhrase     = "¡Órale! Xolito en línea. 🦎";
const messageHistory: { text: string; mood: string; time: string }[] = [];
let   lastNotifTime  = 0;

const MOOD_ICONS: Record<XolitoMood, string> = {
  idle:'🦎', happy:'🦎✨', mad:'🦎💢', sleepy:'🦎💤', sassy:'🦎👀',
  proud:'🦎⭐', worried:'🦎😬', hyped:'🦎🔥', tired:'🦎😮', judging:'🦎🧐',
};

const MOOD_COLORS: Record<XolitoMood, string> = {
  idle:'#4ec9b0', happy:'#4ec9b0', proud:'#4ec9b0', hyped:'#4ec9b0',
  mad:'#f44747',  tired:'#f44747',
  worried:'#cca700', sassy:'#cca700', judging:'#cca700', sleepy:'#888888',
};

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
    vscode.commands.registerCommand('xolito.show',   showPanel),
    vscode.commands.registerCommand('xolito.greet',  () => fireEvent('greeted')),
    vscode.commands.registerCommand('xolito.toggle', toggleDecorations),
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

function onSave(doc: vscode.TextDocument): void {
  const text = doc.getText();
  if (/console\.log/.test(text))      { fireEvent('console_log_left'); return; }
  if (/\/\/\s*TODO/i.test(text))      { fireEvent('todo_comment');     return; }
  if (/\{[^{}]{3000,}\}/s.test(text)) { fireEvent('long_function');    return; }
  const isCode = ['typescript','javascript','typescriptreact','javascriptreact'].includes(doc.languageId);
  if (isCode && !/\/\/|\/\*/.test(text) && text.length > 400) fireEvent('save_no_comments');
}

function onTaskEnd(e: vscode.TaskProcessEndEvent): void {
  const name = e.execution.task.name.toLowerCase();
  const ok   = e.exitCode === 0;
  if (name.includes('build') || name.includes('tsc'))        fireEvent(ok ? 'build_success' : 'build_fail');
  else if (name.includes('test') || name.includes('vitest')) fireEvent(ok ? 'test_pass' : 'test_fail');
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
  idleTimer = setTimeout(() => { const ev = xolito.checkIdle(); if (ev) fireEvent(ev); }, 600000);
}

function fireEvent(event: XolitoEvent, _detail?: string): void {
  const { text } = xolito.react(event);
  updateStatusBar(text);

  // Guardar en historial y como última frase
  lastPhrase = text;
  const now2 = new Date();
  const timeStr = now2.getHours().toString().padStart(2,'0') + ':' + now2.getMinutes().toString().padStart(2,'0');
  messageHistory.unshift({ text, mood: xolito.getMood(), time: timeStr });
  if (messageHistory.length > 5) messageHistory.pop();

  const now = Date.now();
  if (now - lastNotifTime < NOTIF_COOLDOWN) { if (panel) updatePanel(); return; }
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

function showPanel(): void {
  if (panel) { panel.reveal(vscode.ViewColumn.Beside); updatePanel(); return; }
  panel = vscode.window.createWebviewPanel(
    'xolito', '🦎 Xolito', vscode.ViewColumn.Beside,
    { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(extContext.extensionUri, 'assets')] }
  );
  panel.onDidDispose(() => { panel = undefined; });
  updatePanel();
}

// Obtiene URI del sprite PNG para el mood actual
function getSpriteUri(mood: XolitoMood): string {
  if (!panel || !extContext) return '';
  const candidates = [
    `assets/xolito_${mood}.png`,   // sprite específico del mood
    'assets/xolito_idle.png',      // idle fallback
    'assets/sprite_xolito.png',    // spritesheet fallback
  ];
  for (const c of candidates) {
    const uri = vscode.Uri.joinPath(extContext.extensionUri, c);
    if (fs.existsSync(uri.fsPath)) return panel.webview.asWebviewUri(uri).toString();
  }
  return '';
}

function updatePanel(): void {
  if (!panel) return;
  const mood    = xolito.getMood();
  const errors  = xolito.getErrorCount();
  const counts  = diagWatcher.getCurrentCounts();
  const phrase  = lastPhrase;
  const spriteUrl = getSpriteUri(mood);
  const mc = MOOD_COLORS[mood];

  // Animación CSS según mood
  const spriteAnim = mood === 'mad'
    ? 'animation: shake 0.4s ease-in-out 2, float 3s ease-in-out 0.8s infinite'
    : mood === 'sleepy' || mood === 'tired'
    ? 'animation: float 5s ease-in-out infinite; opacity:0.85'
    : mood === 'hyped'
    ? 'animation: float 1s ease-in-out infinite'
    : 'animation: float 3s ease-in-out infinite';

  panel.webview.html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none'; img-src ${panel.webview.cspSource} data:; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',sans-serif;background:#1e1e1e;color:#d4d4d4;
       display:flex;flex-direction:column;align-items:center;padding:1.5rem 1rem;min-height:100vh}
  .name{font-size:1.3rem;color:#4ec9b0;font-weight:700;margin-bottom:.5rem}
  .sprite-wrap{margin:.5rem 0 .75rem;filter:drop-shadow(0 4px 16px ${mc}44)}
  .sprite{width:160px;height:160px;object-fit:contain;image-rendering:pixelated;${spriteAnim}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
  .badge{font-size:.8rem;padding:3px 12px;border-radius:99px;
         background:${mc}22;color:${mc};border:1px solid ${mc}55;margin-bottom:.75rem;font-family:monospace}
  .phrase{font-size:.88rem;color:#9cdcfe;text-align:center;max-width:220px;line-height:1.5;font-style:italic;margin-bottom:1.25rem}
  .stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:220px;margin-bottom:1rem}
  .stat{background:#2d2d2d;border-radius:8px;padding:8px;text-align:center}
  .sv{font-size:1.3rem;font-weight:700} .sl{font-size:.65rem;color:#666;margin-top:2px}
  .hint{font-size:.68rem;color:#444;text-align:center;line-height:1.4;margin-top:.5rem}
  .footer{font-size:.65rem;color:#333;text-align:center;margin-top:1.5rem}
</style></head>
<body>
  <div class="name">🦎 Xolito</div>
  <div class="sprite-wrap">
    ${spriteUrl
      ? `<img class="sprite" src="${spriteUrl}" alt="Xolito ${mood}"/>`
      : `<div style="font-size:100px;line-height:1;text-align:center;${spriteAnim}">🦎</div>`}
  </div>
  <div class="badge">${mood}</div>
  <div class="phrase">"${phrase}"</div>
  <div class="stats">
    <div class="stat"><div class="sv" style="color:#f44747">${counts.errors}</div><div class="sl">errores</div></div>
    <div class="stat"><div class="sv" style="color:#cca700">${counts.warnings}</div><div class="sl">warnings</div></div>
    <div class="stat"><div class="sv" style="color:#4ec9b0">${errors}</div><div class="sl">racha</div></div>
    <div class="stat"><div class="sv" style="color:${mc}">${mood}</div><div class="sl">mood</div></div>
  </div>
  <div class="hint">Xolito aparece inline en tu código<br>junto a errores, warnings y TODOs</div>
  <div class="footer">"Aquí estoy, cuidándote...<br>y juzgándote con cariño."</div>
</body></html>`;
}

export function deactivate(): void {
  diagWatcher?.stop();
  decorations?.stop();
  if (idleTimer) clearTimeout(idleTimer);
  panel?.dispose();
}
