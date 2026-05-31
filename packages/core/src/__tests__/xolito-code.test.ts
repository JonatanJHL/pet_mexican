import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateCodeOffline, evaluateCodeWithGemini } from '../xolito-code.js';

describe('Xolito para Código — Evaluador Local Offline', () => {

  it('evalúa código limpio y perfecto con puntuación alta', () => {
    const perfectCode = `
      // Esta función suma dos números de forma segura
      function addNumbers(a: number, b: number): number {
        if (typeof a !== 'number' || typeof b !== 'number') {
          throw new Error('Parámetros inválidos');
        }
        return a + b;
      }
    `;
    const result = evaluateCodeOffline(perfectCode, 'typescript');
    expect(result.score).toBe(10);
    expect(result.semantica.passed).toBe(true);
    expect(result.robustez.passed).toBe(true);
    expect(result.modularidad.passed).toBe(true);
    expect(result.documentacion.passed).toBe(true);
    expect(result.xolitoRegaño).toContain('limpio');
  });

  it('detecta Spanglish y reduce puntuación en semántica', () => {
    const spanglishCode = `
      function getDatosCliente() {
        const users = fetchUsuarios();
        return users;
      }
    `;
    const result = evaluateCodeOffline(spanglishCode, 'javascript');
    expect(result.semantica.score).toBe(0);
    expect(result.semantica.passed).toBe(false);
    expect(result.semantica.comment).toContain('Spanglish');
  });

  it('detecta variables de una sola letra', () => {
    const singleLetterCode = `
      function processData(value: string) {
        const x = value.trim();
        return x;
      }
    `;
    const result = evaluateCodeOffline(singleLetterCode, 'typescript');
    expect(result.semantica.score).toBe(1);
    expect(result.semantica.passed).toBe(false);
    expect(result.semantica.comment).toContain('una sola letra');
  });

  it('detecta catch vacío y reduce puntuación en robustez', () => {
    const emptyCatchCode = `
      function loadConfig() {
        try {
          doSomethingSensitive();
        } catch (e) {
          // Vacío
        }
      }
    `;
    const result = evaluateCodeOffline(emptyCatchCode, 'javascript');
    expect(result.robustez.score).toBe(0);
    expect(result.robustez.passed).toBe(false);
    expect(result.robustez.comment).toContain('catch vacío');
  });

  it('detecta double bang (!!) en Kotlin', () => {
    const kotlinCode = `
      fun saveUser(user: User?) {
        val name = user!!.name
        db.save(name)
      }
    `;
    const result = evaluateCodeOffline(kotlinCode, 'kotlin');
    expect(result.robustez.score).toBe(1);
    expect(result.robustez.passed).toBe(false);
    expect(result.robustez.comment).toContain('double bang');
  });

  it('detecta código demasiado largo en modularidad', () => {
    // Generar un código largo de más de 45 líneas
    const lines = [];
    lines.push('function longFn() {');
    for (let i = 0; i < 48; i++) {
      lines.push(`  console.log("linea ${i}");`);
    }
    lines.push('}');
    const longCode = lines.join('\n');

    const result = evaluateCodeOffline(longCode, 'javascript');
    expect(result.modularidad.score).toBe(1);
    expect(result.modularidad.passed).toBe(false);
    expect(result.modularidad.comment).toContain('larguísima');
  });

  it('detecta falta de comentarios en documentación si el código es largo', () => {
    const noCommentsCode = `
      function updateRecord(id: string, payload: any) {
        const record = db.find(id);
        if (!record) return null;
        record.update(payload);
        db.save(record);
        return record;
      }
    `; // 9 líneas, no comentarios (permitido sin penalizar ya que es corto)
    const longNoCommentsCode = `
      function updateRecord(id: string, payload: any) {
        const record = db.find(id);
        if (!record) return null;
        record.update(payload);
        db.save(record);
        console.log("guardado");
        console.log("guardado");
        console.log("guardado");
        console.log("guardado");
        console.log("guardado");
        console.log("guardado");
        return record;
      }
    `; // Más de 10 líneas, sin comentarios (penalizado)

    const resultShort = evaluateCodeOffline(noCommentsCode, 'javascript');
    expect(resultShort.documentacion.score).toBe(2);

    const resultLong = evaluateCodeOffline(longNoCommentsCode, 'javascript');
    expect(resultLong.documentacion.score).toBe(0);
    expect(resultLong.documentacion.passed).toBe(false);
    expect(resultLong.documentacion.comment).toContain('comentario');
  });

  it('auto-detecta el lenguaje cuando se pasa "auto"', () => {
    const kotlinCode = `
      fun main() {
        val hello = "Hola"
        println(hello)
      }
    `;
    const cppCode = `
      #include <iostream>
      void main() {
        std::cout << "Hola";
      }
    `;
    const pythonCode = `
      def main():
        print("Hola")
    `;
    const tsCode = `
      interface User {
        name: string;
      }
    `;
    const rustCode = `
      fn main() {
        let mut x = 5;
        println!("Hello {}", x);
      }
    `;
    const goCode = `
      package main
      import "fmt"
      func main() {
        fmt.Println("Hello")
      }
    `;
    const csharpCode = `
      using System;
      namespace HelloWorld {
        class Program {
          static void Main() {
            Console.WriteLine("Hello");
          }
        }
      }
    `;
    const phpCode = `
      <?php
      $name = "Xolito";
      echo $name;
    `;
    const rubyCode = `
      def greet
        puts "Hello"
      end
    `;
    
    expect(evaluateCodeOffline(kotlinCode, 'auto').language).toBe('kotlin');
    expect(evaluateCodeOffline(cppCode, 'auto').language).toBe('cpp');
    expect(evaluateCodeOffline(pythonCode, 'auto').language).toBe('python');
    expect(evaluateCodeOffline(tsCode, 'auto').language).toBe('typescript');
    expect(evaluateCodeOffline(rustCode, 'auto').language).toBe('rust');
    expect(evaluateCodeOffline(goCode, 'auto').language).toBe('go');
    expect(evaluateCodeOffline(csharpCode, 'auto').language).toBe('csharp');
    expect(evaluateCodeOffline(phpCode, 'auto').language).toBe('php');
    expect(evaluateCodeOffline(rubyCode, 'auto').language).toBe('ruby');
  });


});

