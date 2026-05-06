// ============================================================
//  xolito/packages/core/src/sprites.ts
//  Arte ASCII de Xolito — cada mood tiene su expresión
// ============================================================

import type { XolitoMood } from './types.js';

// Ancho fijo: 12 chars, alto: 5 líneas
// Los ajolotes reales tienen branquias en la cabeza — las simulamos con ~

export const SPRITES: Record<XolitoMood, string[]> = {

  idle: [
    "  ~(^•^)~  ",
    "  /|   |\\  ",
    "   |   |   ",
    "  /|   |\\  ",
    " ~ajolote~ ",
  ],

  happy: [
    "  ~(^‿^)~  ",
    "  /|   |\\  ",
    "   | ♥ |   ",
    "  /|   |\\  ",
    " ~feliz~~~ ",
  ],

  mad: [
    "  ~(>_<)~  ",
    "  /|   |\\  ",
    "   | ! |   ",
    "  /|   |\\  ",
    " ~enojado~ ",
  ],

  sleepy: [
    "  ~(-_-)~  ",
    "  /|   |\\  ",
    "   | z |   ",
    "  /|   |\\  ",
    " ~zzzzz~~~ ",
  ],

  sassy: [
    "  ~(¬‿¬)~  ",
    "  /|   |\\  ",
    "   | ~ |   ",
    "  /|   |\\  ",
    " ~sarcasm~ ",
  ],

  proud: [
    "  ~(★‿★)~  ",
    "  /|   |\\  ",
    "   | ✓ |   ",
    "  /|   |\\  ",
    " ~chido~~~ ",
  ],

  worried: [
    "  ~(o_O)~  ",
    "  /|   |\\  ",
    "   | ? |   ",
    "  /|   |\\  ",
    " ~ay,no~~~ ",
  ],

  hyped: [
    "  ~(^O^)~  ",
    "  /|   |\\  ",
    "   | ! |   ",
    "  /|   |\\  ",
    " ~ORALE!~~ ",
  ],

  tired: [
    "  ~(=_=)~  ",
    "  /|   |\\  ",
    "   | … |   ",
    "  /|   |\\  ",
    " ~cansan~~ ",
  ],

  judging: [
    "  ~(¬_¬)~  ",
    "  /|   |\\  ",
    "   | . |   ",
    "  /|   |\\  ",
    " ~te_veo~~ ",
  ],
};

/** Renderiza el sprite con una burbuja de diálogo encima */
export function renderWithBubble(mood: XolitoMood, message: string): string {
  const sprite = SPRITES[mood];
  const safeMessage = message.trim() || '...';
  const maxW = 38;
  const words = safeMessage.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxW) {
      lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());

  const width = Math.max(...lines.map(l => l.length)) + 4;
  const top    = '╭' + '─'.repeat(width - 2) + '╮';
  const bottom = '╰' + '─'.repeat(width - 2) + '╯';
  const bubble = [
    top,
    ...lines.map(l => '│ ' + l.padEnd(width - 4) + ' │'),
    bottom,
    '  ╲',
  ];

  return [...bubble, ...sprite].join('\n');
}
