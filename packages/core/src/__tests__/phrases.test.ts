// ============================================================
//  phrases.test.ts
//  Tests para el banco de frases de Xolito
//  "Si los tests fallan, Xolito te va a regañar."
// ============================================================

import { describe, it, expect } from 'vitest';
import { PHRASES, getPhrase } from '../phrases.js';
import type { XolitoEvent, XolitoMood } from '../types.js';

// Todos los eventos que deben tener frases
const ALL_EVENTS: XolitoEvent[] = [
  'build_success', 'build_fail', 'test_pass', 'test_fail',
  'save_no_comments', 'push_to_main', 'long_function',
  'no_commits_1h', 'no_commits_3h', 'first_commit_today',
  'npm_install', 'heavy_node_modules', 'syntax_error',
  'console_log_left', 'todo_comment', 'merge_conflict',
  'late_night_coding', 'weekend_coding', 'git_force_push',
  'deleted_tests', 'idle_10min', 'idle_30min', 'greeted',
  'boss_alert',
];

// Todos los moods válidos
const VALID_MOODS: XolitoMood[] = [
  'idle', 'happy', 'mad', 'sleepy', 'sassy',
  'proud', 'worried', 'hyped', 'tired', 'judging', 'panic',
];

// ── Estructura del banco de frases ───────────────────────────

