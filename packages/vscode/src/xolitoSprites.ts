// ============================================================
//  xolito/packages/vscode/src/xolitoSprites.ts
//  Maneja el spritesheet PNG de Xolito
//  512x256px — 4 frames IDLE (fila 0) + 4 frames BLINK (fila 1)
//  128x128px por frame
// ============================================================

import type { XolitoMood } from '@xolito/core';

export const SPRITE_CONFIG = {
  frameWidth:  128,
  frameHeight: 128,
  totalFrames: 4,
  idleRow:     0,
  blinkRow:    1,
  sheetWidth:  512,
  sheetHeight: 256,
  fps:         8,   // 8fps = animación suave sin ser molesta
};

// Mapeo de mood → overlay SVG encima del sprite PNG
// El sprite base siempre es Xolito idle/blink
// Los overlays cambian la expresión facial según el mood
export const MOOD_OVERLAYS: Record<XolitoMood, string> = {

  idle: '',  // sin overlay — cara neutral del sprite base

  happy: `<svg class="emo" viewBox="0 0 128 128">
    <path d="M44 72 Q64 86 84 72" stroke="#FF6B6B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="56" r="3.5" fill="#FF6B6B" opacity="0.8"/>
    <circle cx="84" cy="56" r="3.5" fill="#FF6B6B" opacity="0.8"/>
  </svg>`,

  hyped: `<svg class="emo" viewBox="0 0 128 128">
    <path d="M38 68 Q64 86 90 68" stroke="#FFD700" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="54" r="5" fill="#FFD700"/>
    <circle cx="84" cy="54" r="5" fill="#FFD700"/>
    <text x="64" y="32" font-size="18" text-anchor="middle">⭐</text>
    <text x="100" y="44" font-size="14" text-anchor="middle">✦</text>
  </svg>`,

  mad: `<svg class="emo" viewBox="0 0 128 128">
    <path d="M48 78 L64 70 L80 78" stroke="#FF2222" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <line x1="38" y1="50" x2="52" y2="58" stroke="#FF2222" stroke-width="3" stroke-linecap="round"/>
    <line x1="90" y1="50" x2="76" y2="58" stroke="#FF2222" stroke-width="3" stroke-linecap="round"/>
    <circle cx="44" cy="60" r="4" fill="#FF2222"/>
    <circle cx="84" cy="60" r="4" fill="#FF2222"/>
  </svg>`,

  sassy: `<svg class="emo" viewBox="0 0 128 128">
    <path d="M48 74 Q60 80 80 70" stroke="#E8729A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="56" r="3.5" fill="#E8729A"/>
    <circle cx="84" cy="56" r="3.5" fill="#E8729A"/>
    <line x1="38" y1="52" x2="52" y2="54" stroke="#E8729A" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  sleepy: `<svg class="emo" viewBox="0 0 128 128">
    <path d="M48 72 Q64 68 80 72" stroke="#9A80C0" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M40 54 Q48 48 56 54" stroke="#9A80C0" stroke-width="3" fill="none"/>
    <path d="M72 54 Q80 48 88 54" stroke="#9A80C0" stroke-width="3" fill="none"/>
    <text x="64" y="34" font-size="16" text-anchor="middle">💤</text>
  </svg>`,

  proud: `<svg class="emo" viewBox="0 0 128 128">
    <path d="M38 65 Q64 48 90 65" stroke="#4CAF50" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="54" r="4.5" fill="#4CAF50"/>
    <circle cx="84" cy="54" r="4.5" fill="#4CAF50"/>
    <text x="64" y="30" font-size="16" text-anchor="middle">⭐</text>
  </svg>`,

  worried: `<svg class="emo" viewBox="0 0 128 128">
    <path d="M48 78 Q64 88 80 78" stroke="#E74C3C" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="56" r="4" fill="#E74C3C"/>
    <circle cx="84" cy="56" r="4" fill="#E74C3C"/>
    <path d="M54 46 L60 52 M74 46 L68 52" stroke="#E74C3C" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  tired: `<svg class="emo" viewBox="0 0 128 128">
    <line x1="48" y1="72" x2="80" y2="72" stroke="#A89090" stroke-width="3" stroke-linecap="round"/>
    <path d="M40 54 Q48 50 56 54" stroke="#A89090" stroke-width="2.5" fill="none"/>
    <path d="M72 54 Q80 50 88 54" stroke="#A89090" stroke-width="2.5" fill="none"/>
    <text x="64" y="34" font-size="14" text-anchor="middle">😮</text>
  </svg>`,

  judging: `<svg class="emo" viewBox="0 0 128 128">
    <line x1="46" y1="72" x2="82" y2="72" stroke="#E8729A" stroke-width="3" stroke-linecap="round"/>
    <circle cx="96" cy="56" r="3" fill="#E8729A"/>
    <line x1="38" y1="52" x2="54" y2="54" stroke="#E8729A" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="90" y1="52" x2="74" y2="54" stroke="#E8729A" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
};

// CSS para el widget del spritesheet
export const SPRITE_CSS = `
.sprite-wrap {
  position: relative;
  width: 128px;
  height: 128px;
  margin: 0 auto 8px;
  cursor: pointer;
  filter: drop-shadow(0 4px 12px rgba(244,168,192,0.3));
  transition: filter 0.3s ease;
}
.sprite-wrap:hover {
  filter: drop-shadow(0 6px 20px rgba(244,168,192,0.5));
}
.sprite {
  width: 128px;
  height: 128px;
  background-repeat: no-repeat;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  background-size: 512px 256px;
  background-position: 0px 0px;
}
.sprite.float { animation: float 3s ease-in-out infinite; }
.sprite.vibrate { animation: shake 0.3s ease-in-out 3; }
.emo {
  position: absolute;
  top: 0; left: 0;
  width: 128px; height: 128px;
  pointer-events: none;
  z-index: 10;
  animation: emoIn 0.3s ease-out;
}
@keyframes emoIn {
  from { opacity:0; transform:scale(0.6); }
  to   { opacity:1; transform:scale(1); }
}
@keyframes float {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@keyframes shake {
  0%,100% { transform: translateX(0); }
  25%     { transform: translateX(-4px); }
  75%     { transform: translateX(4px); }
}
`;

// JS del animador para inyectar en el webview
export const SPRITE_JS = `
const SPRITE_CFG = {
  frameWidth: 128, frameHeight: 128,
  totalFrames: 4, fps: 8,
  idleRow: 0, blinkRow: 1
};

class XolitoAnimator {
  constructor(el) {
    this.el = el;
    this.frame = 0;
    this.timer = null;
    this.blinking = false;
    this.blinkTimer = null;
  }

  start() {
    if (this.timer) clearInterval(this.timer);
    this.el.classList.add('float');
    this.timer = setInterval(() => {
      this.frame = (this.frame + 1) % SPRITE_CFG.totalFrames;
      this._setFrame(this.frame, SPRITE_CFG.idleRow);
    }, 1000 / SPRITE_CFG.fps);

    // Parpadeo aleatorio cada 3-6 segundos
    this._scheduleBlink();
  }

  _scheduleBlink() {
    const delay = 3000 + Math.random() * 3000;
    this.blinkTimer = setTimeout(() => {
      this._blink();
      this._scheduleBlink();
    }, delay);
  }

  _blink() {
    if (this.blinking) return;
    this.blinking = true;
    this._setFrame(0, SPRITE_CFG.blinkRow);
    setTimeout(() => {
      this._setFrame(this.frame, SPRITE_CFG.idleRow);
      this.blinking = false;
    }, 120);
  }

  _setFrame(x, y) {
    this.el.style.backgroundPosition =
      \`\${-x * SPRITE_CFG.frameWidth}px \${-y * SPRITE_CFG.frameHeight}px\`;
  }

  setMad() {
    this.el.classList.remove('float');
    this.el.classList.add('vibrate');
    setTimeout(() => {
      this.el.classList.remove('vibrate');
      this.el.classList.add('float');
    }, 900);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    if (this.blinkTimer) clearTimeout(this.blinkTimer);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('xolito-sprite');
  if (el) {
    window.xolitoAnim = new XolitoAnimator(el);
    window.xolitoAnim.start();
  }
});
`;
