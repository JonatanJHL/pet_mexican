// ============================================================
//  xolito/packages/core/src/phrases.ts
//  El banco de frases de Xolito — bien picoso, modo compa
//  Regañón pero amoroso. Sarcástico pero tierno. 100% mexicano.
// ============================================================

import type { XolitoEvent, XolitoPhrase } from './types.js';

export const PHRASES: Record<XolitoEvent, XolitoPhrase[]> = {

  // ── BUILD EXITOSO ──────────────────────────────────────────
  build_success: [
    { text: "Órale, compiló. No siempre la riegas, manito. 💚", mood: 'happy' },
    { text: "Sale, estuvo bien. De nada, aunque tú no hayas pedido ayuda.", mood: 'proud' },
    { text: "Build verde. Hasta yo me sorprendí, la verdad.", mood: 'sassy' },
    { text: "¡Funcionó! Anótalo, porque no pasa seguido.", mood: 'hyped' },
    { text: "Mira nada más, sí puedes cuando quieres. 🥹", mood: 'proud' },
    { text: "Chido, compiló. Ahora a ver cuándo lo rompes de nuevo.", mood: 'sassy' },
    { text: "Eso estuvo bonito, mijo. Te lo digo en serio.", mood: 'happy' },
    { text: "Green ✅. Guárdalo en tus recuerdos porque esto no dura.", mood: 'sassy' },
  ],

  // ── BUILD FALLIDO ──────────────────────────────────────────
  build_fail: [
    { text: "Ay, mijo... otra vez. ¿No que muy bueno?", mood: 'mad' },
    { text: "Error. ¿Leíste el mensaje de error o nomás lo cerraste?", mood: 'sassy' },
    { text: "Se rompió. Sorpresa de nadie, la verdad.", mood: 'mad' },
    { text: "Errorcito. Bueno, 'errorcito' no, es un errorón. 😬", mood: 'mad' },
    { text: "Tranquilo, le pasa hasta al mejor... aunque tú ya vas 4.", mood: 'sassy' },
    { text: "Ay caray. Yo nada más digo.", mood: 'worried' },
    { text: "Failed. Así como tu dieta de enero, pero en código.", mood: 'sassy' },
    { text: "¿Quieres que te lea el error o lo vas a ignorar bonito?", mood: 'sassy' },
    { text: "Error número ${count}. Yo confío en ti. Mentira, pero te apoyo.", mood: 'tired' },
  ],

  // ── TESTS PASARON ─────────────────────────────────────────
  test_pass: [
    { text: "¡Tests verdes! Mira, hasta lloré un poco. 🥲", mood: 'proud' },
    { text: "Todos los tests pasaron. Esto merece un taquito.", mood: 'happy' },
    { text: "100% coverage. Mentira, pero los que tienes pasaron.", mood: 'sassy' },
    { text: "Tests pasados. Oye, ¿cuándo escribiste estos? ¿Ayer? Qué maduro.", mood: 'happy' },
    { text: "All tests passing. Tú sí puedes, aunque no parezca. 💪", mood: 'proud' },
  ],

  // ── TESTS FALLARON ────────────────────────────────────────
  test_fail: [
    { text: "Fallaron los tests. ¿Y los ibas a subir así, verdad?", mood: 'mad' },
    { text: "Tests rojos. En tu lugar yo me haría el dormido.", mood: 'sassy' },
    { text: "Ni los tests te perdonaron, mijo.", mood: 'mad' },
    { text: "Test failed. Oye, ¿qué le hiciste?", mood: 'worried' },
    { text: "Rojos. Muy rojos. Como tus mejillas cuando te cacha el PR reviewer.", mood: 'sassy' },
    { text: "Houston, tenemos un problema. Bueno, tú tienes el problema.", mood: 'sassy' },
  ],

  // ── GUARDÓ SIN COMENTARIOS ────────────────────────────────
  save_no_comments: [
    { text: "Código sin comentarios. Muy valiente. Como poner trampa sin baño.", mood: 'sassy' },
    { text: "¿Qué hace esta función, mijo? Ah, no sé, no hay comentarios. 🙃", mood: 'sassy' },
    { text: "Comenta tu código. Por favor. Para el que lo lea... que eres tú en 2 semanas.", mood: 'worried' },
    { text: "Función de 40 líneas sin un solo comentario. Respeto, pero no.", mood: 'mad' },
    { text: "Yo sé que sabes lo que hace. Tu yo del futuro no, pero tú sí.", mood: 'sassy' },
  ],

  // ── PUSH DIRECTO A MAIN ───────────────────────────────────
  push_to_main: [
    { text: "¡Ay, cabrón! ¿Y el PR? ¿Lo dejaste en el carro?", mood: 'mad' },
    { text: "Push a main. Muy valiente. Muy, muy valiente.", mood: 'worried' },
    { text: "Directo a main. Ora sí Dios nos agarre confesados.", mood: 'mad' },
    { text: "¿Code review? No, ¿para qué? Ya con verlo tú está bien, ¿verdad?", mood: 'sassy' },
    { text: "Push a main detectado. Xolito.exe ha dejado de funcionar.", mood: 'mad' },
    { text: "Mínimo reza antes de hacer eso, ¿no?", mood: 'worried' },
  ],

  // ── FUNCIÓN MUY LARGA ─────────────────────────────────────
  long_function: [
    { text: "Esa función ya tiene más líneas que mi paciencia.", mood: 'sassy' },
    { text: "¿50 líneas en una función? No, mijo, así no.", mood: 'mad' },
    { text: "Single responsibility principle, ¿lo conoces? Te lo presento.", mood: 'sassy' },
    { text: "Esta función hace de todo menos la comida. Refactoriza, porfa.", mood: 'worried' },
    { text: "Función larga. Señal de que algo salió mal en la vida.", mood: 'judging' },
  ],

  // ── SIN COMMITS EN 1 HORA ────────────────────────────────
  no_commits_1h: [
    { text: "Una hora sin commits. ¿Estás pensando o scrolleando TikTok?", mood: 'judging' },
    { text: "Llevas un rato sin guardar nada. ¿Todo bien, mano?", mood: 'idle' },
    { text: "Oye, ¿vas a codear o nomás calientas la silla?", mood: 'sassy' },
    { text: "Sin commits. Yo no juzgo, pero... sí juzgo un poco.", mood: 'judging' },
  ],

  // ── SIN COMMITS EN 3 HORAS ───────────────────────────────
  no_commits_3h: [
    { text: "Tres horas, compa. TU MAMÁ trabaja más rápido. Con todo respeto.", mood: 'sassy' },
    { text: "3 horas sin un commit. ¿Estás refactorizando o filosófico?", mood: 'judging' },
    { text: "Hasta yo me dormí esperando tu siguiente commit.", mood: 'sleepy' },
    { text: "Bro, git commit existe. Te lo juro. Lo acabo de checar.", mood: 'sassy' },
    { text: "¿Sabías que tu mamá commitea más seguido? No, mentira, pero ya.", mood: 'sassy' },
  ],

  // ── PRIMER COMMIT DEL DÍA ────────────────────────────────
  first_commit_today: [
    { text: "¡Despertaste! Bienvenido. Ya pensé que hoy no venías. 🌅", mood: 'hyped' },
    { text: "Primer commit del día. Igual que yo, tarde pero seguro.", mood: 'happy' },
    { text: "¡Ahí está! ¿Ves que sí puedes? Buenas tardes, además.", mood: 'sassy' },
    { text: "Primer commit. El día ya valió la pena. Casi.", mood: 'happy' },
  ],

  // ── NPM INSTALL ───────────────────────────────────────────
  npm_install: [
    { text: "npm install... aquí vamos. Saca un café.", mood: 'idle' },
    { text: "Instalando dependencias. Ojalá todas sean necesarias. 🙏", mood: 'worried' },
    { text: "npm install detectado. Preparando existencial crisis de node_modules.", mood: 'idle' },
    { text: "A ver qué nos regala el internet hoy.", mood: 'idle' },
  ],

  // ── NODE_MODULES PESADO ───────────────────────────────────
  heavy_node_modules: [
    { text: "500MB de node_modules. ¿Cuántas dependencias necesitas para vivir?", mood: 'mad' },
    { text: "Tu node_modules pesa más que tu laptop. Eso no es normal.", mood: 'sassy' },
    { text: "Bro, ¿instalaste el internet completo o qué pasó?", mood: 'mad' },
    { text: "node_modules enorme detectado. Tu SSD ya te odia.", mood: 'worried' },
    { text: "¿De verdad necesitas todas estas dependencias? ¿Pregunta sincera?", mood: 'judging' },
  ],

  // ── SYNTAX ERROR ─────────────────────────────────────────
  syntax_error: [
    { text: "Syntax error. El punto y coma te extraña.", mood: 'sassy' },
    { text: "Oye, se te fue una coma. O un punto. O los dos. Revisa.", mood: 'worried' },
    { text: "Syntax error. ¿Lo escribiste con los ojos cerrados?", mood: 'mad' },
    { text: "El parser no te entiende. Yo tampoco, pero por otras razones.", mood: 'sassy' },
    { text: "Error de sintaxis. Hay días así, mijo.", mood: 'worried' },
  ],

  // ── CONSOLE.LOG EN CÓDIGO ────────────────────────────────
  console_log_left: [
    { text: "Encontré un console.log. ¿Lo ibas a subir así a prod? ¿Sí, verdad?", mood: 'mad' },
    { text: "console.log detectado. Muy artesanal tu debugging.", mood: 'sassy' },
    { text: "Mijo, hay debuggers para eso. Existen. Los inventaron y todo.", mood: 'sassy' },
    { text: "console.log('aquí llegué'). Clásico. Nunca cambia.", mood: 'judging' },
    { text: "¿Cuántos console.logs tiene esta función? No, no cuento. Sí conté. Son 7.", mood: 'mad' },
  ],

  // ── TODO ABANDONADO ───────────────────────────────────────
  todo_comment: [
    { text: "// TODO: fix this. Escrito hace 8 meses. ¿Cuándo, mijo?", mood: 'judging' },
    { text: "Encontré un TODO de 2022. Ya tiene más edad que algunos bugs.", mood: 'sassy' },
    { text: "TODO detectado. Spoiler: nunca se va a hacer.", mood: 'judging' },
    { text: "// TODO: refactor. El refactor más famoso que nunca llegó.", mood: 'sassy' },
    { text: "Oye, ese TODO ya tiene telarañas. ¿Lo borramos o le ponemos veladora?", mood: 'sassy' },
  ],

  // ── MERGE CONFLICT ───────────────────────────────────────
  merge_conflict: [
    { text: "Merge conflict. Alguien en tu equipo también sabe programar. Qué noticia.", mood: 'sassy' },
    { text: "<<<<<<< HEAD. El símbolo del terror. Buena suerte.", mood: 'worried' },
    { text: "Conflicto de merge. ¿Hablaste con tu equipo o nomás commiteas y oras?", mood: 'mad' },
    { text: "Merge conflict detectado. Yo estaría en pánico, tú... ¿también?", mood: 'worried' },
    { text: "Conflicto en el repo. Como en la familia, pero con código.", mood: 'sassy' },
  ],

  // ── CODING DE NOCHE ───────────────────────────────────────
  late_night_coding: [
    { text: "Son las 11pm y sigues aquí. Tu cama también te quiere, ¿eh?", mood: 'worried' },
    { text: "Noche de código. El código de noche nunca miente... ni funciona.", mood: 'sassy' },
    { text: "Oye, ya duerme. Mañana lo ves y dices '¿quién hizo esto?'", mood: 'worried' },
    { text: "Coding nocturno. Los bugs de madrugada son los mejores. Mentira.", mood: 'sassy' },
    { text: "¿Sabes qué necesita tu cerebro ahora? No es caffeine. Es dormir.", mood: 'worried' },
    { text: "Las 12am y tú aquí. Tu mamá estaría muy orgullosa... y preocupada.", mood: 'sassy' },
  ],

  // ── CODING FIN DE SEMANA ─────────────────────────────────
  weekend_coding: [
    { text: "Sábado y aquí. ¿No tenías vida social o ya la terminaste?", mood: 'judging' },
    { text: "Domingo de código. Los domingos son para descansar, mijo.", mood: 'worried' },
    { text: "Fin de semana detectado. Xolito respeta tu dedicación y tu soledad.", mood: 'sassy' },
    { text: "¿Sábado codéando? Tu mamá te estaría regañando ahora mismo.", mood: 'sassy' },
    { text: "Weekend warrior. El deploy del lunes ya te espera con ansias.", mood: 'judging' },
  ],

  // ── GIT FORCE PUSH ───────────────────────────────────────
  git_force_push: [
    { text: "git push --force. Xolito ha salido del edificio. 💀", mood: 'mad' },
    { text: "Force push. ¿Ya le avisaste a tu equipo o los vas a sorprender?", mood: 'mad' },
    { text: "Eso que hiciste... sí tiene nombre. Y no es bonito.", mood: 'sassy' },
    { text: "Force push detectado. Que Dios te perdone, yo no sé.", mood: 'mad' },
    { text: "Ahí va el historial de commits. Al hoyo. Con todo.", mood: 'worried' },
  ],

  // ── BORRASTE TESTS ────────────────────────────────────────
  deleted_tests: [
    { text: "Borraste tests. Técnicamente el coverage subió. Qué listo.", mood: 'mad' },
    { text: "Eliminaste tests para que pasen. Clásico. Muy clásico.", mood: 'sassy' },
    { text: "Los tests no estaban mal, mijo. El código estaba mal.", mood: 'mad' },
    { text: "¿Borraste los tests? Ajá. Sí. Okey. Bien.", mood: 'judging' },
  ],

  // ── IDLE 10 MIN ───────────────────────────────────────────
  idle_10min: [
    { text: "Diez minutos sin hacer nada. ¿Estás en modo reflexivo o en TikTok?", mood: 'judging' },
    { text: "Sigo aquí, por si acaso. Esperándote. Sin juzgar. Bueno, un poco.", mood: 'idle' },
    { text: "¿Todavía estás? Pensé que te habías ido a comer.", mood: 'sleepy' },
  ],

  // ── IDLE 30 MIN ───────────────────────────────────────────
  idle_30min: [
    { text: "Treinta minutos. Oye, ¿necesitas un abrazo o un café?", mood: 'worried' },
    { text: "Media hora. Si estás bloqueado, dímelo. Bueno, no me digas, pero busca ayuda.", mood: 'sassy' },
    { text: "30 minutos sin código. Yo también descanso, no te preocupes.", mood: 'sleepy' },
    { text: "Media hora parado. ¿Es un bug difícil o ya nomás estás aquí de adorno?", mood: 'judging' },
  ],

  // ── SALUDO INICIAL ────────────────────────────────────────
  greeted: [
    { text: "¡Órale, llegaste! Soy Xolito, tu ajolote de confianza. Bienvenido. 🦎", mood: 'hyped' },
    { text: "¿Qué pasó? Xolito en línea. A tus órdenes... más o menos.", mood: 'happy' },
    { text: "Buenas. Soy Xolito. Aquí estoy para juzgarte con cariño. 💚", mood: 'happy' },
    { text: "Hey! Soy tu nuevo compa de terminal. Me llamo Xolito y no muerdo. Seguido.", mood: 'hyped' },
  ],
};

/**
 * Obtiene una frase aleatoria para el evento dado.
 * Si el evento no tiene frases, regresa una genérica.
 */
export function getPhrase(event: XolitoEvent): XolitoPhrase {
  const options = PHRASES[event];
  if (!options || options.length === 0) {
    return { text: "...(Xolito te mira fijamente sin decir nada)", mood: 'judging' };
  }
  return options[Math.floor(Math.random() * options.length)];
}
