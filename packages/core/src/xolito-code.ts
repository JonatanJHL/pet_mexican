// ============================================================
//  xolito/packages/core/src/xolito-code.ts
//  Motor híbrido de evaluación de código (Xolito)
// ============================================================

export interface CodeEvaluationResult {
  score: number; // 0 - 10
  semantica: { score: number; passed: boolean; comment: string };
  robustez: { score: number; passed: boolean; comment: string };
  modularidad: { score: number; passed: boolean; comment: string };
  documentacion: { score: number; passed: boolean; comment: string };
  xolitoRegaño: string; // Comentario picoso mexicano de Xolito
  refactoredCode?: string; // Código limpio y mejorado propuesto
  mode: 'online' | 'offline';
  language: string; // El lenguaje detectado/evaluado
}

/**
 * Detecta el lenguaje de programación de forma offline mediante heurísticas rápidas.
 */
export function detectLanguageOffline(code: string): string {
  const c = code.trim();
  if (/#include\b|\bstd::\b|\bcout\b/.test(c)) return 'cpp';
  if (/\bdef\s+\w+\s*\(|\bimport\s+[a-z_]+\b|\bprint\s*\(/.test(c)) return 'python';
  if (/\bfun\s+\w+\s*\(|\bval\s+\w+\b|\bvar\s+\w+\b/.test(c)) {
    if (/\bfun\b|\bval\b/.test(c)) return 'kotlin';
  }
  if (/\bpublic\s+class\b|\bSystem\.out\.print/.test(c)) return 'java';
  if (/\binterface\s+\w+\b|\btype\s+\w+\s*=|\b:\s*(number|string|boolean|any|void)\b/.test(c)) return 'typescript';
  if (/\bfn\s+\w+\s*\(|\bpub\s+fn\b|\buse\s+std::|\bprintln!|\blet\s+mut\b/.test(c)) return 'rust';
  if (/\bpackage\s+\w+\b|\bfunc\s+\w+\s*\(|\berr\s*!=\s*nil\b/.test(c)) return 'go';
  if (/\busing\s+System\b|\bnamespace\s+\w+\b|\bConsole\.WriteLine\b/.test(c)) return 'csharp';
  if (/<\?php\b|\b\$[a-zA-Z_]\w*\b/.test(c)) return 'php';
  if (/\bdef\s+[a-z_]\w*\b(?:\s+|\([\s\S]*?\))\n[\s\S]*?\bend\b|\bputs\s+["']|\battr_(?:reader|writer|accessor)\b/.test(c)) return 'ruby';
  return 'javascript';
}

/**
 * Evalúa el código de manera local y offline mediante heurísticas estáticas (regex).
 */
export function evaluateCodeOffline(code: string, language: string): CodeEvaluationResult {
  const cleanCode = code.trim();
  const lines = cleanCode.split('\n');
  const totalLines = lines.length;

  const evaluatedLanguage = (language === 'auto' || !language) ? detectLanguageOffline(code) : language;

  // 1. SEMÁNTICA (0 - 2 pts)
  let semanticaScore = 2;
  let semanticaComment = 'Nombres y estilo coherentes. Así se hace.';
  let semanticaPassed = true;

  // Patrones Spanglish: verbos en inglés con nombres en español o viceversa
  const spanglishPatterns = [
    /\bget_[a-z]*[A-Z]|\bfetch[_]?[A-ZÁÉÍÓÚÑ]/,
    /\b[a-z]+_[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b/,
    /\b(get|set|fetch|update|delete|create)[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/,
  ];

  const hasSpanglish = spanglishPatterns.some(p => p.test(cleanCode));
  // Variables de una sola letra declaradas localmente
  const singleLetterVars = /\b(let|const|var|val)\s+[a-ghl-z]\b/.test(cleanCode);

  if (hasSpanglish) {
    semanticaScore = 0;
    semanticaPassed = false;
    semanticaComment = 'Se detectó mezcla de idiomas (Spanglish) en variables/funciones. ¡Elige uno solo, mijo!';
  } else if (singleLetterVars) {
    semanticaScore = 1;
    semanticaPassed = false;
    semanticaComment = 'Usas variables con nombres de una sola letra (ej: x, y). ¡Dales un nombre descriptivo, no seas codo!';
  }

  // 2. ROBUSTEZ (0 - 3 pts)
  let robustezScore = 3;
  let robustezComment = 'Manejo de errores básico detectado.';
  let robustezPassed = true;

  const emptyCatch = /catch\s*\(\s*\w*\s*\)\s*\{\s*(\/\/.*|\/\*[\s\S]*?\*\/|\s)*\}/.test(cleanCode);
  const doubleBangKotlin = /!!/.test(cleanCode) && (evaluatedLanguage === 'kotlin' || evaluatedLanguage === 'java');
  const hasTryCatch = /try\s*\{/.test(cleanCode) || /catch\s*\(/.test(cleanCode);

  if (emptyCatch) {
    robustezScore = 0;
    robustezPassed = false;
    robustezComment = '¡Encontré un bloque catch vacío! Tapar los errores con un dedo no los soluciona, mijo.';
  } else if (doubleBangKotlin) {
    robustezScore = 1;
    robustezPassed = false;
    robustezComment = 'Usaste double bang (!!) en Kotlin. Eso es jugar a la ruleta rusa con los NullPointerException.';
  } else if (!hasTryCatch && totalLines > 15) {
    robustezScore = 2;
    robustezComment = 'No veo bloques try-catch para proteger lógica propensa a fallar. Ojo ahí.';
  } else {
    robustezComment = 'Estructura robusta. Control de excepciones presente o no requerido para este tamaño.';
  }

  // 3. MODULARIDAD (0 - 3 pts)
  let modularidadScore = 3;
  let modularidadComment = 'Función compacta y bien acotada.';
  let modularidadPassed = true;

  // Medir longitud
  const longFunction = totalLines > 40;
  const mediumFunction = totalLines > 20;

  // Medir anidamiento excesivo (3 niveles de indentación profunda de llaves)
  const nestedIndent = /\{\s*\n\s*\{\s*\n\s*\{/.test(cleanCode.replace(/\s+/g, ' '));
  const deepIndentation = lines.some(line => /^\s{12,}\S/.test(line));

  if (longFunction) {
    modularidadScore = 1;
    modularidadPassed = false;
    modularidadComment = `La función es larguísima (${totalLines} líneas). Divídela en pedacitos más pequeños.`;
  } else if (nestedIndent || deepIndentation) {
    modularidadScore = 1;
    modularidadPassed = false;
    modularidadComment = 'Detecté anidación muy profunda (código pirámide). Aplica cláusulas de guarda (guard clauses).';
  } else if (mediumFunction) {
    modularidadScore = 2;
    modularidadComment = 'Tiene un tamaño moderado. Aceptable, pero mantente alerta.';
  }

  // 4. DOCUMENTACIÓN (0 - 2 pts)
  let documentacionScore = 2;
  let documentacionComment = 'Comentarios aclaratorios presentes.';
  let documentacionPassed = true;

  const commentPatterns = /(\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*|#.*)/;
  const hasComments = commentPatterns.test(cleanCode);

  if (!hasComments && totalLines > 10) {
    documentacionScore = 0;
    documentacionPassed = false;
    documentacionComment = 'Ni un solo comentario explicativo en esta función. Tu yo del futuro no va a entender nada.';
  } else if (!hasComments && totalLines <= 10) {
    documentacionScore = 2;
    documentacionComment = 'Código corto y autoexplicativo, no requiere comentarios extra.';
  }

  // PUNTUACIÓN TOTAL
  const score = semanticaScore + robustezScore + modularidadScore + documentacionScore;

  // REGAÑO DE XOLITO DINÁMICO
  let xolitoRegaño = 'No tengo opinión de este código, mijo.';
  if (score >= 9) {
    xolitoRegaño = '¡No manches! Tu código está más limpio que mi conciencia. Te daría un abrazo si tuviera brazos. 🦎✨';
  } else if (score >= 7) {
    xolitoRegaño = 'Está dos-tres, jala y se ve decente. Pero le puedes pulir esos detalles para que quede de rechupete. 👍';
  } else if (score >= 5) {
    xolitoRegaño = 'Ay, mijo... compila de milagro. Le falta amor, orden y que le quites las malas mañas. Ponte las pilas. 😬';
  } else {
    xolitoRegaño = '¡Qué es esta porquería! 👹 Parece código espagueti de estudiante de primer semestre. Refactoriza eso ya o te cae la maldición de producción.';
  }

  return {
    score,
    semantica: { score: semanticaScore, passed: semanticaPassed, comment: semanticaComment },
    robustez: { score: robustezScore, passed: robustezPassed, comment: robustezComment },
    modularidad: { score: modularidadScore, passed: modularidadPassed, comment: modularidadComment },
    documentacion: { score: documentacionScore, passed: documentacionPassed, comment: documentacionComment },
    xolitoRegaño,
    mode: 'offline',
    language: evaluatedLanguage,
  };
}

/**
 * Evalúa el código usando la API de Gemini 2.0 y regresa un análisis semántico estructurado.
 */
export async function evaluateCodeWithGemini(
  code: string,
  language: string,
  apiKey: string
): Promise<CodeEvaluationResult> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const systemInstruction = `
Eres Xolito, el ajolote regañón, sarcástico pero cariñoso que audita código y ayuda a los desarrolladores a escribir código limpio y estructurado en español mexicano con Spanglish casual ("mijo", "cuate", "la regaste", "órale", etc.).
El usuario indica que el lenguaje original es "${language}". Si es "auto", debes auto-detectar el lenguaje del código (ej. typescript, javascript, kotlin, java, python, cpp) y asignarlo al campo "language" de tu respuesta JSON. Si no es "auto", usa ese mismo lenguaje y devuélvelo en el campo "language" del JSON.
Evalúa el fragmento de código que te proporciona el usuario siguiendo el "Toolkit de Código Limpio de Xolito":

1. Semántica y Estilo (0-2 pts): convenciones del lenguaje, nombres descriptivos, consistencia de idioma (cero spanglish en el código).
2. Robustez y Seguridad (0-3 pts): validaciones, null-safety, control de excepciones (prohibido catch vacíos).
3. Modularidad y Cohesión (0-3 pts): Principio de Responsabilidad Única, funciones cortas, baja anidación.
4. Documentación y Testabilidad (0-2 pts): comentarios útiles en partes complejas y estructura fácil de testear.

Debes regresar OBLIGATORIAMENTE un JSON que cumpla exactamente con el esquema especificado, incluyendo:
- score: número total de puntos obtenidos (0-10).
- language: el lenguaje detectado o verificado (ej. "kotlin", "typescript", "javascript", "java", "python", "cpp").
- semantica: objeto con score (0-2), passed (boolean) y comment (string explicativo breve).
- robustez: objeto con score (0-3), passed (boolean) y comment (string explicativo breve).
- modularidad: objeto con score (0-3), passed (boolean) y comment (string explicativo breve).
- documentacion: objeto con score (0-2), passed (boolean) y comment (string explicativo breve).
- xolitoRegaño: una frase de retroalimentación muy divertida, picosa y con el estilo de Xolito (1-2 oraciones cortas, muy mexicana).
- refactoredCode: el código fuente completamente corregido, limpio y optimizado, respetando la estructura original pero aplicando las mejores prácticas descritas.
`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `Aquí está mi código en ${language} para evaluar:\n\n\`\`\`${language}\n${code}\n\`\`\`` }]
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
              score: { type: 'INTEGER' },
              language: { type: 'STRING' },
              semantica: {
                type: 'OBJECT',
                properties: {
                  score: { type: 'INTEGER' },
                  passed: { type: 'BOOLEAN' },
                  comment: { type: 'STRING' }
                },
                required: ['score', 'passed', 'comment']
              },
              robustez: {
                type: 'OBJECT',
                properties: {
                  score: { type: 'INTEGER' },
                  passed: { type: 'BOOLEAN' },
                  comment: { type: 'STRING' }
                },
                required: ['score', 'passed', 'comment']
              },
              modularidad: {
                type: 'OBJECT',
                properties: {
                  score: { type: 'INTEGER' },
                  passed: { type: 'BOOLEAN' },
                  comment: { type: 'STRING' }
                },
                required: ['score', 'passed', 'comment']
              },
              documentacion: {
                type: 'OBJECT',
                properties: {
                  score: { type: 'INTEGER' },
                  passed: { type: 'BOOLEAN' },
                  comment: { type: 'STRING' }
                },
                required: ['score', 'passed', 'comment']
              },
              xolitoRegaño: { type: 'STRING' },
              refactoredCode: { type: 'STRING' }
            },
            required: [
              'score',
              'language',
              'semantica',
              'robustez',
              'modularidad',
              'documentacion',
              'xolitoRegaño',
              'refactoredCode'
            ]
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error de red Gemini API: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Respuesta vacía de la API de Gemini');
    }

    const result = JSON.parse(candidateText) as Omit<CodeEvaluationResult, 'mode'>;
    return {
      ...result,
      mode: 'online'
    };
  } catch (err) {
    // Si falla por falta de internet o error de API, caemos en offline de forma transparente
    console.error('Gemini error, falling back to offline evaluator:', err);
    return {
      ...evaluateCodeOffline(code, language),
      mode: 'offline'
    };
  }
}
