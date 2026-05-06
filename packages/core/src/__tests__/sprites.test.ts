// ============================================================
//  sprites.test.ts
//  Tests para el arte ASCII de Xolito
//  "Si el sprite no mide bien, se ve feo. Y Xolito no es feo."
// ============================================================

import { describe, it, expect } from 'vitest';
import { SPRITES, renderWithBubble } from '../sprites.js';
import type { XolitoMood } from '../types.js';

const ALL_MOODS: XolitoMood[] = [
  'idle', 'happy', 'mad', 'sleepy', 'sassy',
  'proud', 'worried', 'hyped', 'tired', 'judging',
];

// ── Estructura de sprites ────────────────────────────────────

describe('SPRITES — estructura', () => {

  it('tiene sprite para cada mood', () => {
    for (const mood of ALL_MOODS) {
      expect(SPRITES[mood], `Mood "${mood}" no tiene sprite`).toBeDefined();
    }
  });

  it('cada sprite tiene exactamente 5 líneas', () => {
    for (const mood of ALL_MOODS) {
      expect(
        SPRITES[mood].length,
        `Sprite "${mood}" tiene ${SPRITES[mood].length} líneas, necesita exactamente 5`
      ).toBe(5);
    }
  });

  it('cada línea del sprite tiene exactamente 11 caracteres', () => {
    for (const mood of ALL_MOODS) {
      for (const [i, line] of SPRITES[mood].entries()) {
        expect(
          line.length,
          `Sprite "${mood}" línea ${i} tiene ${line.length} chars: "${line}"`
        ).toBe(11);
      }
    }
  });

  it('ningún sprite tiene líneas vacías', () => {
    for (const mood of ALL_MOODS) {
      for (const [i, line] of SPRITES[mood].entries()) {
        expect(line.trim(), `Sprite "${mood}" línea ${i} está vacía`).not.toBe('');
      }
    }
  });

  it('todos los sprites son distintos (cada mood tiene su cara)', () => {
    const firmas = ALL_MOODS.map(mood => SPRITES[mood][0]); // primera línea = cara
    const unicas = new Set(firmas);
    expect(
      unicas.size,
      'Hay sprites con la misma expresión — cada mood debe verse diferente'
    ).toBe(ALL_MOODS.length);
  });

});

// ── renderWithBubble() ────────────────────────────────────────

describe('renderWithBubble() — burbuja de diálogo', () => {

  it('regresa un string no vacío', () => {
    const result = renderWithBubble('happy', '¡Órale, compiló!');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('incluye el mensaje en la salida', () => {
    const msg = '¡Compiló sin errores!';
    const result = renderWithBubble('happy', msg);
    expect(result).toContain(msg);
  });

  it('incluye el sprite del mood correcto', () => {
    for (const mood of ALL_MOODS) {
      const result = renderWithBubble(mood, 'test');
      // La última línea del sprite debe aparecer en el render
      const lastLine = SPRITES[mood][4];
      expect(result, `Render de "${mood}" no incluye su sprite`).toContain(lastLine.trim());
    }
  });

  it('incluye bordes de burbuja (╭ y ╰)', () => {
    const result = renderWithBubble('sassy', 'mensaje de prueba');
    expect(result).toContain('╭');
    expect(result).toContain('╰');
    expect(result).toContain('│');
  });

  it('no truena con mensajes muy largos (> 100 chars)', () => {
    const msgLargo = 'Este es un mensaje muy muy largo que definitivamente va a necesitar ser partido en varias líneas porque no cabe en una sola línea de la burbuja de diálogo de Xolito';
    expect(() => renderWithBubble('sassy', msgLargo)).not.toThrow();
    const result = renderWithBubble('sassy', msgLargo);
    expect(result).toBeTruthy();
  });

  it('no truena con mensajes de un solo carácter', () => {
    expect(() => renderWithBubble('judging', '.')).not.toThrow();
  });

  it('no truena con mensaje vacío', () => {
    expect(() => renderWithBubble('idle', '')).not.toThrow();
  });

  it('el resultado tiene más líneas que solo el sprite (hay burbuja encima)', () => {
    const result = renderWithBubble('mad', 'Error detectado');
    const lineas = result.split('\n');
    expect(lineas.length).toBeGreaterThan(5); // sprite solo = 5 líneas
  });

  it('el ancho de la burbuja se ajusta al mensaje', () => {
    const corto = renderWithBubble('happy', 'Ok');
    const largo = renderWithBubble('happy', 'Este mensaje es bastante más largo que el anterior');
    const anchoBurbCorta  = corto.split('\n')[0].length;
    const anchoBurbLarga  = largo.split('\n')[0].length;
    expect(anchoBurbLarga).toBeGreaterThan(anchoBurbCorta);
  });

  it('maneja caracteres especiales y emojis sin tronar', () => {
    const msgs = [
      '¡Ay, cabrón! 💀',
      'Error en línea 42 🔴',
      'push --force ← esto no, mijo',
      '¿Y el PR? ¿Dónde quedó?',
    ];
    for (const msg of msgs) {
      expect(() => renderWithBubble('mad', msg)).not.toThrow();
    }
  });

});
