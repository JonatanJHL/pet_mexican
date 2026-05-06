// ============================================================
//  xolito/packages/vscode/src/extension.ts
//  Extensión de VS Code para Xolito
//  Muestra al ajolote en el status bar y notificaciones
// ============================================================

import * as vscode from 'vscode';
import { Xolito } from '@xolito/core';
import type { XolitoEvent } from '@xolito/core';

const MOOD_ICONS: Record<string, string> = {
  idle:    '🦎',
  happy:   '🦎✨',
  mad:     '🦎💢',
  sleepy:  '🦎💤',
  sassy:   '🦎👀',
  proud:   '🦎⭐',
  worried: '🦎😬',
  hyped:   '🦎🔥',
  tired:   '🦎😮‍💨',
  judging: '🦎🧐',
};

let xolito: Xolito;
let statusBarItem: vscode.StatusBarItem;
let idleTimer: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext): void {
  xolito = new Xolito({ spiciness: 3, language: 'spanglish' });

  // ── Status bar ─────────────────────────────────────────
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right, 100
  );
  statusBarItem.command = 'xolito.show';
  updateStatusBar('¡Hola!');
  statusBarItem.show();

  // ── Comandos ────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('xolito.show', showXolito),
    vscode.commands.registerCommand('xolito.greet', () => fireEvent('greeted')),
    statusBarItem,
  );

  // ── Watchers de archivos ─────────────────────────────────
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(onSave),
  );

  // ── Task watcher (build/test) ────────────────────────────
  context.subscriptions.push(
    vscode.tasks.onDidEndTaskProcess(onTaskEnd),
  );

  // ── Git watcher (via SCM) ────────────────────────────────
  // Detectar push a main se hace via terminal watcher
  context.subscriptions.push(
    vscode.window.onDidWriteTerminalData(onTerminalData),
  );

  // ── Idle detector ────────────────────────────────────────
  resetIdleTimer();
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => resetIdleTimer()),
    vscode.workspace.onDidChangeTextDocument(() => resetIdleTimer()),
  );

  // Saludo inicial
  const { text } = xolito.react('greeted');
  notify(text, 'info');
  updateStatusBar(text);
}

// ── Handlers ──────────────────────────────────────────────────

function onSave(doc: vscode.TextDocument): void {
  const text = doc.getText();

  // ¿Tiene console.log?
  if (/console\.log/.test(text)) {
    fireEvent('console_log_left');
    return;
  }
  // ¿Tiene TODO viejito?
  if (/\/\/\s*TODO/.test(text)) {
    fireEvent('todo_comment');
    return;
  }
  // ¿Función muy larga? (heurística simple)
  const longFunc = /function\s+\w+[^{]*\{[^}]{2000,}/s.test(text);
  if (longFunc) {
    fireEvent('long_function');
    return;
  }
  // ¿Sin comentarios en archivos .ts/.js?
  if (doc.languageId === 'typescript' || doc.languageId === 'javascript') {
    const hasComments = /\/\/|\/\*/.test(text);
    if (!hasComments && text.length > 500) {
      fireEvent('save_no_comments');
    }
  }
}

function onTaskEnd(e: vscode.TaskProcessEndEvent): void {
  const name = e.execution.task.name.toLowerCase();
  const ok = e.exitCode === 0;

  if (name.includes('build') || name.includes('compile')) {
    fireEvent(ok ? 'build_success' : 'build_fail');
  } else if (name.includes('test')) {
    fireEvent(ok ? 'test_pass' : 'test_fail');
  }
}

function onTerminalData(e: vscode.TerminalDataWriteEvent): void {
  const data = e.data;

  if (/git push.*--force/.test(data)) {
    fireEvent('git_force_push');
  } else if (/git push.*origin main/.test(data) || /git push.*origin master/.test(data)) {
    fireEvent('push_to_main');
  } else if (/npm install|yarn|pnpm install/.test(data)) {
    fireEvent('npm_install');
  } else if (/CONFLICT/.test(data)) {
    fireEvent('merge_conflict');
  } else if (/SyntaxError|syntax error/i.test(data)) {
    fireEvent('syntax_error');
  }

  // Late night coding
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 4) {
    fireEvent('late_night_coding');
  }

  // Weekend
  const day = new Date().getDay();
  if (day === 0 || day === 6) {
    fireEvent('weekend_coding');
  }
}

function resetIdleTimer(): void {
  if (idleTimer) clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {
    const event = xolito.checkIdle();
    if (event) fireEvent(event);
  }, 10 * 60 * 1000); // 10 minutos
}

// ── Helpers ────────────────────────────────────────────────────

function fireEvent(event: XolitoEvent): void {
  const { text } = xolito.react(event);
  updateStatusBar(text);
  notify(text, getMoodSeverity(xolito.getMood()));
}

function updateStatusBar(message: string): void {
  const icon = MOOD_ICONS[xolito.getMood()] ?? '🦎';
  const short = message.length > 40 ? message.slice(0, 37) + '...' : message;
  statusBarItem.text = `${icon} ${short}`;
  statusBarItem.tooltip = message;
}

function notify(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (level === 'error') {
    vscode.window.showErrorMessage(`🦎 Xolito: ${message}`);
  } else if (level === 'warning') {
    vscode.window.showWarningMessage(`🦎 Xolito: ${message}`);
  } else {
    vscode.window.showInformationMessage(`🦎 Xolito: ${message}`);
  }
}

function getMoodSeverity(mood: string): 'info' | 'warning' | 'error' {
  if (['mad', 'tired'].includes(mood)) return 'error';
  if (['worried', 'judging'].includes(mood)) return 'warning';
  return 'info';
}

function showXolito(): void {
  const panel = vscode.window.createWebviewPanel(
    'xolito',
    '🦎 Xolito',
    vscode.ViewColumn.Beside,
    {}
  );
  panel.webview.html = getWebviewContent();
}

function getWebviewContent(): string {
  const mood = xolito.getMood();
  const icon = MOOD_ICONS[mood] ?? '🦎';
  const errorCount = xolito.getErrorCount();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
    }
    .pet { font-size: 4rem; margin: 1rem 0; animation: bounce 1s ease infinite; }
    @keyframes bounce {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .name { font-size: 1.5rem; color: #4ec9b0; font-weight: bold; }
    .mood { font-size: 0.9rem; color: #9cdcfe; margin: 0.5rem; }
    .errors { font-size: 0.8rem; color: #f44747; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="name">🦎 Xolito</div>
  <div class="pet">${icon}</div>
  <div class="mood">Mood: ${mood}</div>
  ${errorCount > 0 ? `<div class="errors">Errores seguidos: ${errorCount} 😬</div>` : ''}
  <p style="color:#6a9955;font-size:0.8rem;margin-top:2rem;text-align:center">
    "Aquí estoy, cuidándote... y juzgándote con cariño."
  </p>
</body>
</html>`;
}

export function deactivate(): void {
  if (idleTimer) clearTimeout(idleTimer);
}
