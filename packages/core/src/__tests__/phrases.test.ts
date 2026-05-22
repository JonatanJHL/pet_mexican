// ============================================================
//  phrases.test.ts — actualizado con nuevos eventos y moods
// ============================================================

import { describe, it, expect } from 'vitest';
import { PHRASES, getPhrase } from '../phrases.js';
import type { XolitoEvent, XolitoMood } from '../types.js';

const ALL_EVENTS: XolitoEvent[] = [
  'build_success', 'build_fail', 'test_pass', 'test_fail',
  'save_no_comments', 'push_to_main', 'long_function',
  'no_commits_1h', 'no_commits_3h', 'first_commit_today',
  'npm_install', 'heavy_node_modules', 'syntax_error',
  'console_log_left', 'todo_comment', 'merge_conflict',
  'late_night_coding', 'weekend_coding', 'git_force_push',
  'deleted_tests', 'idle_10min', 'idle_30min', 'greeted',
  'boss_alert',
  'corruption_warning', 'corruption_critical', 'corruption_cleaned',
  'deploy_friday',
];

const VALID_MOODS: XolitoMood[] = [
  'idle', 'happy', 'mad', 'sleepy', 'sassy',
  'proud', 'worried', 'hyped', 'tired', 'judging',
  'panic', 'corrupt', 'deploy_friday',
];


describe('PHRASES — estructura del banco', () => {

  it('tiene frases para todos los eventos definidos', () => {
    for (const event of ALL_EVENTS) {
      expect(PHRASES[event], `Evento "${event}" no tiene frases`).toBeDefined();
    }
  });

  it('cada evento tiene al menos 3 frases', () => {
    for (const event of ALL_EVENTS) {
      expect(
        PHRASES[event].length,
        `Evento "${event}" tiene muy pocas frases (${PHRASES[event]?.length ?? 0}), mínimo 3`
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('no hay eventos extra que no estén tipados', () => {
    for (const key of Object.keys(PHRASES) as XolitoEvent[]) {
      expect(ALL_EVENTS, `Evento "${key}" está en PHRASES pero no en el tipo XolitoEvent`).toContain(key);
    }
  });
});

describe('PHRASES — calidad de cada frase', () => {

  it('todas las frases tienen texto no vacío', () => {
    for (const [event, phrases] of Object.entries(PHRASES)) {
      for (const [i, phrase] of phrases.entries()) {
        expect(phrase.text.trim(), `Evento "${event}" frase #${i} tiene texto vacío`).not.toBe('');
      }
    }
  });

  it('todas las frases tienen un mood válido', () => {
    for (const [event, phrases] of Object.entries(PHRASES)) {
      for (const [i, phrase] of phrases.entries()) {
        expect(VALID_MOODS, `Evento "${event}" frase #${i} tiene mood inválido: "${phrase.mood}"`).toContain(phrase.mood);
      }
    }
  });

  it('ninguna frase supera 100 caracteres', () => {
    for (const [event, phrases] of Object.entries(PHRASES)) {
      for (const [i, phrase] of phrases.entries()) {
        expect(
          phrase.text.length,
          `Evento "${event}" frase #${i} es muy larga (${phrase.text.length} chars)`
        ).toBeLessThanOrEqual(100);
      }
    }
  });

  it('ninguna frase está duplicada dentro del mismo evento', () => {
    for (const [event, phrases] of Object.entries(PHRASES)) {
      const textos = phrases.map(p => p.text);
      expect(new Set(textos).size, `Evento "${event}" tiene frases duplicadas`).toBe(textos.length);
    }
  });

  it('las frases de errores graves no usan mood happy/proud/hyped', () => {
    const graves: XolitoEvent[] = ['build_fail', 'test_fail', 'git_force_push', 'deleted_tests'];
    const positivos: XolitoMood[] = ['happy', 'proud', 'hyped'];
    for (const event of graves) {
      for (const phrase of PHRASES[event]) {
        expect(positivos, `Evento grave "${event}" tiene mood "${phrase.mood}"`).not.toContain(phrase.mood);
      }
    }
  });

  it('las frases de éxito no usan mood mad/tired', () => {
    const exito: XolitoEvent[] = ['build_success', 'test_pass', 'first_commit_today'];
    const negativos: XolitoMood[] = ['mad', 'tired'];
    for (const event of exito) {
      for (const phrase of PHRASES[event]) {
        expect(negativos, `Evento de éxito "${event}" usa mood "${phrase.mood}"`).not.toContain(phrase.mood);
      }
    }
  });
});

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
    for (let i = 0; i < 30; i++) textos.add(getPhrase('build_fail').text);
    expect(textos.size, 'getPhrase() siempre regresa la misma frase').toBeGreaterThan(1);
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
    // @ts-expect-error
    const phrase = getPhrase('evento_inventado');
    expect(phrase).toBeDefined();
    expect(phrase.text).toBeTruthy();
    expect(phrase.mood).toBe('judging');
  });

  it('distribuye frases de todo el arreglo', () => {
    const textos = new Set<string>();
    for (let i = 0; i < 100; i++) textos.add(getPhrase('build_fail').text);
    expect(textos.size).toBeGreaterThanOrEqual(PHRASES.build_fail.length - 1);
  });
});

describe('PHRASES — cobertura de moods', () => {

  it('el banco usa al menos 7 moods', () => {
    const usados = new Set<XolitoMood>();
    for (const phrases of Object.values(PHRASES)) {
      for (const p of phrases) usados.add(p.mood);
    }
    expect(usados.size).toBeGreaterThanOrEqual(7);
  });

  it('el mood más usado es sassy o mad', () => {
    const conteo: Record<string, number> = {};
    for (const phrases of Object.values(PHRASES)) {
      for (const p of phrases) conteo[p.mood] = (conteo[p.mood] ?? 0) + 1;
    }
    const maxMood = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0][0];
    expect(['sassy', 'mad']).toContain(maxMood);
  });
});
