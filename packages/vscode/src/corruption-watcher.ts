// ============================================================
//  xolito/packages/vscode/src/corruption-watcher.ts
//  v2 — usa diagnósticos LSP reales + JSON local de historial
// ============================================================

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { calculateCorruption } from '@xolito/core';
import type { CorruptionState, CorruptionFactors } from '@xolito/core';

// ── Estructura del JSON local ─────────────────────────────────
interface HealthSnapshot {
  timestamp:        string;
  errorCount:       number;
  warningCount:     number;
  consecutiveFails: number;
  corruptionLevel:  number;
  corruptionTier:   string;
}

interface HealthHistory {
  snapshots:        HealthSnapshot[];
  lastUpdated:      string;
}

export class CorruptionWatcher {
  private disposables:      vscode.Disposable[] = [];
  private onChange:         (state: CorruptionState) => void;
  private errorCount        = 0;
  private warningCount      = 0;
  private consecutiveFails  = 0;
  private lastCommitTime    = Date.now();
  private scanTimer:          NodeJS.Timeout | undefined;
  private saveTimer:          NodeJS.Timeout | undefined;
  private healthFile:         string | undefined;

  constructor(onChange: (state: CorruptionState) => void) {
    this.onChange = onChange;
    // Ruta del JSON en la raíz del workspace
    const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (ws) this.healthFile = path.join(ws, 'xolito-health.json');
  }

  start(): void {
    // ── Escucha diagnósticos LSP en tiempo real ───────────────
    this.disposables.push(
      vscode.languages.onDidChangeDiagnostics(() => {
        this.updateFromDiagnostics();
        this.recalculate();
      }),
      vscode.workspace.onDidSaveTextDocument(() => {
        this.updateFromDiagnostics();
        this.recalculate();
      }),
    );

    this.updateFromDiagnostics();
    this.recalculate();

    // Recalcula cada 3 minutos para actualizar hoursWithoutCommit
    this.scanTimer = setInterval(() => this.recalculate(), 3 * 60 * 1000);
  }

  stop(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
    if (this.scanTimer) clearInterval(this.scanTimer);
    if (this.saveTimer) clearTimeout(this.saveTimer);
  }

  reportBuildFail():    void { this.consecutiveFails++;   this.recalculate(); }
  reportBuildSuccess(): void { this.consecutiveFails = 0; this.recalculate(); }
  reportCommit():       void { this.lastCommitTime = Date.now(); this.recalculate(); }

  getCurrentFactors(): CorruptionFactors {
    return {
      todoCount:          0, // ya no usamos TODOs — usamos errores reales
      errorCount:         this.errorCount,
      deadFileCount:      0,
      consecutiveFails:   this.consecutiveFails,
      hoursWithoutCommit: Math.round(
        (Date.now() - this.lastCommitTime) / (1000 * 60 * 60)
      ),
    };
  }

  getWarningCount(): number { return this.warningCount; }

  // ── Lee diagnósticos LSP de TODOS los archivos abiertos ──────
  private updateFromDiagnostics(): void {
    let errors   = 0;
    let warnings = 0;

    // Obtiene diagnósticos de todos los documentos del workspace
    const allDiags = vscode.languages.getDiagnostics();
    for (const [, diags] of allDiags) {
      for (const d of diags) {
        if (d.severity === vscode.DiagnosticSeverity.Error)   errors++;
        if (d.severity === vscode.DiagnosticSeverity.Warning) warnings++;
      }
    }

    this.errorCount   = errors;
    this.warningCount = warnings;
  }

  // ── Recalcula y guarda en JSON ────────────────────────────────
  private recalculate(): void {
    const state = calculateCorruption(this.getCurrentFactors());
    this.onChange(state);
    // Guarda con debounce de 2s para no escribir en cada keystroke
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveSnapshot(state), 2000);
  }

  // ── Escribe xolito-health.json en la raíz del workspace ──────
  private saveSnapshot(state: CorruptionState): void {
    if (!this.healthFile) return;
    try {
      let history: HealthHistory = { snapshots: [], lastUpdated: '' };
      if (fs.existsSync(this.healthFile)) {
        history = JSON.parse(fs.readFileSync(this.healthFile, 'utf8'));
      }

      const snapshot: HealthSnapshot = {
        timestamp:        new Date().toISOString(),
        errorCount:       this.errorCount,
        warningCount:     this.warningCount,
        consecutiveFails: this.consecutiveFails,
        corruptionLevel:  state.level,
        corruptionTier:   state.tier,
      };

      // Mantiene solo los últimos 50 snapshots
      history.snapshots.push(snapshot);
      if (history.snapshots.length > 50) history.snapshots.shift();
      history.lastUpdated = snapshot.timestamp;

      fs.writeFileSync(this.healthFile, JSON.stringify(history, null, 2));
    } catch (_) {
      // Silencioso — no interrumpir flujo si el archivo está bloqueado
    }
  }
}
