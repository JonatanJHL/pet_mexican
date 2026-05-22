// ============================================================
//  xolito/packages/core/src/sprites/generator.ts
//  Genera el SVG de Xolito cholo para cada mood
//  Basado en la referencia visual: paliacate, tatuajes, khakis, Vans
// ============================================================

import type { XolitoMood } from '../types.js';

export interface XolitoSpriteColors {
  body:   string;
  belly:  string;
  gill:   string;
  tattoo: string;
}

export const MOOD_COLORS: Record<XolitoMood, XolitoSpriteColors> = {
  idle:    { body:'#F4A8C0', belly:'#FDDDE6', gill:'#E8729A', tattoo:'#1a1a1a' },
  happy:   { body:'#F4A8C0', belly:'#FDDDE6', gill:'#E8729A', tattoo:'#1a1a1a' },
  mad:     { body:'#D96070', belly:'#F0A0A8', gill:'#C04060', tattoo:'#0a0a0a' },
  sleepy:  { body:'#BBA8D0', belly:'#DDD0EE', gill:'#9A80C0', tattoo:'#1a1a1a' },
  sassy:   { body:'#F4A8C0', belly:'#FDDDE6', gill:'#E8729A', tattoo:'#1a1a1a' },
  proud:   { body:'#A8C8F4', belly:'#D0E8FF', gill:'#6AAEE0', tattoo:'#0a0a2a' },
  worried: { body:'#F4D4A8', belly:'#FFF0D0', gill:'#E0A060', tattoo:'#1a1a1a' },
  hyped:   { body:'#A8F4C0', belly:'#D0FFE0', gill:'#60E080', tattoo:'#0a2a0a' },
  tired:   { body:'#C8B8B8', belly:'#E8D8D8', gill:'#A89090', tattoo:'#1a1a1a' },
  judging: { body:'#F4A8C0', belly:'#FDDDE6', gill:'#E8729A', tattoo:'#1a1a1a' },
  // corrupt: rojo oscuro — repo poseído
  corrupt:        { body:'#C87878', belly:'#F0A0A0', gill:'#A04040', tattoo:'#0a0a0a' },
  // deploy_friday: naranja alarma — viernes de caos
  deploy_friday:  { body:'#F4C06A', belly:'#FFDFA0', gill:'#E09030', tattoo:'#1a0a0a' },
  // panic: verde consola apagado — modo godín activado
  panic:   { body:'#B8C8A8', belly:'#D8E8C8', gill:'#88A868', tattoo:'#0a1a0a' },
};

type MouthExpr = 'smile' | 'bigsmile' | 'frown' | 'smirk' | 'sleepy' | 'worried' | 'tired' | 'judging';

export const MOOD_EXPR: Record<XolitoMood, MouthExpr> = {
  idle:    'smile',
  happy:   'bigsmile',
  mad:     'frown',
  sleepy:  'sleepy',
  sassy:   'smirk',
  proud:   'bigsmile',
  worried: 'worried',
  hyped:   'bigsmile',
  tired:   'tired',
  judging: 'judging',
  corrupt:        'frown',
  deploy_friday:  'worried',
  panic:   'worried',
};

// ── Helpers de color ─────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function darkenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const d = (v: number) => Math.max(0, v - amount * 2);
  return `rgb(${d(r)},${d(g)},${d(b)})`;
}

// ── Generador principal ───────────────────────────────────────

