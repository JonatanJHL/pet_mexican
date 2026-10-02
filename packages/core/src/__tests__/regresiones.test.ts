import { describe, it, expect } from 'vitest';
import { evaluateCodeOffline, detectLanguageOffline } from '../xolito-code.js';
import { findSpanglish, hasSpanglish } from '../spanglish.js';
import { glitchText } from '../corruption.js';
import { renderWithBubble } from '../sprites.js';

describe('Spanglish', () => {
  it('no marca inglés puro (setState, getUser, createElement, get_items)', () => {
    expect(hasSpanglish('setState(1); getUser(); createElement("div"); get_items(); setError(e);')).toBe(false);
  });

  it('detecta verbo inglés + sustantivo español en camel y snake', () => {
    expect(hasSpanglish('getDatosCliente()')).toBe(true);
    expect(hasSpanglish('fetchUsuarios()')).toBe(true);
    expect(hasSpanglish('get_datos_cliente()')).toBe(true);
    expect(hasSpanglish('updateDirección()')).toBe(true);
  });

  it('findSpanglish termina y es repetible (sin estado de lastIndex)', () => {
    const text = 'fetchUsuarios(); getFactura(); fetchUsuarios();';
    expect(findSpanglish(text)).toHaveLength(3);
    expect(findSpanglish(text)).toHaveLength(3);
  });
});

describe('Detección de lenguaje', () => {
  it('import de ES modules no es Python', () => {
    expect(detectLanguageOffline("import express from 'express';\nconst app = express();")).toBe('javascript');
  });
  it('Python con import simple', () => {
    expect(detectLanguageOffline('import os\nos.getcwd()')).toBe('python');
  });
  it('PHP sin etiqueta <?php', () => {
    expect(detectLanguageOffline("$name = 'x';\necho $name;")).toBe('php');
  });
  it('Ruby con def(args) no se confunde con Python', () => {
    expect(detectLanguageOffline('def greet(name)\n  puts "Hola #{name}"\nend')).toBe('ruby');
  });
});

describe('Evaluador offline', () => {
  it('catch vacío en Java, Kotlin, JS sin binding y Python', () => {
    expect(evaluateCodeOffline('try { a(); } catch (Exception e) { }', 'java').robustez.score).toBe(0);
    expect(evaluateCodeOffline('try { a() } catch (e: Exception) {}', 'kotlin').robustez.score).toBe(0);
    expect(evaluateCodeOffline('try { a(); } catch {}', 'javascript').robustez.score).toBe(0);
    expect(evaluateCodeOffline('try:\n    a()\nexcept Exception:\n    pass', 'python').robustez.score).toBe(0);
  });

  it('detecta anidación de 4 niveles de llaves', () => {
    const nested = 'function f(){\n if(a){\n  for(;;){\n   if(b){\n    x();\n   }\n  }\n }\n}';
    expect(evaluateCodeOffline(nested, 'javascript').modularidad.score).toBe(1);
  });

  it('no penaliza indentación base de una selección pegada', () => {
    const selected = 'function f() {\n' + '                return 1;\n' + '            }';
    expect(evaluateCodeOffline(selected, 'javascript').modularidad.score).toBe(3);
  });

  it("'#fff' o #include no cuentan como comentario en JS/C++", () => {
    const js = Array(12).fill("const color = '#fff';").join('\n');
    expect(evaluateCodeOffline(js, 'javascript').documentacion.score).toBe(0);
    const cpp = '#include <iostream>\n' + Array(11).fill('int a = 1;').join('\n');
    expect(evaluateCodeOffline(cpp, 'cpp').documentacion.score).toBe(0);
  });

  it('# sí es comentario en Python', () => {
    const py = '# suma\n' + Array(11).fill('x_val = 1').join('\n');
    expect(evaluateCodeOffline(py, 'python').documentacion.score).toBe(2);
  });
});

describe('Utilidades', () => {
  it('glitchText no rompe emojis', () => {
    const out = glitchText('👹🦎', 100);
    expect(out).not.toContain('\uFFFD');
    expect(Array.from(out).filter(c => c === '👹' || c === '🦎')).toHaveLength(2);
  });

  it('renderWithBubble no agrega línea vacía con palabras largas', () => {
    const out = renderWithBubble('idle', 'a'.repeat(50));
    expect(out).not.toMatch(/│\s+│/);
  });
});
