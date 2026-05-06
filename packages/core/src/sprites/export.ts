#!/usr/bin/env node
// ============================================================
//  xolito/packages/core/src/sprites/export.ts
//  Exporta los 10 sprites SVG a disco
//  Uso: npx tsx packages/core/src/sprites/export.ts
// ============================================================

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateSpriteSVG } from './generator.js';
import type { XolitoMood } from '../types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = join(__dirname, '../../../../assets/sprites');

const MOODS: XolitoMood[] = [
  'idle', 'happy', 'mad', 'sleepy', 'sassy',
  'proud', 'worried', 'hyped', 'tired', 'judging',
];

const SIZES = [32, 64, 120, 256];

mkdirSync(OUT_DIR, { recursive: true });

let total = 0;
for (const mood of MOODS) {
  for (const size of SIZES) {
    const svg      = generateSpriteSVG(mood, size);
    const filename = `xolito-${mood}-${size}.svg`;
    const filepath = join(OUT_DIR, filename);
    writeFileSync(filepath, svg, 'utf-8');
    console.log(`✓ ${filename}`);
    total++;
  }
}

console.log(`\n🦎 ${total} sprites exportados a assets/sprites/`);
console.log(`   Usa los SVGs en el webview de VS Code o en la landing page.`);
