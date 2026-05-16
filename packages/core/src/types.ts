// ============================================================
//  xolito/packages/core/src/types.ts
//  Tipos base del ajolote más chido de la terminal
// ============================================================

export type XolitoMood =
  | 'idle'        // tranquilo, sin hacer nada
  | 'happy'       // build verde, todo chido
  | 'mad'         // error, el código está de la fregada
  | 'sleepy'      // sin actividad > 10min
  | 'sassy'       // modo regañón activado
  | 'proud'       // achievement desbloqueado
  | 'worried'     // warning en el código
  | 'hyped'       // primer commit del día
  | 'tired'       // muchos errores seguidos
  | 'judging'    // mirándote fijamente sin decir nada
  | 'panic'; // error crítico, el boos esta mirando

export type XolitoEvent =
  | 'build_success'
  | 'build_fail'
  | 'test_pass'
  | 'test_fail'
  | 'save_no_comments'
  | 'push_to_main'
  | 'long_function'       // función > 50 líneas
  | 'no_commits_1h'
  | 'no_commits_3h'
  | 'first_commit_today'
  | 'npm_install'
  | 'heavy_node_modules'  // node_modules > 500MB
  | 'syntax_error'
  | 'console_log_left'    // dejaste console.logs en prod
  | 'todo_comment'        // encontró un TODO abandonado
  | 'merge_conflict'
  | 'late_night_coding'   // después de las 11pm
  | 'weekend_coding'
  | 'git_force_push'
  | 'deleted_tests'
  | 'idle_10min'
  | 'idle_30min'
  | 'greeted'         // primera vez que lo saluda
  | 'boss_alert';

export interface XolitoConfig {
  name?: string;             // nombre del ajolote (default: Xolito)
  spiciness?: 1 | 2 | 3;    // nivel de picante: 1=suave, 2=medio, 3=bien picoso
  language?: 'es' | 'spanglish';
  sounds?: boolean;
  showInStatusBar?: boolean;
}

export interface XolitoPhrase {
  text: string;
  mood: XolitoMood;
}
