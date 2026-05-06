// ============================================================
//  xolito/packages/core/src/xolito.ts
//  Clase principal — el cerebro de nuestro ajolote regañón
// ============================================================

import { getPhrase } from './phrases.js';
import { renderWithBubble } from './sprites.js';
import type { XolitoConfig, XolitoEvent, XolitoMood, XolitoPhrase } from './types.js';

export class Xolito {
  private config: Required<XolitoConfig>;
  private currentMood: XolitoMood = 'idle';
  private errorCount = 0;
  private lastEventTime = Date.now();

  constructor(config: XolitoConfig = {}) {
    this.config = {
      name: config.name ?? 'Xolito',
      spiciness: config.spiciness ?? 3,
      language: config.language ?? 'spanglish',
      sounds: config.sounds ?? false,
      showInStatusBar: config.showInStatusBar ?? true,
    };
  }

  /** Reacciona a un evento del editor/terminal */
  react(event: XolitoEvent): XolitoPhrase {
    this.lastEventTime = Date.now();

    // Lleva la cuenta de errores seguidos
    if (event === 'build_fail' || event === 'test_fail' || event === 'syntax_error') {
      this.errorCount++;
    } else if (event === 'build_success' || event === 'test_pass') {
      this.errorCount = 0;
    }

    const phrase = getPhrase(event);

    // Si el texto tiene ${count}, sustituir con el número de errores seguidos
    const text = phrase.text.replace('${count}', String(this.errorCount));

    this.currentMood = phrase.mood;
    return { text, mood: phrase.mood };
  }

  /** Renderiza Xolito completo con burbuja en ASCII */
  render(message?: string): string {
    const displayMessage = message ?? `Soy ${this.config.name} 🦎`;
    return renderWithBubble(this.currentMood, displayMessage);
  }

  /** Sólo el sprite, sin burbuja */
  renderSprite(): string {
    const { SPRITES } = require('./sprites.js');
    return SPRITES[this.currentMood].join('\n');
  }

  getMood(): XolitoMood { return this.currentMood; }
  getName(): string { return this.config.name; }
  getErrorCount(): number { return this.errorCount; }

  /** Verifica si lleva mucho tiempo sin actividad y regresa el evento apropiado */
  checkIdle(): XolitoEvent | null {
    const mins = (Date.now() - this.lastEventTime) / 60000;
    if (mins >= 30) return 'idle_30min';
    if (mins >= 10) return 'idle_10min';
    return null;
  }
}