export function generateSpriteSVG(mood: XolitoMood, size = 120): string {
  const c       = MOOD_COLORS[mood];
  const expr    = MOOD_EXPR[mood];
  const isMad   = mood === 'mad' || mood === 'panic';
  const isSleep = mood === 'sleepy' || mood === 'tired';
  const isProud = mood === 'proud'  || mood === 'hyped';
  const isPanic = mood === 'panic';

  const cx     = size / 2;
  const headY  = size * 0.28;
  const hRx    = size * 0.22;
  const hRy    = size * 0.20;
  const bodyY  = size * 0.55;
  const bRx    = size * 0.17;
  const bRy    = size * 0.14;

  const black  = '#1a1a1a';
  const white  = '#f5f5f5';
  const khaki  = isPanic ? '#2a3a2a' : '#C8B48A';
  const khakiD = isPanic ? '#1a2a1a' : '#A8946A';
  const chainC = '#C0C0C0';
  const skin   = darkenHex(c.body, 12);

  const mouths: Record<MouthExpr, string> = {
    smile:    `<path d="M${cx-10},${headY+10} Q${cx},${headY+17} ${cx+10},${headY+10}" fill="none" stroke="${skin}" stroke-width="2" stroke-linecap="round"/>`,
    bigsmile: `<path d="M${cx-12},${headY+8} Q${cx},${headY+19} ${cx+12},${headY+8}" fill="none" stroke="${skin}" stroke-width="2.5" stroke-linecap="round"/>`,
    frown:    `<path d="M${cx-10},${headY+14} Q${cx},${headY+7} ${cx+10},${headY+14}" fill="none" stroke="${skin}" stroke-width="2" stroke-linecap="round"/>`,
    smirk:    `<path d="M${cx-7},${headY+12} Q${cx+2},${headY+16} ${cx+11},${headY+8}" fill="none" stroke="${skin}" stroke-width="2" stroke-linecap="round"/>`,
    sleepy:   `<path d="M${cx-8},${headY+12} Q${cx},${headY+16} ${cx+8},${headY+12}" fill="none" stroke="${skin}" stroke-width="1.5" stroke-linecap="round"/>`,
    worried:  `<path d="M${cx-9},${headY+14} Q${cx-2},${headY+8} ${cx+9},${headY+14}" fill="none" stroke="${skin}" stroke-width="2" stroke-linecap="round"/>`,
    tired:    `<line x1="${cx-7}" y1="${headY+12}" x2="${cx+7}" y2="${headY+12}" stroke="${skin}" stroke-width="1.8" stroke-linecap="round"/>`,
    judging:  `<line x1="${cx-8}" y1="${headY+12}" x2="${cx+8}" y2="${headY+12}" stroke="${skin}" stroke-width="1.5" stroke-linecap="round"/>
               <circle cx="${cx+11}" cy="${headY+7}" r="1.5" fill="${skin}"/>`,
  };

  function eyeNormal(ex: number): string {
    return `<ellipse cx="${ex}" cy="${headY-3}" rx="4" ry="4" fill="${black}"/>
            <circle  cx="${ex+1.5}" cy="${headY-4.5}" r="1.5" fill="white" opacity="0.9"/>`;
  }
  function eyeHalf(ex: number): string {
    return `<path d="M${ex-4},${headY-3} Q${ex},${headY-7} ${ex+4},${headY-3}" fill="${darkenHex(c.body, 18)}"/>
            <line x1="${ex-4}" y1="${headY-3}" x2="${ex+4}" y2="${headY-3}" stroke="${black}" stroke-width="1.5"/>`;
  }
  function eyeAngry(ex: number, side: 'L' | 'R'): string {
    const bx1 = side === 'L' ? ex - 5 : ex + 5;
    const bx2 = side === 'L' ? ex + 2 : ex - 2;
    return `<ellipse cx="${ex}" cy="${headY-2}" rx="4" ry="4" fill="${black}"/>
            <circle  cx="${ex+1.5}" cy="${headY-3.5}" r="1.5" fill="white" opacity="0.8"/>
            <line x1="${bx1}" y1="${headY-8}" x2="${bx2}" y2="${headY-4}" stroke="${black}" stroke-width="2" stroke-linecap="round"/>`;
  }

  const exL = cx - 13, exR = cx + 13;
  const eyeLeft  = isMad ? eyeAngry(exL,'L') : isSleep ? eyeHalf(exL) : eyeNormal(exL);
  const eyeRight = isMad ? eyeAngry(exR,'R') : isSleep ? eyeHalf(exR) : eyeNormal(exR);

  const cheeks = (!isMad && !isSleep)
    ? `<ellipse cx="${cx-17}" cy="${headY+5}" rx="6" ry="3.5" fill="${c.gill}" opacity="0.3"/>
       <ellipse cx="${cx+17}" cy="${headY+5}" rx="6" ry="3.5" fill="${c.gill}" opacity="0.3"/>`
    : '';

  const stars = isProud
    ? `<text font-size="11" x="${cx+30}" y="${headY-22}" fill="${c.gill}">✦</text>
       <text font-size="8"  x="${cx+38}" y="${headY-12}" fill="${c.gill}">✦</text>`
    : '';

  // Corbata para modo pánico
  const tie = isPanic
    ? `<path d="M${cx-5},${headY+hRy+2} L${cx},${headY+hRy+8} L${cx+5},${headY+hRy+2} L${cx+3},${headY+hRy-2} L${cx-3},${headY+hRy-2}Z" fill="#1a1a1a" stroke="#333" stroke-width="0.5"/>
       <line x1="${cx}" y1="${headY+hRy+8}" x2="${cx}" y2="${bodyY-bRy}" stroke="#1a1a1a" stroke-width="4"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 24}"
         viewBox="0 0 ${size} ${size + 24}">
  <title>Xolito — mood: ${mood}</title>

  ${stars}

  <!-- Cola -->
  <ellipse cx="${cx + bRx + 20}" cy="${bodyY + 9}" rx="22" ry="10" fill="${c.body}" opacity="0.9"/>
  <ellipse cx="${cx + bRx + 33}" cy="${bodyY + 9}" rx="13" ry="7"  fill="${c.gill}" opacity="0.7"/>

  <!-- Pantalón -->
  <rect x="${cx - bRx + 2}" y="${bodyY + 4}" width="${(bRx - 1) * 2}" height="${size * 0.30}" rx="4" fill="${khaki}"/>
  <rect x="${cx - bRx + 2}" y="${bodyY + 4}" width="${(bRx - 1) * 2}" height="4" fill="${khakiD}"/>
  <rect x="${cx - bRx + 2}" y="${bodyY + 3}" width="${(bRx - 1) * 2}" height="5" rx="1" fill="${black}"/>
  <rect x="${cx - 3}"        y="${bodyY + 2}" width="6"               height="7" rx="1" fill="#888888" stroke="#cccccc" stroke-width="0.5"/>
  <rect x="${cx - bRx + 2}" y="${bodyY + size * 0.20}" width="${bRx - 3}" height="${size * 0.18}" rx="4" fill="${khaki}"/>
  <rect x="${cx + 3}"        y="${bodyY + size * 0.20}" width="${bRx - 3}" height="${size * 0.18}" rx="4" fill="${khaki}"/>
  <rect x="${cx - bRx + 1}" y="${bodyY + size * 0.335}" width="${bRx - 2}" height="${size * 0.07}" rx="3" fill="${black}"/>
  <rect x="${cx - bRx + 1}" y="${bodyY + size * 0.335}" width="${bRx - 2}" height="${size * 0.028}" rx="2" fill="${white}" opacity="0.8"/>
  <rect x="${cx + 4}"        y="${bodyY + size * 0.335}" width="${bRx - 2}" height="${size * 0.07}" rx="3" fill="${black}"/>
  <rect x="${cx + 4}"        y="${bodyY + size * 0.335}" width="${bRx - 2}" height="${size * 0.028}" rx="2" fill="${white}" opacity="0.8"/>

  <path d="M${cx - bRx + 8},${bodyY + size * 0.10} Q${cx - bRx - 2},${bodyY + size * 0.22} ${cx - bRx + 4},${bodyY + size * 0.30}"
        fill="none" stroke="${chainC}" stroke-width="1.2" stroke-dasharray="3,2"/>

  <!-- Cuerpo -->
  <ellipse cx="${cx}"     cy="${bodyY}"     rx="${bRx}"         ry="${bRy}"         fill="${c.body}"/>
  <ellipse cx="${cx + 2}" cy="${bodyY + 3}" rx="${bRx * 0.6}"   ry="${bRy * 0.65}"  fill="${c.belly}" opacity="0.7"/>

  <text font-size="5.5" font-weight="700" font-family="monospace" fill="${c.tattoo}"
        transform="rotate(-15,${cx - bRx - 2},${bodyY - 8})">
    <tspan x="${cx - bRx - 2}" y="${bodyY - 13}">HECHO EN</tspan>
    <tspan x="${cx - bRx - 4}" y="${bodyY - 5}">MÉXICO</tspan>
  </text>

  <!-- Brazos -->
  <ellipse cx="${cx - bRx - 5}" cy="${bodyY - 6}" rx="7" ry="12" fill="${c.body}" transform="rotate(-15,${cx - bRx - 5},${bodyY - 6})"/>
  <ellipse cx="${cx + bRx + 5}" cy="${bodyY - 6}" rx="7" ry="12" fill="${c.body}" transform="rotate(15,${cx + bRx + 5},${bodyY - 6})"/>

  <!-- Paliacate -->
  <path d="M${cx - 14},${headY + hRy - 2}
           Q${cx},${headY + hRy + 18} ${cx + 14},${headY + hRy - 2}
           Q${cx + 6},${headY + hRy + 10} ${cx},${headY + hRy + 22}
           Q${cx - 6},${headY + hRy + 10} ${cx - 14},${headY + hRy - 2}Z"
        fill="#1a1a1a" opacity="0.92"/>
  <circle cx="${cx - 6}" cy="${headY + hRy + 6}"  r="1" fill="white" opacity="0.25"/>
  <circle cx="${cx + 0}" cy="${headY + hRy + 11}"  r="1" fill="white" opacity="0.25"/>
  <circle cx="${cx + 6}" cy="${headY + hRy + 6}"   r="1" fill="white" opacity="0.25"/>

  <!-- Corbata (modo pánico) -->
  ${tie}

  <!-- Cabeza -->
  <ellipse cx="${cx}"     cy="${headY}"     rx="${hRx}"         ry="${hRy}"          fill="${c.body}"/>
  <circle cx="${cx - 5}"  cy="${headY - 9}" r="1.5" fill="${skin}" opacity="0.4"/>
  <circle cx="${cx + 8}"  cy="${headY - 5}" r="1"   fill="${skin}" opacity="0.35"/>
  <circle cx="${cx - 10}" cy="${headY + 2}" r="1.2" fill="${skin}" opacity="0.35"/>
  <ellipse cx="${cx + 3}" cy="${headY + 4}" rx="${hRx * 0.55}" ry="${hRy * 0.55}" fill="${c.belly}" opacity="0.5"/>

  <!-- Branquias izquierda -->
  <path d="M${cx - hRx + 4},${headY - 4} Q${cx - hRx - 4},${headY - 24} ${cx - hRx},${headY - 36}"    stroke="${c.gill}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M${cx - hRx + 4},${headY - 4} Q${cx - hRx - 13},${headY - 19} ${cx - hRx - 11},${headY - 31}" stroke="${c.gill}" stroke-width="3"   fill="none" stroke-linecap="round"/>
  <path d="M${cx - hRx + 4},${headY - 4} Q${cx - hRx + 4},${headY - 21} ${cx - hRx + 7},${headY - 31}"  stroke="${c.gill}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="${cx - hRx}"     cy="${headY - 36}" r="4.5" fill="${c.gill}"/>
  <circle cx="${cx - hRx - 11}"cy="${headY - 31}" r="4"   fill="${c.gill}"/>
  <circle cx="${cx - hRx + 7}" cy="${headY - 31}" r="3.5" fill="${c.gill}"/>
  <!-- Branquias derecha -->
  <path d="M${cx + hRx - 4},${headY - 4} Q${cx + hRx + 4},${headY - 24} ${cx + hRx},${headY - 36}"    stroke="${c.gill}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M${cx + hRx - 4},${headY - 4} Q${cx + hRx + 13},${headY - 19} ${cx + hRx + 11},${headY - 31}" stroke="${c.gill}" stroke-width="3"   fill="none" stroke-linecap="round"/>
  <path d="M${cx + hRx - 4},${headY - 4} Q${cx + hRx - 4},${headY - 21} ${cx + hRx - 7},${headY - 31}"  stroke="${c.gill}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="${cx + hRx}"     cy="${headY - 36}" r="4.5" fill="${c.gill}"/>
  <circle cx="${cx + hRx + 11}"cy="${headY - 31}" r="4"   fill="${c.gill}"/>
  <circle cx="${cx + hRx - 7}" cy="${headY - 31}" r="3.5" fill="${c.gill}"/>

  ${eyeLeft}
  ${eyeRight}
  ${cheeks}
  ${mouths[expr]}

</svg>`;
}

/** Genera todos los sprites */
export function getAllSprites(size = 120): Record<XolitoMood, string> {
  const moods: XolitoMood[] = [
    'idle','happy','mad','sleepy','sassy',
    'proud','worried','hyped','tired','judging','panic','corrupt','deploy_friday',
  ];
  return Object.fromEntries(
    moods.map(m => [m, generateSpriteSVG(m, size)])
  ) as Record<XolitoMood, string>;
}
