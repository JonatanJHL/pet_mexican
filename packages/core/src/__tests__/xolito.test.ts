// ============================================================
//  xolito.test.ts
//  Tests para la clase principal — el cerebro del ajolote
//  "Xolito debe comportarse bien aunque tú no lo hagas."
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Xolito } from '../xolito.js';
import type { XolitoEvent } from '../types.js';

// ── Constructor y config ──────────────────────────────────────

describe('Xolito — constructor', () => {

  it('se instancia sin config (valores por defecto)', () => {
    expect(() => new Xolito()).not.toThrow();
  });

  it('usa "Xolito" como nombre por defecto', () => {
    const x = new Xolito();
    expect(x.getName()).toBe('Xolito');
  });

  it('usa el nombre personalizado si se pasa', () => {
    const x = new Xolito({ name: 'Ajolín' });
    expect(x.getName()).toBe('Ajolín');
  });

  it('empieza con mood idle', () => {
    const x = new Xolito();
    expect(x.getMood()).toBe('idle');
  });

  it('empieza con 0 errores consecutivos', () => {
    const x = new Xolito();
    expect(x.getErrorCount()).toBe(0);
  });

});

// ── react() — manejo de eventos ──────────────────────────────

describe('Xolito.react() — respuesta a eventos', () => {

  let xolito: Xolito;
  beforeEach(() => { xolito = new Xolito(); });

  it('regresa una frase con texto y mood para cada evento', () => {
    const eventos: XolitoEvent[] = [
      'build_success', 'build_fail', 'test_pass', 'greeted',
      'push_to_main', 'git_force_push', 'late_night_coding',
    ];
    for (const event of eventos) {
      const phrase = xolito.react(event);
      expect(phrase.text, `react("${event}") no regresó texto`).toBeTruthy();
      expect(phrase.mood, `react("${event}") no regresó mood`).toBeTruthy();
    }
  });

  it('actualiza el mood después de reaccionar', () => {
    xolito.react('build_success');
    expect(xolito.getMood()).not.toBe('idle'); // debe cambiar del idle inicial
  });

  it('incrementa errorCount en errores consecutivos', () => {
    xolito.react('build_fail');
    expect(xolito.getErrorCount()).toBe(1);
    xolito.react('syntax_error');
    expect(xolito.getErrorCount()).toBe(2);
    xolito.react('test_fail');
    expect(xolito.getErrorCount()).toBe(3);
  });

  it('resetea errorCount al tener un éxito', () => {
    xolito.react('build_fail');
    xolito.react('build_fail');
    xolito.react('build_fail');
    expect(xolito.getErrorCount()).toBe(3);

    xolito.react('build_success');
    expect(xolito.getErrorCount()).toBe(0);
  });

  it('también resetea errorCount con test_pass', () => {
    xolito.react('test_fail');
    xolito.react('test_fail');
    xolito.react('test_pass');
    expect(xolito.getErrorCount()).toBe(0);
  });

  it('sustituye ${count} en la frase por el número real de errores', () => {
    // Forzamos 4 errores para llegar a la frase con ${count}
    xolito.react('build_fail');
    xolito.react('build_fail');
    xolito.react('build_fail');
    const phrase = xolito.react('build_fail');
    // La frase no debe tener el literal "${count}" — debe estar reemplazado
    expect(phrase.text).not.toContain('${count}');
  });

});

// ── render() ─────────────────────────────────────────────────

describe('Xolito.render() — renderizado ASCII', () => {

  it('regresa un string con saltos de línea (es multi-línea)', () => {
    const x = new Xolito();
    const output = x.render('Hola');
    expect(output).toContain('\n');
  });

  it('usa el nombre si no se pasa mensaje', () => {
    const x = new Xolito({ name: 'Axolín' });
    const output = x.render();
    expect(output).toContain('Axolín');
  });

  it('incluye el mensaje cuando se pasa', () => {
    const x = new Xolito();
    const output = x.render('Este es mi mensaje');
    expect(output).toContain('Este es mi mensaje');
  });

  it('no truena tras múltiples reacciones', () => {
    const x = new Xolito();
    x.react('build_fail');
    x.react('push_to_main');
    x.react('git_force_push');
    expect(() => x.render('¿Cómo quedamos?')).not.toThrow();
  });

});

// ── checkIdle() ───────────────────────────────────────────────

describe('Xolito.checkIdle() — detector de inactividad', () => {

  it('regresa null cuando hay actividad reciente', () => {
    const x = new Xolito();
    x.react('build_success'); // actualiza lastEventTime
    expect(x.checkIdle()).toBeNull();
  });

  it('regresa idle_10min después de 10 minutos sin actividad', () => {
    const x = new Xolito();

    // Mockeamos Date.now para simular que pasaron 11 minutos
    const tiempoOriginal = Date.now;
    const ahora = Date.now();
    Date.now = vi.fn(() => ahora + 11 * 60 * 1000);

    expect(x.checkIdle()).toBe('idle_10min');
    Date.now = tiempoOriginal;
  });

  it('regresa idle_30min después de 30 minutos sin actividad', () => {
    const x = new Xolito();

    const tiempoOriginal = Date.now;
    const ahora = Date.now();
    Date.now = vi.fn(() => ahora + 31 * 60 * 1000);

    expect(x.checkIdle()).toBe('idle_30min');
    Date.now = tiempoOriginal;
  });

  it('idle_30min tiene prioridad sobre idle_10min', () => {
    const x = new Xolito();

    const tiempoOriginal = Date.now;
    const ahora = Date.now();
    // 35 minutos — debe regresar 30min, no 10min
    Date.now = vi.fn(() => ahora + 35 * 60 * 1000);

    expect(x.checkIdle()).toBe('idle_30min');
    Date.now = tiempoOriginal;
  });

});

// ── Integración: flujo completo de un día de trabajo ─────────

describe('Xolito — flujo de trabajo completo', () => {

  it('sobrevive un día típico de bugs y éxitos', () => {
    const x = new Xolito({ name: 'Xolito', spiciness: 3 });

    const flujo: XolitoEvent[] = [
      'greeted',
      'first_commit_today',
      'build_fail',
      'syntax_error',
      'build_fail',
      'build_success',
      'test_pass',
      'console_log_left',
      'push_to_main',
      'idle_10min',
      'late_night_coding',
    ];

    for (const event of flujo) {
      expect(() => {
        const phrase = x.react(event);
        const render = x.render(phrase.text);
        expect(phrase.text).toBeTruthy();
        expect(render).toBeTruthy();
      }, `Tronó en el evento "${event}"`).not.toThrow();
    }

    // Al final del día con build_success, los errores deben estar en 0
    expect(x.getErrorCount()).toBe(0);
  });

  it('múltiples instancias son independientes', () => {
    const x1 = new Xolito({ name: 'Xolito' });
    const x2 = new Xolito({ name: 'Otro' });

    x1.react('build_fail');
    x1.react('build_fail');
    x1.react('build_fail');

    // x2 no debe verse afectado por los errores de x1
    expect(x2.getErrorCount()).toBe(0);
    expect(x2.getMood()).toBe('idle');
    expect(x1.getErrorCount()).toBe(3);
  });

});