describe('Xolito para Código — Evaluador Online (Gemini)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('cae en modo offline si la llamada a fetch falla o no hay conexión', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const code = `function dummy() { return 1; }`;
    const result = await evaluateCodeWithGemini(code, 'javascript', 'FAKE_KEY');

    expect(result.mode).toBe('offline');
    expect(result.score).toBeDefined();
    globalThis.fetch = originalFetch;
  });

  it('llama exitosamente a Gemini API y formatea el JSON retornado', async () => {
    const mockApiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  score: 8,
                  language: 'javascript',
                  semantica: { score: 2, passed: true, comment: 'Bien' },
                  robustez: { score: 2, passed: true, comment: 'Decente' },
                  modularidad: { score: 2, passed: true, comment: 'Aceptable' },
                  documentacion: { score: 2, passed: true, comment: 'Completo' },
                  xolitoRegaño: '¡Está chido tu código, mijo! Pero dale amor.',
                  refactoredCode: 'function dummy() {\n  return 1;\n}'
                })
              }
            ]
          }
        }
      ]
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });

    const code = `function dummy() { return 1; }`;
    const result = await evaluateCodeWithGemini(code, 'javascript', 'VALID_KEY');

    expect(result.mode).toBe('online');
    expect(result.score).toBe(8);
    expect(result.language).toBe('javascript');
    expect(result.xolitoRegaño).toBe('¡Está chido tu código, mijo! Pero dale amor.');
    expect(result.refactoredCode).toBe('function dummy() {\n  return 1;\n}');

    globalThis.fetch = originalFetch;
  });
});
