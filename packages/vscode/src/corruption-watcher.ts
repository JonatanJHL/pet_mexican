// ============================================================
//  xolito/packages/vscode/src/corruption-watcher.ts
//  Observa el repo y calcula nivel de corrupción en tiempo real
// ============================================================

import * as vscode from 'vscode';
import { calculateCorruption } from '@xolito/core';
import type { CorruptionState, CorruptionFactors } from '@xolito/core';

export class CorruptionWatcher {
  private disposables: vscode.Disposable[] = [];
  private onChange: (state: CorruptionState) => void;

  private todoCount          = 0;
  private consecutiveFails   = 0;
  private errorCount         = 0;
  private lastCommitTime     = Date.now();
  private scanTimer:           NodeJS.Timeout | undefined;

  constructor(onChange: (state: CorruptionState) => void) {
    this.onChange = onChange;
  }

  start(): void {
    this.disposables.push(
      vscode.languages.onDidChangeDiagnostics(() => {
        this.updateErrorCount();
        this.recalculate();
      }),
      vscode.workspace.onDidSaveTextDocument(() => {
        this.scanTodos();
        this.recalculate();
      }),
    );

    this.scanTodos();
    this.recalculate();
    this.scanTimer = setInterval(() => this.recalculate(), 5 * 60 * 1000);
  }

  stop(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
    if (this.scanTimer) clearInterval(this.scanTimer);
  }

  reportBuildFail():    void { this.consecutiveFails++;    this.recalculate(); }
  reportBuildSuccess(): void { this.consecutiveFails = 0;  this.recalculate(); }
  reportCommit():       void { this.lastCommitTime = Date.now(); this.recalculate(); }

  getCurrentFactors(): CorruptionFactors {
    return {
      todoCount:          this.todoCount,
      errorCount:         this.errorCount,
      deadFileCount:      0,
      consecutiveFails:   this.consecutiveFails,
      hoursWithoutCommit: Math.round(
        (Date.now() - this.lastCommitTime) / (1000 * 60 * 60)
      ),
    };
  }

  private updateErrorCount(): void {
    let total = 0;
    for (const editor of vscode.window.visibleTextEditors) {
      const diags = vscode.languages.getDiagnostics(editor.document.uri);
      total += diags.filter(
        d => d.severity === vscode.DiagnosticSeverity.Error
      ).length;
    }
    this.errorCount = total;
  }

  private async scanTodos(): Promise<void> {
    try {
      const files = await vscode.workspace.findFiles(
        '**/*.{ts,js,php,py,go,rs,cs}',
        '**/node_modules/**',
        50,
      );
      let count = 0;
      for (const file of files) {
        const doc  = await vscode.workspace.openTextDocument(file);
        const hits = doc.getText().match(/\/\/\s*(TODO|FIXME)/gi);
        count += hits?.length ?? 0;
      }
      this.todoCount = count;
    } catch (_) {}
  }

  private recalculate(): void {
    const state = calculateCorruption(this.getCurrentFactors());
    this.onChange(state);
  }
}
