// ============================================================
//  xolito/packages/core/src/types.ts
//  Tipos base del ajolote más chido de la terminal
// ============================================================

export type XolitoMood =
  | 'idle'          // tranquilo, sin hacer nada
  | 'happy'         // build verde, todo chido
  | 'mad'           // error, el código está de la fregada
  | 'sleepy'        // sin actividad > 10min
  | 'sassy'         // modo regañón activado
  | 'proud'         // achievement desbloqueado
  | 'worried'       // warning en el código
  | 'hyped'         // primer commit del día
  | 'tired'         // muchos errores seguidos
  | 'judging'       // mirándote fijamente sin decir nada
  | 'panic'         // el jefe está mirando
  | 'corrupt'       // repo en estado crítico
  | 'deploy_friday';// viernes + deploy = caos

export type XolitoEvent =
  | 'build_success'
  | 'build_fail'
  | 'test_pass'
  | 'test_fail'
  | 'save_no_comments'
  | 'push_to_main'
  | 'long_function'
  | 'no_commits_1h'
  | 'no_commits_3h'
  | 'first_commit_today'
  | 'npm_install'
  | 'heavy_node_modules'
  | 'syntax_error'
  | 'console_log_left'
  | 'todo_comment'
  | 'merge_conflict'
  | 'late_night_coding'
  | 'weekend_coding'
  | 'git_force_push'
  | 'deleted_tests'
  | 'idle_10min'
  | 'idle_30min'
  | 'greeted'
  | 'boss_alert'
  | 'corruption_warning'
  | 'corruption_critical'
  | 'corruption_cleaned'
  | 'deploy_friday';

export interface XolitoConfig {
  name?: string;
  spiciness?: 1 | 2 | 3;
  language?: 'es' | 'spanglish';
  sounds?: boolean;
  showInStatusBar?: boolean;
}

export interface XolitoPhrase {
  text: string;
  mood: XolitoMood;
}
