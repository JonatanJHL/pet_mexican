// ============================================================
//  xolito/packages/vscode/src/corruption-watcher.ts
//  v3 — solo archivos del workspace, lista de archivos corruptos
// ============================================================

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { calculateCorruption } from '@xolito/core';
import type { CorruptionState, CorruptionFactors } from '@xolito/core';

interface HealthSnapshot {
  timestamp:        string;
  errorCount:       number;
  warningCount:     number;
  consecutiveFails: number;
  corruptionLevel:  number;
  corruptionTier:   string;
}

interface HealthHistory {
  snapshots:    HealthSnapshot[];
  lastUpdated:  string;
}

export interface FileWithErrors {
  name:     string;
  errors:   number;
  warnings: number;
}

export class CorruptionWatcher {
  private disposables:     vscode.Disposable[] = [];
  private onChange:        (state: CorruptionState) => void;
  private errorCount       = 0;
  private warningCount     = 0;
  private consecutiveFails = 0;
  private lastCommitTime   = Date.now();
  private scanTimer:         NodeJS.Timeout | undefined;
  private saveTimer:         NodeJS.Timeout | undefined;
  private healthFile:        string | undefined;
  private filesWithErrors:   FileWithErrors[] = [];

  constructor(onChange: (state: CorruptionState) => void) {
    this.onChange = onChange;
    const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (ws) this.healthFile = path.join(ws, 'xolito-health.json');
  }

  start(): void {
    this.disposables.push(
      vscode.languages.onDidChangeDiagnostics(() => {
        this.updateFromDiagnostics();
        this.recalculate();
      }),
      vscode.workspace.onDidSaveTextDocument(() => {
        this.updateFromDiagnostics();
        this.recalculate();
      }),
      // Recalcula cuando se cierra un documento
      vscode.workspace.onDidCloseTextDocument(() => {
        this.updateFromDiagnostics();
        this.recalculate();
      }),
    );

    this.updateFromDiagnostics();
    this.recalculate();
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
      todoCount:          0,
      errorCount:         this.errorCount,
      deadFileCount:      0,
      consecutiveFails:   this.consecutiveFails,
      hoursWithoutCommit: Math.round(
        (Date.now() - this.lastCommitTime) / (1000 * 60 * 60)
      ),
    };
  }

  getWarningCount():    number           { return this.warningCount; }
  getFilesWithErrors(): FileWithErrors[] { return this.filesWithErrors; }

  // ── Solo cuenta archivos dentro del workspace activo ─────────
  private updateFromDiagnostics(): void {
    const wsPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    let errors   = 0;
    let warnings = 0;
    const fileMap = new Map<string, FileWithErrors>();

    const allDiags = vscode.languages.getDiagnostics();
    for (const [uri, diags] of allDiags) {
      const filePath = uri.fsPath;

      // Solo archivos dentro del workspace — ignora archivos externos/temporales
      if (wsPath && !filePath.startsWith(wsPath)) continue;

      let fileErrors   = 0;
      let fileWarnings = 0;

      for (const d of diags) {
        if (d.severity === vscode.DiagnosticSeverity.Error)   { errors++;   fileErrors++;   }
        if (d.severity === vscode.DiagnosticSeverity.Warning) { warnings++; fileWarnings++; }
      }

      if (fileErrors > 0 || fileWarnings > 0) {
        fileMap.set(filePath, {
          name:     path.relative(wsPath ?? '', filePath),
          errors:   fileErrors,
          warnings: fileWarnings,
        });
      }
    }

    this.errorCount      = errors;
    this.warningCount    = warnings;
    // Ordena por errores descendente, máximo 5 archivos
    this.filesWithErrors = Array.from(fileMap.values())
      .sort((a, b) => b.errors - a.errors)
      .slice(0, 5);
  }

  private recalculate(): void {
    const state = calculateCorruption(this.getCurrentFactors());
    this.onChange(state);
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveSnapshot(state), 2000);
  }

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
      history.snapshots.push(snapshot);
      if (history.snapshots.length > 50) history.snapshots.shift();
      history.lastUpdated = snapshot.timestamp;
      fs.writeFileSync(this.healthFile, JSON.stringify(history, null, 2));
    } catch (_) {}
  }
}
