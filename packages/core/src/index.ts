// xolito/packages/core/src/index.ts
export { Xolito } from './xolito.js';
export { getPhrase, PHRASES } from './phrases.js';
export { renderWithBubble, SPRITES } from './sprites.js';
export { generateSpriteSVG, getAllSprites, MOOD_COLORS, MOOD_EXPR } from './sprites/generator.js';
export type { XolitoConfig, XolitoEvent, XolitoMood, XolitoPhrase } from './types.js';
export type { XolitoSpriteColors } from './sprites/generator.js';
export { calculateCorruption, glitchText } from './corruption.js';
export type { CorruptionState, CorruptionFactors, CorruptionTier } from './corruption.js';
export { evaluateCodeOffline, evaluateCodeWithGemini } from './xolito-code.js';
export type { CodeEvaluationResult } from './xolito-code.js';
