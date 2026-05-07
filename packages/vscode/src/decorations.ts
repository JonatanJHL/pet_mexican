// ============================================================
//  xolito/packages/vscode/src/decorations.ts
//  Xolito inline — funciona con CUALQUIER lenguaje
// ============================================================

import * as vscode from 'vscode';

// Patrones de "malas prácticas" por lenguaje
const CONSOLE_PATTERNS: Record<string, RegExp> = {
  javascript:      /console\.log\s*\(/g,
  typescript:      /console\.log\s*\(/g,
  javascriptreact: /console\.log\s*\(/g,
  typescriptreact: /console\.log\s*\(/g,
  python:          /print\s*\(/g,
  php:             /var_dump\s*\(|print_r\s*\(/g,
  ruby:            /puts\s+|p\s+/g,
  go:              /fmt\.Println\s*\(/g,
  rust:            /println!\s*\(/g,
  java:            /System\.out\.print/g,
};

const TODO_PATTERN = /\/\/\s*TODO|\/\/\s*FIXME|#\s*TODO|#\s*FIXME/gi;

export class XolitoDecorations {
  private errorDecoration:   vscode.TextEditorDecorationType;
  private warningDecoration: vscode.TextEditorDecorationType;
  private infoDecoration:    vscode.TextEditorDecorationType;
  private disposables: vscode.Disposable[] = [];
  private enabled = true;

  constructor() {
    this.errorDecoration = vscode.window.createTextEditorDecorationType({
      after: { margin: '0 0 0 2rem', color: new vscode.ThemeColor('errorForeground') },
      isWholeLine: false,
    });
    this.warningDecoration = vscode.window.createTextEditorDecorationType({
      after: { margin: '0 0 0 2rem', color: new vscode.ThemeColor('editorWarning.foreground') },
      isWholeLine: false,
    });
    this.infoDecoration = vscode.window.createTextEditorDecorationType({
      after: { margin: '0 0 0 2rem', color: new vscode.ThemeColor('editorInfo.foreground') },
      isWholeLine: false,
    });
  }

  start(): void {
    this.enabled = true;
    // Actualizar el editor activo inmediatamente
    if (vscode.window.activeTextEditor) {
      this.updateDecorations(vscode.window.activeTextEditor);
    }

    this.disposables.push(
      // Cuando cambias de archivo
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && this.enabled) this.updateDecorations(editor);
      }),
      // Cuando el LSP actualiza errores (cualquier lenguaje)
      vscode.languages.onDidChangeDiagnostics(e => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !this.enabled) return;
        // Solo si el archivo activo fue afectado
        if (e.uris.some(u => u.toString() === editor.document.uri.toString())) {
          this.updateDecorations(editor);
        }
      }),
      // Cuando editas el archivo
      vscode.workspace.onDidChangeTextDocument(e => {
        const editor = vscode.window.activeTextEditor;
        if (editor && this.enabled && e.document === editor.document) {
          this.updateDecorations(editor);
        }
      }),
    );
  }

  stop(): void {
    this.enabled = false;
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
    // Limpiar decoraciones de todos los editores abiertos
    vscode.window.visibleTextEditors.forEach(editor => {
      editor.setDecorations(this.errorDecoration,   []);
      editor.setDecorations(this.warningDecoration, []);
      editor.setDecorations(this.infoDecoration,    []);
    });
  }

  dispose(): void {
    this.stop();
    this.errorDecoration.dispose();
    this.warningDecoration.dispose();
    this.infoDecoration.dispose();
  }

  private updateDecorations(editor: vscode.TextEditor): void {
    const doc    = editor.document;
    const text   = doc.getText();
    const lang   = doc.languageId;
    const diags  = vscode.languages.getDiagnostics(doc.uri);

    const errorRanges:   vscode.DecorationOptions[] = [];
    const warningRanges: vscode.DecorationOptions[] = [];
    const infoRanges:    vscode.DecorationOptions[] = [];

    // ── Errores y warnings del LSP (cualquier lenguaje) ─────
    for (const diag of diags) {
      if (diag.severity === vscode.DiagnosticSeverity.Error) {
        errorRanges.push({
          range: new vscode.Range(diag.range.start, diag.range.end),
          renderOptions: {
            after: { contentText: `  🦎💢 ${this.errorPhrase(diag.message, lang)}` },
          },
        });
      } else if (diag.severity === vscode.DiagnosticSeverity.Warning) {
        warningRanges.push({
          range: new vscode.Range(diag.range.start, diag.range.end),
          renderOptions: {
            after: { contentText: `  🦎👀 ${this.warningPhrase(diag.message, lang)}` },
          },
        });
      }
    }

    // ── Debug prints por lenguaje ────────────────────────────
    const consolePattern = CONSOLE_PATTERNS[lang];
    if (consolePattern) {
      consolePattern.lastIndex = 0; // reset regex
      let match;
      while ((match = consolePattern.exec(text)) !== null) {
        const pos   = doc.positionAt(match.index);
        const end   = doc.positionAt(match.index + match[0].length);
        infoRanges.push({
          range: new vscode.Range(pos, end),
          renderOptions: {
            after: { contentText: `  🦎 ${this.debugPhrase(lang)}` },
          },
        });
      }
    }

    // ── TODO / FIXME (todos los lenguajes) ──────────────────
    TODO_PATTERN.lastIndex = 0;
    let match;
    while ((match = TODO_PATTERN.exec(text)) !== null) {
      const pos = doc.positionAt(match.index);
      const end = doc.positionAt(match.index + match[0].length);
      infoRanges.push({
        range: new vscode.Range(pos, end),
        renderOptions: {
          after: { contentText: '  🦎🧐 ¿este TODO tiene telarañas?' },
        },
      });
    }

    editor.setDecorations(this.errorDecoration,   errorRanges);
    editor.setDecorations(this.warningDecoration, warningRanges);
    editor.setDecorations(this.infoDecoration,    infoRanges);
  }

  // ── Frases por lenguaje ──────────────────────────────────

  private errorPhrase(msg: string, lang: string): string {
    const m = msg.toLowerCase();

    // PHP
    if (lang === 'php') {
      if (m.includes('undefined'))    return 'variable fantasma, mijo';
      if (m.includes('syntax'))       return '¿leíste el error o nomás lo cerraste?';
      if (m.includes('call to'))      return 'esa función no existe, la inventaste';
      return 'el parser no te entiende. yo tampoco.';
    }
    // Python
    if (lang === 'python') {
      if (m.includes('indentation'))  return 'los espacios importan, cuate';
      if (m.includes('name'))         return '¿y esa variable de dónde salió?';
      return 'Python dice que no, mijo';
    }
    // TypeScript / JavaScript
    if (m.includes('cannot find') || m.includes('does not exist'))
      return '¿lo inventaste o existe?';
    if (m.includes('not assignable') || m.includes('type'))
      return 'los tipos no mienten, mijo';
    if (m.includes('syntax'))
      return '¿lo escribiste con los ojos cerrados?';
    if (m.includes('missing'))
      return 'le falta algo, revisa';
    return 'ay, mijo... otro error';
  }

  private warningPhrase(msg: string, _lang: string): string {
    const m = msg.toLowerCase();
    if (m.includes('unused'))     return 'declaraste y no usaste, típico';
    if (m.includes('any'))        return 'usando "any"... muy valiente';
    if (m.includes('deprecated')) return 'eso ya está viejito, actualiza';
    if (m.includes('null'))       return 'cuidado con ese null ahí';
    return 'cuidado con eso...';
  }

  private debugPhrase(lang: string): string {
    const phrases: Record<string, string[]> = {
      php:    ['var_dump detectado. clásico.', '¿ibas a subir esto a prod?'],
      python: ['print de debug... ¿lo ibas a quitar?', 'muy artesanal tu debug'],
      go:     ['Println de debug, ¿lo borramos?'],
      default:['muy artesanal tu debug', '¿ibas a subir esto a prod, verdad?'],
    };
    const options = phrases[lang] ?? phrases['default'];
    return options[Math.floor(Math.random() * options.length)];
  }
}
