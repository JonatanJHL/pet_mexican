// xolito/packages/core/src/index.ts
export { Xolito } from './xolito.js';
export { getPhrase, PHRASES } from './phrases.js';
export { renderWithBubble, SPRITES } from './sprites.js';
export { generateSpriteSVG, getAllSprites, MOOD_COLORS, MOOD_EXPR } from './sprites/generator.js';
export type { XolitoConfig, XolitoEvent, XolitoMood, XolitoPhrase } from './types.js';
export type { XolitoSpriteColors } from './sprites/generator.js';
export { calculateCorruption, CORRUPTION_PHRASES, glitchText } from './corruption.js';
export type { CorruptionState, CorruptionFactors, CorruptionTier } from './corruption.js';
