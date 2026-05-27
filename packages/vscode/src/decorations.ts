// ============================================================
//  xolito/packages/vscode/src/decorations.ts
//  Xolito inline — funciona con CUALQUIER lenguaje
//  rotación de frases, memoria de archivo anterior,
//      warnings expandidos, TODO rotado, onSave sin cambios
// ============================================================

import * as vscode from 'vscode';

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
  csharp:          /Console\.WriteLine\s*\(|Console\.Write\s*\(/g,
};

const TODO_PATTERN = /\/\/\s*TODO|\/\/\s*FIXME|#\s*TODO|#\s*FIXME/gi;

export class XolitoDecorations {
  private errorDecoration:   vscode.TextEditorDecorationType;
  private warningDecoration: vscode.TextEditorDecorationType;
  private infoDecoration:    vscode.TextEditorDecorationType;
  private disposables: vscode.Disposable[] = [];
  private enabled = true;

  // ── Rotación de frases ────────────────────────────────────
  private phraseCounters: Map<string, number> = new Map();

  // ── Memoria entre archivos ────────────────────────────────
  private prevFileUri    = '';
  private prevFileErrors = 0;
  private todoCounter    = 0;

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
    if (vscode.window.activeTextEditor) {
      this.prevFileUri = vscode.window.activeTextEditor.document.uri.toString();
      this.updateDecorations(vscode.window.activeTextEditor);
    }
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (!editor || !this.enabled) return;
        const currentUri = editor.document.uri.toString();

        // ── Cambio de archivo: resetea contadores y guarda memoria ──
        if (this.prevFileUri && this.prevFileUri !== currentUri) {
          this.phraseCounters.clear();
          this.todoCounter = 0;
          // prevFileErrors ya fue actualizado en updateDecorations
        }
        this.prevFileUri = currentUri;
        this.updateDecorations(editor);
      }),
      vscode.languages.onDidChangeDiagnostics(e => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !this.enabled) return;
        if (e.uris.some(u => u.toString() === editor.document.uri.toString())) {
          this.updateDecorations(editor);
        }
      }),
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
    const doc   = editor.document;
    const text  = doc.getText();
    const lang  = doc.languageId;
    const diags = vscode.languages.getDiagnostics(doc.uri);

    const errorRanges:   vscode.DecorationOptions[] = [];
    const warningRanges: vscode.DecorationOptions[] = [];
    const infoRanges:    vscode.DecorationOptions[] = [];

    const errorLines   = new Set<number>();
    const warningLines = new Set<number>();
    const infoLines    = new Set<number>();

    // ── Cuenta errores actuales para memoria ─────────────────
    const currentErrors = diags.filter(
      d => d.severity === vscode.DiagnosticSeverity.Error
    ).length;

    // ── Frases contextuales al venir de otro archivo con errores ──
    const cameFromBrokenFile = this.prevFileErrors > 0;

    // ── Errores y warnings del LSP ────────────────────────────
    for (const diag of diags) {
      const lineNum = diag.range.start.line;

      if (diag.severity === vscode.DiagnosticSeverity.Error) {
        if (errorLines.has(lineNum)) continue;
        errorLines.add(lineNum);
        
        const translation = this.getBarrioTranslation(diag.message);
        const hoverMsg = translation 
          ? new vscode.MarkdownString(`**🦎 Xolito traductor de barrio:**\n\n_${translation}_`)
          : new vscode.MarkdownString(`**🦎 Xolito:**\n\n_${diag.message}_`);

        const inlineText = translation
          ? `  🦎🧠 Barrio: ${translation.length > 40 ? translation.slice(0, 37) + '...' : translation}`
          : `  🦎💢 ${this.errorPhrase(diag.message, lang, cameFromBrokenFile)}`;

        errorRanges.push({
          range: new vscode.Range(diag.range.start, diag.range.end),
          hoverMessage: hoverMsg,
          renderOptions: {
            after: {
              contentText: inlineText,
            },
          },
        });
      } else if (diag.severity === vscode.DiagnosticSeverity.Warning) {
        if (warningLines.has(lineNum)) continue;
        warningLines.add(lineNum);
        warningRanges.push({
          range: new vscode.Range(diag.range.start, diag.range.end),
          renderOptions: {
            after: { contentText: `  🦎👀 ${this.warningPhrase(diag.message, lang)}` },
          },
        });
      }
    }

    // ── Debug prints por lenguaje ─────────────────────────────
    const consolePattern = CONSOLE_PATTERNS[lang];
    if (consolePattern) {
      consolePattern.lastIndex = 0;
      let match;
      while ((match = consolePattern.exec(text)) !== null) {
        const pos     = doc.positionAt(match.index);
        const lineNum = pos.line;
        if (infoLines.has(lineNum)) continue;
        infoLines.add(lineNum);
        const end = doc.positionAt(match.index + match[0].length);
        infoRanges.push({
          range: new vscode.Range(pos, end),
          renderOptions: {
            after: { contentText: `  🦎 ${this.debugPhrase(lang)}` },
          },
        });
      }
    }

    // ── TODO / FIXME ──────────────────────────────────────────
    TODO_PATTERN.lastIndex = 0;
    let match;
    while ((match = TODO_PATTERN.exec(text)) !== null) {
      const pos     = doc.positionAt(match.index);
      const lineNum = pos.line;
      if (infoLines.has(lineNum)) continue;
      infoLines.add(lineNum);
      const end = doc.positionAt(match.index + match[0].length);
      infoRanges.push({
        range: new vscode.Range(pos, end),
        renderOptions: {
          after: { contentText: `  🦎🧐 ${this.todoPhrase()}` },
        },
      });
    }

    editor.setDecorations(this.errorDecoration,   errorRanges);
    editor.setDecorations(this.warningDecoration, warningRanges);
    editor.setDecorations(this.infoDecoration,    infoRanges);

    // ── Actualiza memoria para el siguiente archivo ───────────
    this.prevFileErrors = currentErrors;
  }

  // ── Rotación anti-repetición ──────────────────────────────
  private rotate(key: string, phrases: string[]): string {
    const i = (this.phraseCounters.get(key) ?? 0) % phrases.length;
    this.phraseCounters.set(key, i + 1);
    return phrases[i];
  }

  // ── Frases de error con memoria de archivo anterior ───────
  private errorPhrase(msg: string, lang: string, cameFromBrokenFile: boolean): string {
    const m = msg.toLowerCase();

    // Si viene de un archivo con errores, Xolito lo recuerda
    if (cameFromBrokenFile) {
      const crossFileJabs = [
        '¿recuerdas que en el otro archivo también la regaste?',
        'no hagas lo mismo que en el archivo anterior, mijo.',
        'en la otra lo dejaste roto... aquí tampoco empieza bien.',
        '¿vienes huyendo del otro archivo? aquí también hay errores.',
        'no hagas lo mismo que con tu ex. en el código, me refiero.',
        '¿llegaste a esconder los errores del otro? clásico.',
      ];
      // Solo usa frase de memoria cada 3 errores para no saturar
      const counter = this.phraseCounters.get('cross_file') ?? 0;
      this.phraseCounters.set('cross_file', counter + 1);
      if (counter % 3 === 0) {
        return crossFileJabs[Math.floor(Math.random() * crossFileJabs.length)];
      }
    }

    if (lang === 'php') {
      if (m.includes('undefined'))  return this.rotate('php_undef', [
        'variable fantasma, mijo', '¿de dónde salió eso?',
        'undefined... la inventaste', '¿existe esa variable o la soñaste?',
      ]);
      if (m.includes('syntax'))     return this.rotate('php_syntax', [
        '¿leíste el error o nomás lo cerraste?', 'syntax error, clásico',
        '¿lo escribiste con los ojos cerrados?', 'le falta algo ahí, revisa lento',
      ]);
      if (m.includes('call to'))    return this.rotate('php_call', [
        'esa función no existe, la inventaste', '¿seguro que eso existe?',
        'función desaparecida. ¿o nunca existió?',
      ]);
      return this.rotate('php_generic', [
        'el parser no te entiende. yo tampoco.',
        'ay, mijo... revisa eso', 'algo está mal. algo.',
        'error. ¿leíste el mensaje?', 'tronó. ¿sorpresa?',
      ]);
    }

    if (lang === 'python') {
      if (m.includes('indentation')) return this.rotate('py_indent', [
        'los espacios importan, cuate', 'indentación rota. Python llora.',
        '¿tabs o espacios? decide de una vez.',
      ]);
      if (m.includes('name'))        return this.rotate('py_name', [
        '¿y esa variable de dónde salió?', 'NameError. la inventaste.',
        'eso no existe, mijo',
      ]);
      return this.rotate('py_generic', [
        'Python dice que no, mijo', 'ay, cuate... error',
        'Python no está contento hoy', 'revisa eso lento',
      ]);
    }

    if (lang === 'csharp') {
      if (m.includes('does not exist') || m.includes('not found')) return this.rotate('cs_exist', [
        '¿lo inventaste o existe?', 'no encontrado. ¿seguro?',
        'eso no existe por ningún lado',
      ]);
      if (m.includes('cannot convert')) return this.rotate('cs_type', [
        'los tipos no mienten, mijo', 'type mismatch. clásico.',
        '¿convertiste bien o nomás rezaste?',
      ]);
      return this.rotate('cs_generic', [
        'C# no te entiende. yo tampoco.', 'error de C#. revisa.',
        'el compilador está enojado', 'algo tronó por aquí',
      ]);
    }

    if (m.includes('cannot find') || m.includes('does not exist')) return this.rotate('gen_exist', [
      '¿lo inventaste o existe?', 'no encontrado en ningún lado',
      'eso no existe, mijo',
    ]);
    if (m.includes('not assignable') || m.includes('type')) return this.rotate('gen_type', [
      'los tipos no mienten, mijo', 'type error. clásico.',
      '¿pusiste el tipo correcto o adivinaste?',
    ]);
    if (m.includes('syntax'))  return this.rotate('gen_syntax', [
      '¿lo escribiste con los ojos cerrados?', 'syntax error. la puntuación importa.',
      'le falta algo ahí',
    ]);
    if (m.includes('missing')) return this.rotate('gen_missing', [
      'le falta algo, revisa', '¿qué le falta? algo le falta.',
      'incompleto, mijo',
    ]);

    return this.rotate('gen_generic', [
      'ay, mijo... otro error', 'tronó. ¿sorpresa?',
      'error detectado. Xolito suspira.',
      'algo está mal. algo.',
      '¿leíste el error o lo ignoraste?',
    ]);
  }

  // ── Frases de warning expandidas ─────────────────────────
  private warningPhrase(msg: string, lang: string): string {
    const m = msg.toLowerCase();

    if (m.includes('unused') || m.includes('never read')) return this.rotate('w_unused', [
      'declaraste y no usaste, típico',
      'variable de adorno. bonita pero inútil.',
      'eso no lo usa nadie. ni tú.',
      'declarada y abandonada. como tus propósitos.',
    ]);
    if (m.includes('implicit any') || m.includes(': any')) return this.rotate('w_any', [
      'usando "any"... muy valiente',
      'any. la rendición elegante de TypeScript.',
      '¿no sabes el tipo o no quieres pensarlo?',
      'any es para cuando ya te rendiste.',
    ]);
    if (m.includes('deprecated')) return this.rotate('w_deprecated', [
      'eso ya está viejito, actualiza',
      'deprecated. como tus excusas.',
      'eso ya lo jubilaron, mijo.',
      'usa la versión nueva, la vieja ya se fue.',
    ]);
    if (m.includes('null') || m.includes('undefined') || m.includes('possibly')) return this.rotate('w_null', [
      'cuidado con ese null ahí',
      'ese valor puede ser null. prepárate.',
      'possible undefined. ¿ya validaste?',
      'si eso es null, todo explota. fyi.',
    ]);
    if (m.includes('unreachable')) return this.rotate('w_unreachable', [
      'código que nunca se ejecuta. fantasma.',
      'unreachable. ni el compilador llega ahí.',
      'eso no se ejecuta nunca. ¿lo sabías?',
    ]);
    if (m.includes('missing return') || m.includes('no return')) return this.rotate('w_return', [
      '¿y el return? se te fue.',
      'función sin return. ¿qué regresa? nada. nada regresa.',
      'le falta el return, mijo.',
    ]);
    if (m.includes('never')) return this.rotate('w_never', [
      'tipo never. eso no debería pasar... pero pasó.',
      'never. xolito también tiene esperanzas never.',
    ]);
    if (m.includes('import') || m.includes('require')) return this.rotate('w_import', [
      'importaste algo que no usas. típico.',
      'ese import lleva aquí desde el principio del tiempo.',
      '¿para qué importaste eso si no lo usas?',
    ]);
    if (lang === 'typescript' || lang === 'javascript') return this.rotate('w_ts_generic', [
      'cuidado con eso...', 'warning de TS. léelo, no lo ignores.',
      'el linter tiene razón. casi siempre.',
    ]);

    return this.rotate('w_generic', [
      'cuidado con eso...', 'warning. no es error pero tampoco está bien.',
      'el compilador te avisa. escúchalo.',
      'advertencia. Xolito también te advierte.',
    ]);
  }

  // ── TODO rotado ───────────────────────────────────────────
  private todoPhrase(): string {
    const phrases = [
      '¿este TODO tiene telarañas?',
      'TODO de hace cuánto... ¿2022?',
      'TODO: nunca. ese es el plan real.',
      '¿cuándo lo vas a hacer? pregunta sincera.',
      'tu yo del pasado te dejó tarea.',
      'TODO abandonado. como tus propósitos de enero.',
      'este TODO ya votó en las últimas elecciones.',
      'spoiler: nunca se hace.',
      '¿lo vas a hacer hoy o es decoración?',
    ];
    const i = this.todoCounter % phrases.length;
    this.todoCounter++;
    return phrases[i];
  }

  // ── Debug prints ──────────────────────────────────────────
  private debugPhrase(lang: string): string {
    const phrases: Record<string, string[]> = {
      php:     ['var_dump detectado. clásico.', '¿ibas a subir esto a prod?',
                'print_r en prod. arte.'],
      python:  ['print de debug... ¿lo ibas a quitar?', 'muy artesanal tu debug',
                'print(). el debugger es tu amigo, mijo.'],
      go:      ['Println de debug, ¿lo borramos?', 'fmt.Println. muy old school.'],
      csharp:  ['Console.WriteLine en prod. clásico.', 'muy artesanal tu debug, cuate',
                'Console.Write. ¿ibas a dejarlo?'],
      rust:    ['println! de debug. ¿en serio?', 'muy artesanal para ser Rust.'],
      java:    ['System.out.print. ¿no hay logger?', 'debug a mano en Java. respeto.'],
      default: ['muy artesanal tu debug', '¿ibas a subir esto a prod, verdad?',
                'debug print detectado. Xolito te vio.',
                'console.log/print. la tradición que nunca muere.'],
    };
    const options = phrases[lang] ?? phrases['default'];
    return options[Math.floor(Math.random() * options.length)];
  }

  private getBarrioTranslation(msg: string): string | null {
    const m = msg.toLowerCase();
    if (m.includes('not assignable to type')) {
      return "Básicamente estás intentando meter una caguama familiar en un vaso tequilero. No va a caber, mijo. Cambia el tipo.";
    }
    if (m.includes('cannot find name')) {
      return "¿Y esa variable de dónde salió, mijo? Es como buscar al taquero un lunes por la mañana: no existe. Declárala o impórtala primero.";
    }
    if (m.includes('does not exist on type')) {
      return "Le estás pidiendo limones al árbol de aguacates. Ese objeto no tiene esa propiedad, no te pases de listo.";
    }
    if (m.includes('possibly \'null\'') || m.includes('possibly \'undefined\'') || m.includes('possibly null') || m.includes('possibly undefined')) {
      return "Eso podría venir más vacío que tu cartera en fin de quincena. Agrégale un '?' para protegerlo o valídalo antes.";
    }
    if (m.includes('unexpected token') || m.includes('syntaxerror') || m.includes('syntax error')) {
      return "Te comiste un punto y coma o cerraste mal una llave. Revisa lento, no lleves prisa.";
    }
    if (m.includes('is not defined') || m.includes('is not assignable')) {
      return "Buscaste a alguien que no vive aquí. Esa variable no está declarada o no es compatible.";
    }
    if (m.includes('out of range') || m.includes('indexoutofbounds') || m.includes('out of bounds')) {
      return "Te saliste de la fila de las tortillas. El índice que buscas está fuera del tamaño de la lista.";
    }
    return null;
  }
}