// ============================================================
//  xolito/packages/claude-code/src/index.ts
//  Plugin de Xolito para Claude Code
//  Uso: npx @xolito/claude-code
// ============================================================

import { Xolito } from '@xolito/core';
import type { XolitoEvent } from '@xolito/core';
import * as readline from 'readline';

const ANSI = {
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  cyan:    '\x1b[36m',
  magenta: '\x1b[35m',
  red:     '\x1b[31m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  reset:   '\x1b[0m',
};

function colorize(text: string, ...codes: string[]): string {
  return codes.join('') + text + ANSI.reset;
}

function printXolito(xolito: Xolito, message: string): void {
  const rendered = xolito.render(message);
  const mood = xolito.getMood();

  const moodColors: Record<string, string> = {
    happy:   ANSI.green,
    proud:   ANSI.green,
    hyped:   ANSI.cyan,
    mad:     ANSI.red,
    sassy:   ANSI.yellow,
    judging: ANSI.magenta,
    worried: ANSI.yellow,
    idle:    ANSI.dim,
    sleepy:  ANSI.dim,
    tired:   ANSI.dim,
  };

  const color = moodColors[mood] ?? ANSI.cyan;
  console.log(colorize(rendered, color));
}

function printHelp(): void {
  console.log(`
${colorize('🦎 Xolito — comandos disponibles', ANSI.bold, ANSI.cyan)}

  ${colorize('/xolito', ANSI.bold)}              Muestra a Xolito
  ${colorize('/xolito greet', ANSI.bold)}         Saludo inicial
  ${colorize('/xolito <evento>', ANSI.bold)}       Reacciona a un evento

${colorize('Eventos disponibles:', ANSI.dim)}
  build_success   build_fail    test_pass     test_fail
  push_to_main    no_commits_1h idle_10min    syntax_error
  console_log_left  todo_comment  merge_conflict  git_force_push
  late_night_coding weekend_coding  npm_install
`);
}

async function runInteractive(xolito: Xolito): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colorize('xolito> ', ANSI.cyan),
  });

  const { text } = xolito.react('greeted');
  printXolito(xolito, text);

  rl.prompt();

  rl.on('line', (line: string) => {
    const input = line.trim().replace(/^\/xolito\s*/, '');

    if (!input || input === 'show') {
      printXolito(xolito, `Aquí estoy, ${colorize('¿qué necesitas?', ANSI.bold)}`);
    } else if (input === 'help') {
      printHelp();
    } else if (input === 'quit' || input === 'exit') {
      console.log(colorize('\n🦎 Xolito: Órale, hasta luego. No me extrañes mucho.\n', ANSI.cyan));
      process.exit(0);
    } else {
      const event = input as XolitoEvent;
      try {
        const { text } = xolito.react(event);
        printXolito(xolito, text);
      } catch {
        console.log(colorize(`Ese evento no lo conozco: ${input}`, ANSI.dim));
        console.log(colorize('Escribe "help" para ver qué sé hacer.', ANSI.dim));
      }
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log(colorize('\n🦎 Te fuiste sin despedirte. Típico.\n', ANSI.yellow));
  });
}

// ── Entry point ──────────────────────────────────────────────
const args = process.argv.slice(2);
const xolito = new Xolito({ spiciness: 3, language: 'spanglish' });

if (args.length === 0) {
  runInteractive(xolito);
} else if (args[0] === 'help') {
  printHelp();
} else {
  const event = args[0] as XolitoEvent;
  const { text } = xolito.react(event);
  printXolito(xolito, text);
}
