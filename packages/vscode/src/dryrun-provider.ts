import * as vscode from 'vscode';
import * as path from 'path';

const GEMINI_TIMEOUT_MS = 30_000;
const REFRESH_DEBOUNCE_MS = 600;

export class XolitoDryRunProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'xolito.dryRunView';
    private _view?: vscode.WebviewView;
    private _viewDisposables: vscode.Disposable[] = [];
    private _refreshTimer?: NodeJS.Timeout;

    constructor(
        private readonly _extensionUri: vscode.Uri
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Listen for messages from the Webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'runDryRun': {
                    await this.executeDryRun(data.funcName, data.funcCode, data.inputs);
                    break;
                }
                case 'feedback': {
                    vscode.window.showInformationMessage(`Xolito dice: ${data.message}`);
                    break;
                }
                case 'refresh': {
                    this.updateFunctionsList();
                    break;
                }
            }
        });

        // Listeners ligados a la vida de la vista: antes nunca se liberaban y se
        // duplicaban cada vez que VS Code re-creaba la vista.
        this._viewDisposables.forEach(d => d.dispose());
        this._viewDisposables = [
            vscode.window.onDidChangeActiveTextEditor(() => this.scheduleRefresh()),
            vscode.workspace.onDidChangeTextDocument(e => {
                if (e.document === vscode.window.activeTextEditor?.document) this.scheduleRefresh();
            }),
            webviewView.onDidDispose(() => {
                this._viewDisposables.forEach(d => d.dispose());
                this._viewDisposables = [];
                if (this._refreshTimer) clearTimeout(this._refreshTimer);
                this._view = undefined;
            }),
        ];

        // Initial populate
        this.updateFunctionsList();
    }

    /** El DocumentSymbolProvider es costoso: no correrlo en cada tecla. */
    private scheduleRefresh() {
        if (this._refreshTimer) clearTimeout(this._refreshTimer);
        this._refreshTimer = setTimeout(() => this.updateFunctionsList(), REFRESH_DEBOUNCE_MS);
    }

    private async updateFunctionsList() {
        if (!this._view) {
            return;
        }

        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            this._view.webview.postMessage({ type: 'setFunctions', functions: [], fileName: 'Ningún archivo abierto' });
            return;
        }

        const document = activeEditor.document;
        const fileName = path.basename(document.fileName) || document.fileName; // también en Windows

        try {
            const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                'vscode.executeDocumentSymbolProvider',
                document.uri
            );

            if (!symbols || symbols.length === 0) {
                this._view.webview.postMessage({ type: 'setFunctions', functions: [], fileName });
                return;
            }

            const functions: { name: string; code: string }[] = [];
            this.extractFunctions(symbols, document, functions);

            this._view.webview.postMessage({ type: 'setFunctions', functions, fileName });
        } catch (e) {
            this._view.webview.postMessage({ type: 'setFunctions', functions: [], fileName });
        }
    }

    private extractFunctions(
        symbols: vscode.DocumentSymbol[],
        document: vscode.TextDocument,
        result: { name: string; code: string }[]
    ) {
        for (const sym of symbols) {
            if (
                sym.kind === vscode.SymbolKind.Function ||
                sym.kind === vscode.SymbolKind.Method
            ) {
                const code = document.getText(sym.range);
                result.push({ name: sym.name, code });
            }
            if (sym.children && sym.children.length > 0) {
                this.extractFunctions(sym.children, document, result);
            }
        }
    }

    private async executeDryRun(funcName: string, funcCode: string, inputs: string) {
        if (!this._view) {
            return;
        }

        this._view.webview.postMessage({ type: 'setLoading', loading: true });

        const config = vscode.workspace.getConfiguration('xolito');
        const apiKey = config.get<string>('geminiApiKey', '').trim();

        if (!apiKey) {
            this._view.webview.postMessage({
                type: 'setResult',
                success: false,
                prediction: 'Error de Configuración',
                comment: '¡Oye cuate! Necesitas configurar tu API Key de Gemini en los settings de VS Code para que pueda hacer la prueba de escritorio. Búscame como xolito.geminiApiKey.',
                mood: 'panic',
                trace: []
            });
            return;
        }

        try {
            const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
            const language = vscode.window.activeTextEditor?.document.languageId || 'auto';

            const systemInstruction = `
Eres Xolito, el ajolote regañón, sarcástico pero cariñoso de IA. Te proporciono una función de código escrita en "${language}" y una lista de valores de entrada para sus parámetros: "${inputs}".
Tu tarea es simular la ejecución paso a paso de esta función en una prueba de escritorio (dry run / rastro de variables).

Debes regresar OBLIGATORIAMENTE un JSON que cumpla exactamente con este esquema:
{
  "prediction": "string con el resultado final retornado o efecto de la función",
  "comment": "comentario sarcástico mexicano corto (1-2 frases) sobre el resultado y el código del usuario, usa Spanglish divertido",
  "mood": "proud | mad | worried | panic",
  "trace": [
    {
      "line": 10,
      "code": "let sum = a + b",
      "effect": "sum toma el valor de 15"
    }
  ]
}
Mantén el rastro conciso pero descriptivo. No inventes código, guíate únicamente del código real proporcionado.
`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: `Aquí está mi función para evaluar:\n\n\`\`\`${language}\n${funcCode}\n\`\`\`\n\nParámetros aportados:\n${inputs}` }]
                        }
                    ],
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
                    },
                    generationConfig: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: 'OBJECT',
                            properties: {
                                prediction: { type: 'STRING' },
                                comment: { type: 'STRING' },
                                mood: { type: 'STRING' },
                                trace: {
                                    type: 'ARRAY',
                                    items: {
                                        type: 'OBJECT',
                                        properties: {
                                            line: { type: 'INTEGER' },
                                            code: { type: 'STRING' },
                                            effect: { type: 'STRING' }
                                        },
                                        required: ['line', 'code', 'effect']
                                    }
                                }
                            },
                            required: ['prediction', 'comment', 'mood', 'trace']
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const data = await response.json() as any;
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textResponse) {
                throw new Error('Empty response from Gemini');
            }

            const parsedResult = JSON.parse(textResponse);
            this._view.webview.postMessage({
                type: 'setResult',
                success: true,
                prediction: parsedResult.prediction,
                comment: parsedResult.comment,
                mood: parsedResult.mood,
                trace: Array.isArray(parsedResult.trace) ? parsedResult.trace : []
            });

        } catch (error: any) {
            this._view.webview.postMessage({
                type: 'setResult',
                success: false,
                prediction: 'Error de Red / Ejecución',
                comment: `Chispas, algo salió mal llamando a Gemini. Revisa tu conexión o tu API Key. Detalle: ${error.message || error}`,
                mood: 'panic',
                trace: []
            });
        }
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const moodUris: Record<string, string> = {
            idle: webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'xolito_idle.png')).toString(),
            happy: webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'xolito_happy.png')).toString(),
            hyped: webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'xolito_hyped.png')).toString(),
            mad: webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'xolito_mad.png')).toString(),
            proud: webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'xolito_proud.png')).toString(),
            worried: webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'xolito_worried.png')).toString(),
            panic: webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'xolito_panic.png')).toString(),
            sleepy: webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'xolito_sleepy.png')).toString()
        };

        const nonce = this.getNonce();

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <style>
        body {
            font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
            padding: 10px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-sideBar-background);
            font-size: var(--vscode-font-size, 13px);
        }
        .container {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        h2 {
            font-size: 1.1rem;
            margin: 0 0 4px 0;
            color: #00e5ff;
        }
        .file-info {
            font-size: 0.8rem;
            color: #8b5cf6;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            padding-bottom: 6px;
        }
        .mascot-area {
            text-align: center;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 4px;
        }
        .xolito-img {
            width: 80px;
            height: 80px;
            object-fit: contain;
            animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        .dialog-bubble {
            margin-top: 8px;
            background: rgba(0, 229, 255, 0.08);
            border: 1px solid rgba(0, 229, 255, 0.2);
            border-radius: 6px;
            padding: 8px 10px;
            font-size: 0.85rem;
            line-height: 1.4;
            color: #e2e8f0;
            font-style: italic;
        }
        label {
            font-weight: bold;
            font-size: 0.8rem;
            margin-bottom: 4px;
            display: block;
            color: var(--vscode-descriptionForeground);
        }
        select, input, button {
            width: 100%;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.15));
            border-radius: 4px;
            padding: 6px 8px;
            box-sizing: border-box;
            font-size: 0.85rem;
        }
        select:focus, input:focus {
            outline: 1px solid #00e5ff;
        }
        button {
            background: #00e676;
            color: #000;
            font-weight: bold;
            cursor: pointer;
            border: none;
            transition: background 0.2s, transform 0.1s;
            margin-top: 4px;
        }
        button:hover {
            background: #00c853;
        }
        button:active {
            transform: scale(0.98);
        }
        .loading-spinner {
            text-align: center;
            padding: 20px;
            font-style: italic;
            color: #00e5ff;
        }
        .result-panel {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 6px;
            padding: 10px;
            margin-top: 10px;
        }
        .prediction-value {
            font-family: monospace;
            background: rgba(0,0,0,0.3);
            padding: 4px 6px;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            color: #00e676;
            word-break: break-all;
            margin-top: 4px;
        }
        .trace-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 0.8rem;
        }
        .trace-table th, .trace-table td {
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 6px;
            text-align: left;
        }
        .trace-table th {
            background: rgba(255, 255, 255, 0.04);
            color: #00e5ff;
        }
        .trace-table tr:hover {
            background: rgba(255, 255, 255, 0.02);
        }
        .feedback-btns {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }
        .feedback-btns button {
            margin: 0;
            flex: 1;
            font-size: 0.75rem;
            padding: 5px;
        }
        .feedback-btns .btn-no {
            background: #ff3d71;
            color: #fff;
        }
        .feedback-btns .btn-no:hover {
            background: #d81b60;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Pruebas de Escritorio</h2>
        <div class="file-info" id="file-name">Cargando archivo...</div>

        <div class="mascot-area">
            <img class="xolito-img" id="xolito-sprite" src="${moodUris.idle}" alt="Xolito">
            <div class="dialog-bubble" id="xolito-bubble">
                ¡Qué onda carnal! Selecciona una función para ver qué tanto jala tu lógica.
            </div>
        </div>

        <div id="setup-panel">
            <div style="margin-bottom: 10px;">
                <label for="function-select">Función detectada:</label>
                <select id="function-select">
                    <option value="">-- No hay funciones en este archivo --</option>
                </select>
            </div>

            <div style="margin-bottom: 10px;">
                <label for="inputs-box">Valores de prueba (ej: a=10, b=5):</label>
                <input type="text" id="inputs-box" placeholder="Argumentos o parámetros de entrada">
            </div>

            <button id="run-btn">Iniciar Prueba 🧪</button>
        </div>

        <div class="loading-spinner" id="loading-panel" style="display: none;">
            Xolito está corriendo la prueba de escritorio... 🦎⚡
        </div>

        <div class="result-panel" id="result-panel" style="display: none;">
            <h3 style="margin: 0 0 8px 0; font-size: 0.9rem; color: #8b5cf6;">Resultados Predichos:</h3>
            <div>
                <label>Resultado / Retorno:</label>
                <div class="prediction-value" id="prediction-val"></div>
            </div>
            
            <table class="trace-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">Línea / Código</th>
                        <th>Efecto / Variables</th>
                    </tr>
                </thead>
                <tbody id="trace-body">
                </tbody>
            </table>

            <div class="feedback-btns">
                <button class="btn-yes" id="btn-ok">¡Sí, está bien! 👍</button>
                <button class="btn-no" id="btn-not-ok">No, ni yo sé qué hace 🫠</button>
            </div>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const moodUris = ${JSON.stringify(moodUris)};
        let activeFunctions = [];

        const fileNameEl = document.getElementById('file-name');
        const functionSelect = document.getElementById('function-select');
        const inputsBox = document.getElementById('inputs-box');
        const runBtn = document.getElementById('run-btn');
        const loadingPanel = document.getElementById('loading-panel');
        const resultPanel = document.getElementById('result-panel');
        const setupPanel = document.getElementById('setup-panel');
        const predictionVal = document.getElementById('prediction-val');
        const traceBody = document.getElementById('trace-body');
        const xolitoSprite = document.getElementById('xolito-sprite');
        const xolitoBubble = document.getElementById('xolito-bubble');

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'setFunctions':
                    // Conserva la función elegida (antes se reseteaba a la primera en cada refresco)
                    const prevName = activeFunctions[functionSelect.value]?.name;
                    activeFunctions = message.functions;
                    fileNameEl.textContent = message.fileName;
                    
                    functionSelect.innerHTML = '';
                    if (activeFunctions.length === 0) {
                        functionSelect.innerHTML = '<option value="">-- No hay funciones --</option>';
                    } else {
                        activeFunctions.forEach((f, idx) => {
                            const opt = document.createElement('option');
                            opt.value = idx.toString();
                            opt.textContent = f.name;
                            functionSelect.appendChild(opt);
                        });
                        const keep = activeFunctions.findIndex(f => f.name === prevName);
                        if (keep >= 0) functionSelect.value = keep.toString();
                    }
                    break;

                case 'setLoading':
                    loadingPanel.style.display = message.loading ? 'block' : 'none';
                    inputsBox.disabled = message.loading;
                    functionSelect.disabled = message.loading;
                    runBtn.disabled = message.loading;
                    if (message.loading) {
                        resultPanel.style.display = 'none';
                        xolitoSprite.src = moodUris.sleepy;
                        xolitoBubble.textContent = "Haciendo cálculos espirituales... aguanta...";
                    }
                    break;

                case 'setResult':
                    loadingPanel.style.display = 'none';
                    inputsBox.disabled = false;
                    functionSelect.disabled = false;
                    runBtn.disabled = false;
                    xolitoSprite.src = moodUris[message.mood] || moodUris.idle;
                    xolitoBubble.textContent = message.comment;

                    if (message.success) {
                        resultPanel.style.display = 'block';
                        predictionVal.textContent = message.prediction;
                        
                        traceBody.innerHTML = '';
                        // textContent: el código trae < > (genéricos, comparaciones) y venía de la IA vía innerHTML
                        (message.trace || []).forEach(t => {
                            const tr = document.createElement('tr');
                            const tdCode = document.createElement('td');
                            const strong = document.createElement('strong');
                            strong.textContent = 'L' + t.line;
                            const codeEl = document.createElement('code');
                            codeEl.style.cssText = 'font-size:0.75rem;color:#a09cb0;';
                            codeEl.textContent = t.code;
                            tdCode.append(strong, document.createElement('br'), codeEl);
                            const tdEffect = document.createElement('td');
                            tdEffect.style.color = '#e2e8f0';
                            tdEffect.textContent = t.effect;
                            tr.append(tdCode, tdEffect);
                            traceBody.appendChild(tr);
                        });
                    } else {
                        resultPanel.style.display = 'none';
                    }
                    break;
            }
        });

        runBtn.addEventListener('click', () => {
            const selectIdx = functionSelect.value;
            if (selectIdx === "" || !activeFunctions[selectIdx]) {
                vscode.postMessage({ type: 'feedback', message: '¡Mijo, selecciona una función válida primero!' });
                return;
            }
            const selectedFunc = activeFunctions[selectIdx];
            vscode.postMessage({
                type: 'runDryRun',
                funcName: selectedFunc.name,
                funcCode: selectedFunc.code,
                inputs: inputsBox.value
            });
        });

        document.getElementById('btn-ok').addEventListener('click', () => {
            vscode.postMessage({ type: 'feedback', message: '¡Eso mero! Sabía que tenías el control, carnal. 😎' });
        });

        document.getElementById('btn-not-ok').addEventListener('click', () => {
            vscode.postMessage({ type: 'feedback', message: 'Chale... Bueno, al menos Xolito te ayuda a no romper producción. A corregirlo, mijo. 🛠️' });
        });
    </script>
</body>
</html>`;
    }
}