describe('PHRASES — estructura del banco', () => {

  it('tiene frases para todos los eventos definidos', () => {
    for (const event of ALL_EVENTS) {
      expect(
        PHRASES[event],
        `Evento "${event}" no tiene frases — Xolito está mudo`
      ).toBeDefined();
    }
  });

  it('cada evento tiene al menos 3 frases (para no repetirse tanto)', () => {
    for (const event of ALL_EVENTS) {
      expect(
        PHRASES[event].length,
        `Evento "${event}" tiene muy pocas frases (${PHRASES[event]?.length ?? 0}), mínimo 3`
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('no hay eventos extra que no estén tipados', () => {
    const bankKeys = Object.keys(PHRASES) as XolitoEvent[];
    for (const key of bankKeys) {
      expect(
        ALL_EVENTS,
        `Evento "${key}" está en PHRASES pero no en el tipo XolitoEvent`
      ).toContain(key);
    }
  });

});

// ── Validación de cada frase individual ─────────────────────

describe('PHRASES — calidad de cada frase', () => {

  it('todas las frases tienen texto no vacío', () => {
    for (const [event, phrases] of Object.entries(PHRASES)) {
      for (const [i, phrase] of phrases.entries()) {
        expect(
          phrase.text.trim(),
          `Evento "${event}" frase #${i} tiene texto vacío`
        ).not.toBe('');
      }
    }
  });

  it('todas las frases tienen un mood válido', () => {
    for (const [event, phrases] of Object.entries(PHRASES)) {
      for (const [i, phrase] of phrases.entries()) {
        expect(
          VALID_MOODS,
          `Evento "${event}" frase #${i} tiene mood inválido: "${phrase.mood}"`
        ).toContain(phrase.mood);
      }
    }
  });

  it('ninguna frase supera 100 caracteres (para el status bar)', () => {
    for (const [event, phrases] of Object.entries(PHRASES)) {
      for (const [i, phrase] of phrases.entries()) {
        expect(
          phrase.text.length,
          `Evento "${event}" frase #${i} es muy larga (${phrase.text.length} chars): "${phrase.text}"`
        ).toBeLessThanOrEqual(100);
      }
    }
  });

  it('ninguna frase está duplicada dentro del mismo evento', () => {
    for (const [event, phrases] of Object.entries(PHRASES)) {
      const textos = phrases.map(p => p.text);
      const unicos = new Set(textos);
      expect(
        unicos.size,
        `Evento "${event}" tiene frases duplicadas`
      ).toBe(textos.length);
    }
  });

  it('las frases de errores graves usan mood mad, tired o sassy (no happy)', () => {
    const eventosGraves: XolitoEvent[] = [
      'build_fail', 'test_fail', 'git_force_push', 'deleted_tests',
    ];
    const moodsBuenos: XolitoMood[] = ['happy', 'proud', 'hyped'];

    for (const event of eventosGraves) {
      for (const phrase of PHRASES[event]) {
        expect(
          moodsBuenos,
          `Evento grave "${event}" tiene mood "${phrase.mood}" — no manches, ¿feliz por un error?`
        ).not.toContain(phrase.mood);
      }
    }
  });

  it('las frases de éxito usan mood positivo (no mad ni tired)', () => {
    const eventosExito: XolitoEvent[] = ['build_success', 'test_pass', 'first_commit_today'];
    const moodsNegativos: XolitoMood[] = ['mad', 'tired'];

    for (const event of eventosExito) {
      for (const phrase of PHRASES[event]) {
        expect(
          moodsNegativos,
          `Evento de éxito "${event}" usa mood "${phrase.mood}" — Xolito regañando en el éxito es demasiado`
        ).not.toContain(phrase.mood);
      }
    }
  });

});

// ── getPhrase() ───────────────────────────────────────────────

describe('getPhrase() — función de selección', () => {

  it('regresa una frase válida para cada evento', () => {
    for (const event of ALL_EVENTS) {
      const phrase = getPhrase(event);
      expect(phrase).toBeDefined();
      expect(phrase.text).toBeTruthy();
      expect(VALID_MOODS).toContain(phrase.mood);
    }
  });

  it('tiene aleatoriedad — no siempre regresa la misma frase', () => {
    const textos = new Set<string>();
    for (let i = 0; i < 30; i++) {
      textos.add(getPhrase('build_fail').text);
    }
    expect(
      textos.size,
      'getPhrase() siempre regresa la misma frase — más variedad, mijo'
    ).toBeGreaterThan(1);
  });

  it('no regresa undefined para ningún evento conocido', () => {
    for (const event of ALL_EVENTS) {
      const result = getPhrase(event);
      expect(result).not.toBeUndefined();
      expect(result.text).not.toBeUndefined();
      expect(result.mood).not.toBeUndefined();
    }
  });

  it('regresa frase de fallback para evento desconocido', () => {
    // @ts-expect-error — probando evento inválido a propósito
    const phrase = getPhrase('evento_inventado_que_no_existe');
    expect(phrase).toBeDefined();
    expect(phrase.text).toBeTruthy();
    expect(phrase.mood).toBe('judging');
  });

  it('selecciona frases de todo el arreglo con distribución razonable', () => {
    const textos = new Set<string>();
    for (let i = 0; i < 100; i++) {
      textos.add(getPhrase('build_fail').text);
    }
    expect(textos.size).toBeGreaterThanOrEqual(
      PHRASES.build_fail.length - 1
    );
  });

});

// ── Cobertura de moods ────────────────────────────────────────

describe('PHRASES — cobertura de moods', () => {

  it('el banco usa al menos 7 de los 10 moods posibles', () => {
    const moodsUsados = new Set<XolitoMood>();
    for (const phrases of Object.values(PHRASES)) {
      for (const phrase of phrases) {
        moodsUsados.add(phrase.mood);
      }
    }
    expect(
      moodsUsados.size,
      `Solo se usan ${moodsUsados.size} moods disponibles`
    ).toBeGreaterThanOrEqual(7);
  });

  it('el mood sassy es el más usado (Xolito es bien sarcástico)', () => {
    const conteo: Record<string, number> = {};
    for (const phrases of Object.values(PHRASES)) {
      for (const phrase of phrases) {
        conteo[phrase.mood] = (conteo[phrase.mood] ?? 0) + 1;
      }
    }
    const maxMood = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0][0];
    expect(['sassy', 'mad']).toContain(maxMood);
  });

});
