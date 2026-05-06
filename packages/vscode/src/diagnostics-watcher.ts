// ============================================================
//  xolito/packages/vscode/src/diagnostics-watcher.ts
//  Detecta errores reales del editor via LSP/diagnostics
//  Esto es lo que hace que Xolito reaccione a los squiggly rojos
// ============================================================

import * as vscode from 'vscode';
import type { XolitoEvent } from '@xolito/core';

// Cuántos ms esperar después del último cambio antes de analizar
// (evita spam de notificaciones mientras escribes)
const DEBOUNCE_MS = 1500;

type DiagnosticCallback = (event: XolitoEvent, detail?: string) => void;

export class DiagnosticsWatcher {
  private prevErrorCount  = 0;
  private prevWarnCount   = 0;
  private debounceTimer?: NodeJS.Timeout;
  private disposable?: vscode.Disposable;

  constructor(private readonly onEvent: DiagnosticCallback) {}

  /** Arranca el watcher — llámalo en activate() */
  start(): void {
    // VS Code dispara esto cada vez que el Language Server actualiza diagnósticos
    // Cubre TypeScript, ESLint, Python, Rust, Go... cualquier LSP
    this.disposable = vscode.languages.onDidChangeDiagnostics(
      (e: vscode.DiagnosticChangeEvent) => this.handleChange(e)
    );

    // Análisis inicial al arrancar
    this.analyze();
  }

  stop(): void {
    this.disposable?.dispose();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  // ── Procesamiento ────────────────────────────────────────────

  private handleChange(_e: vscode.DiagnosticChangeEvent): void {
    // Debounce: esperamos a que el LSP termine de procesar
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.analyze(), DEBOUNCE_MS);
  }

  private analyze(): void {
    const { errors, warnings, firstError } = this.collectDiagnostics();

    // ── Errores nuevos ────────────────────────────────────────
    if (errors > this.prevErrorCount) {
      const diff = errors - this.prevErrorCount;

      if (diff >= 5) {
        // Muchos errores de golpe = probablemente renombró algo
        this.onEvent('build_fail', `+${diff} errores nuevos`);
      } else if (errors >= 10) {
        this.onEvent('build_fail', `${errors} errores en total`);
      } else {
        // Clasifica el tipo de error para frase más específica
        const event = this.classifyError(firstError);
        this.onEvent(event, firstError?.message);
      }
    }

    // ── Errores resueltos ─────────────────────────────────────
    if (errors === 0 && this.prevErrorCount > 0) {
      this.onEvent('build_success', 'Sin errores');
    }

    // ── De errores a solo warnings ────────────────────────────
    if (errors === 0 && warnings > 0 && this.prevErrorCount > 0) {
      this.onEvent('build_success', 'Solo warnings');
    }

    // ── Warnings nuevos (sin errores) ─────────────────────────
    if (errors === 0 && warnings > this.prevWarnCount + 2) {
      this.onEvent('save_no_comments', `${warnings} warnings`);
    }

    this.prevErrorCount = errors;
    this.prevWarnCount  = warnings;
  }

  // ── Recolección de diagnósticos del workspace ────────────────

  private collectDiagnostics(): {
    errors: number;
    warnings: number;
    firstError: vscode.Diagnostic | undefined;
  } {
    let errors   = 0;
    let warnings = 0;
    let firstError: vscode.Diagnostic | undefined;

    // Itera sobre todos los archivos abiertos con diagnósticos
    for (const [uri, diagnostics] of vscode.languages.getDiagnostics()) {
      // Solo archivos del workspace actual, ignorar node_modules
      if (uri.fsPath.includes('node_modules')) continue;
      if (uri.fsPath.includes('.git'))         continue;

      for (const d of diagnostics) {
        if (d.severity === vscode.DiagnosticSeverity.Error) {
          errors++;
          if (!firstError) firstError = d;
        } else if (d.severity === vscode.DiagnosticSeverity.Warning) {
          warnings++;
        }
      }
    }

    return { errors, warnings, firstError };
  }

  // ── Clasificación inteligente del error ──────────────────────

  private classifyError(d: vscode.Diagnostic | undefined): XolitoEvent {
    if (!d) return 'build_fail';

    const msg = d.message.toLowerCase();
    const src = (d.source ?? '').toLowerCase();

    // Errores de TypeScript
    if (src === 'ts' || src === 'typescript') {
      if (msg.includes('cannot find') || msg.includes('does not exist'))
        return 'build_fail';
      if (msg.includes('type') && msg.includes('not assignable'))
        return 'build_fail';
      if (msg.includes('missing') || msg.includes('expected'))
        return 'syntax_error';
    }

    // ESLint
    if (src === 'eslint') {
      if (msg.includes('no-console') || msg.includes('console'))
        return 'console_log_left';
      if (msg.includes('todo') || msg.includes('fixme'))
        return 'todo_comment';
      return 'save_no_comments';
    }

    // Errores de sintaxis genéricos
    if (msg.includes('unexpected token') ||
        msg.includes('syntax error')     ||
        msg.includes('expected'))          return 'syntax_error';

    // Merge conflict markers
    if (msg.includes('<<<<') || msg.includes('merge conflict'))
      return 'merge_conflict';

    return 'build_fail';
  }

  // ── API pública para queries manuales ────────────────────────

  /** Retorna el conteo actual sin esperar el debounce */
  getCurrentCounts(): { errors: number; warnings: number } {
    const { errors, warnings } = this.collectDiagnostics();
    return { errors, warnings };
  }
}
