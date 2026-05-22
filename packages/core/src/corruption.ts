// ============================================================
//  xolito/packages/core/src/corruption.ts
//  Sistema de Corrupción del Repo
// ============================================================

export interface CorruptionFactors {
  todoCount:          number;
  errorCount:         number;
  deadFileCount:      number;
  consecutiveFails:   number;
  hoursWithoutCommit: number;
}

export interface CorruptionState {
  level:       number;
  tier:        CorruptionTier;
  glitchText:  boolean;
  redEyes:     boolean;
  screenShake: boolean;
}

export type CorruptionTier =
  | 'clean'
  | 'warning'
  | 'critical'
  | 'possessed';

const WEIGHTS = {
  todoCount:          2,
  errorCount:         5,
  deadFileCount:      3,
  consecutiveFails:   8,
  hoursWithoutCommit: 1.5,
};

const CAPS = {
  todoCount:          20,
  errorCount:         10,
  deadFileCount:      15,
  consecutiveFails:   5,
  hoursWithoutCommit: 12,
};

export function calculateCorruption(f: CorruptionFactors): CorruptionState {
  const score =
    Math.min(f.todoCount,          CAPS.todoCount)          * WEIGHTS.todoCount +
    Math.min(f.errorCount,         CAPS.errorCount)         * WEIGHTS.errorCount +
    Math.min(f.deadFileCount,      CAPS.deadFileCount)      * WEIGHTS.deadFileCount +
    Math.min(f.consecutiveFails,   CAPS.consecutiveFails)   * WEIGHTS.consecutiveFails +
    Math.min(f.hoursWithoutCommit, CAPS.hoursWithoutCommit) * WEIGHTS.hoursWithoutCommit;

  const level = Math.min(100, Math.round(score));
  const tier: CorruptionTier =
    level >= 80 ? 'possessed' :
    level >= 50 ? 'critical'  :
    level >= 20 ? 'warning'   : 'clean';

  return {
    level,
    tier,
    glitchText:  level >= 50,
    redEyes:     level >= 80,
    screenShake: level >= 80,
  };
}

export const CORRUPTION_PHRASES: Record<CorruptionTier, string[]> = {
  clean: [
    'Repo limpio. Así se hace.',
    '0 corrupción. ¿Quién eres?',
    'Clean. Xolito respira tranquilo.',
  ],
  warning: [
    'Algo huele raro en este repo...',
    'Los TODOs se están acumulando, mijo.',
    'El repo empieza a crujir. Limpia eso.',
    'Xolito siente perturbaciones en el código.',
  ],
  critical: [
    'EL REPO ESTÁ EN PELIGRO.',
    'Demasiados errores. La corrupción avanza.',
    'Xolito está preocupado. Muy preocupado.',
    'El linter ya no puede salvarte.',
  ],
  possessed: [
    'ALIMENTASTE DEMASIADOS BUGS.',
    'EL LINTER YA NO PUEDE SALVARTE.',
    'Ese undefined ya tiene conciencia.',
    'ERROR: XOLITO.EXE HA DEJADO DE RESPONDER.',
    'Demasiada corrupción. Demasiada.',
  ],
};

const GLITCH_CHARS = ['̷','̸','̴','̵','̶'];

export function glitchText(text: string, intensity: number): string {
  if (intensity < 50) return text;
  const factor = (intensity - 50) / 50;
  return text.split('').map(char => {
    if (Math.random() < factor * 0.35) {
      return char + GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }
    return char;
  }).join('');
}
