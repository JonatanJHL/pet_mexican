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
    { text: "Sale, estuvo bien. De nada, aunque no pediste ayuda.", mood: 'proud' },
    { text: "Build verde. Hasta yo me sorprendí, la verdad.", mood: 'sassy' },
    { text: "¡Funcionó! Anótalo, porque no pasa seguido.", mood: 'hyped' },
    { text: "Mira nada más, sí puedes cuando quieres. 🥹", mood: 'proud' },
    { text: "Chido, compiló. Ahora a ver cuándo lo rompes.", mood: 'sassy' },
    { text: "Eso estuvo bonito, mijo. Te lo digo en serio.", mood: 'happy' },
    { text: "Green ✅. Guárdalo porque esto no dura.", mood: 'sassy' },
    { text: "Compiló limpio. Tu mamá estaría orgullosa.", mood: 'happy' },
    { text: "Cero errores. ¿Cuándo fue la última vez?", mood: 'hyped' },
    { text: "Sí se pudo. Nunca lo dudé. Bueno, un poco.", mood: 'sassy' },
    { text: "Build verde. Hoy sí rayaste.", mood: 'proud' },
  ],

  // ── BUILD FALLIDO ──────────────────────────────────────────
  build_fail: [
    { text: "Ay, mijo... otra vez. ¿No que muy bueno?", mood: 'mad' },
    { text: "Error. ¿Leíste el mensaje o nomás lo cerraste?", mood: 'sassy' },
    { text: "Se rompió. Sorpresa de nadie.", mood: 'mad' },
    { text: "Errorcito. Bueno, errorón. 😬", mood: 'mad' },
    { text: "Le pasa hasta al mejor... tú ya vas 4.", mood: 'sassy' },
    { text: "Failed. Como tu dieta de enero, pero en código.", mood: 'sassy' },
    { text: "¿Lo vas a ignorar bonito o lees el error?", mood: 'sassy' },
    { text: "Error número ${count}. Te apoyo. Mentira, pero te apoyo.", mood: 'tired' },
    { text: "Rojo otra vez. ¿Ya comiste? A veces eso ayuda.", mood: 'worried' },
    { text: "El compilador no te quiere hoy. Ni yo, pero es aparte.", mood: 'sassy' },
    { text: "¿Sabes qué? Respira. El error no se va solo.", mood: 'worried' },
    { text: "Tronó. Bien tronado. Ni modo.", mood: 'mad' },
    { text: "Rojo de nuevo. A estas alturas ya es una tradición.", mood: 'judging' },
    { text: "¿Copiaste el error en Google o lo vas a resolver solo?", mood: 'sassy' },
    { text: "Error. Nomás pa' que sepas que vi todo.", mood: 'judging' },
  ],


  // ── TESTS PASARON ─────────────────────────────────────────
  test_pass: [
    { text: "¡Tests verdes! Hasta lloré un poco. 🥲", mood: 'proud' },
    { text: "Todos los tests pasaron. Merece un taquito.", mood: 'happy' },
    { text: "100% coverage. Mentira, pero los que tienes pasaron.", mood: 'sassy' },
    { text: "¿Cuándo escribiste estos tests? Qué maduro.", mood: 'happy' },
    { text: "All tests passing. Tú sí puedes. 💪", mood: 'proud' },
    { text: "Verdes. Todos. ¿Ves? No era tan difícil.", mood: 'happy' },
    { text: "Tests pasando. Xolito aprueba este momento.", mood: 'proud' },
    { text: "¡Tests! ¡Verdes! ¡Los dos! El sueño americano.", mood: 'hyped' },
  ],

  // ── TESTS FALLARON ────────────────────────────────────────
  test_fail: [
    { text: "Fallaron los tests. ¿Y los ibas a subir así?", mood: 'mad' },
    { text: "Tests rojos. Me haría el dormido en tu lugar.", mood: 'sassy' },
    { text: "Ni los tests te perdonaron, mijo.", mood: 'mad' },
    { text: "Test failed. ¿Qué le hiciste?", mood: 'worried' },
    { text: "Rojos. Como tus mejillas cuando te cacha el reviewer.", mood: 'sassy' },
    { text: "Houston, tú tienes el problema.", mood: 'sassy' },
    { text: "Los tests dijeron que no. Muy claro.", mood: 'mad' },
    { text: "Fallaron. ¿Los ibas a borrar pa' que pasaran?", mood: 'judging' },
    { text: "Red. Todo rojo. Como semáforo de tu vida.", mood: 'sassy' },
  ],

  // ── GUARDÓ SIN COMENTARIOS ────────────────────────────────
  save_no_comments: [
    { text: "Sin comentarios. Como poner trampa sin baño.", mood: 'sassy' },
    { text: "¿Qué hace esta función? No hay comentarios. 🙃", mood: 'sassy' },
    { text: "Comenta. Para el que lo lea en 2 semanas — eres tú.", mood: 'worried' },
    { text: "40 líneas sin un comentario. Respeto, pero no.", mood: 'mad' },
    { text: "Tu yo del futuro no va a entender nada.", mood: 'sassy' },
    { text: "Sin comentarios. Tu mamá tampoco entiende lo que haces.", mood: 'sassy' },
    { text: "Escribe al menos un comentario. ¿Qué hace esto?", mood: 'worried' },
    { text: "Código sin comentarios es como un mapa sin nombres.", mood: 'judging' },
  ],

  // ── PUSH DIRECTO A MAIN ───────────────────────────────────
  push_to_main: [
    { text: "¡Ay, cabrón! ¿Y el PR? ¿Lo dejaste en el carro?", mood: 'mad' },
    { text: "Push a main. Muy valiente.", mood: 'worried' },
    { text: "Directo a main. Ora sí Dios nos agarre confesados.", mood: 'mad' },
    { text: "¿Code review? Nah, ¿pa' qué? ¿Verdad?", mood: 'sassy' },
    { text: "Push a main. Xolito.exe dejó de funcionar.", mood: 'mad' },
    { text: "Mínimo reza, ¿no?", mood: 'worried' },
    { text: "Directo a main como los valientes. O los que luego lloran.", mood: 'sassy' },
    { text: "¿Sin PR? Okay. Bueno. Bien. Perfecto.", mood: 'judging' },
    { text: "Push a main en viernes. Clásico.", mood: 'mad' },
    { text: "¿Ya avisaste al equipo o los vas a sorprender?", mood: 'worried' },
  ],

  // ── FUNCIÓN MUY LARGA ─────────────────────────────────────
  long_function: [
    { text: "Esa función tiene más líneas que mi paciencia.", mood: 'sassy' },
    { text: "¿50 líneas en una función? No, mijo.", mood: 'mad' },
    { text: "Single responsibility principle. Te lo presento.", mood: 'sassy' },
    { text: "Esta función hace de todo menos la comida.", mood: 'worried' },
    { text: "Función larga. Algo salió mal en la planeación.", mood: 'judging' },
    { text: "¿Cuántas cosas hace eso? Más de una, seguro.", mood: 'judging' },
    { text: "Refactoriza, mijo. Por tu bien y el mío.", mood: 'worried' },
    { text: "Esa función es un monolito. Parécito tuyo.", mood: 'sassy' },
  ],


  // ── SIN COMMITS EN 1 HORA ────────────────────────────────
  no_commits_1h: [
    { text: "Una hora sin commits. ¿TikTok o bloqueado?", mood: 'judging' },
    { text: "Sin guardar nada. ¿Todo bien, mano?", mood: 'idle' },
    { text: "¿Vas a codear o calientas la silla?", mood: 'sassy' },
    { text: "Sin commits. Juzgo un poco, no voy a mentir.", mood: 'judging' },
    { text: "Una hora. ¿Bloqueado o distraído? Ambas son válidas.", mood: 'worried' },
    { text: "Tick tock, mijo. El código no se escribe solo.", mood: 'sassy' },
  ],

  // ── SIN COMMITS EN 3 HORAS ───────────────────────────────
  no_commits_3h: [
    { text: "Tres horas. TU MAMÁ trabaja más rápido. Con respeto.", mood: 'sassy' },
    { text: "3 horas sin commit. ¿Filosófico o Netflix?", mood: 'judging' },
    { text: "Me dormí esperando tu commit.", mood: 'sleepy' },
    { text: "git commit existe. Te lo juro.", mood: 'sassy' },
    { text: "Tu mamá commitea más seguido. Mentira, pero ya.", mood: 'sassy' },
    { text: "Tres horas. ¿Quieres hablar de lo que pasó?", mood: 'worried' },
    { text: "Media jornada sin un solo commit. Récord personal.", mood: 'judging' },
    { text: "El repo te extraña, mijo.", mood: 'worried' },
  ],

  // ── PRIMER COMMIT DEL DÍA ────────────────────────────────
  first_commit_today: [
    { text: "¡Despertaste! Ya pensé que hoy no venías. 🌅", mood: 'hyped' },
    { text: "Primer commit. Tarde pero seguro.", mood: 'happy' },
    { text: "¡Ahí está! Buenas tardes, además.", mood: 'sassy' },
    { text: "Primer commit. El día ya valió. Casi.", mood: 'happy' },
    { text: "Llegaste. Lo demás ya se verá.", mood: 'happy' },
    { text: "¡Órale! El repo te da la bienvenida.", mood: 'hyped' },
    { text: "Primer commit del día. Xolito orgulloso.", mood: 'proud' },
  ],

  // ── NPM INSTALL ───────────────────────────────────────────
  npm_install: [
    { text: "npm install... saca un café.", mood: 'idle' },
    { text: "Instalando. Ojalá sean necesarias todas. 🙏", mood: 'worried' },
    { text: "node_modules viniendo. Crisis existencial en camino.", mood: 'idle' },
    { text: "A ver qué nos manda el internet hoy.", mood: 'idle' },
    { text: "Instalando... la barra de progreso miente, siempre.", mood: 'sassy' },
    { text: "npm install. El silencio antes de la tormenta.", mood: 'worried' },
    { text: "Descargando el internet. Un momento.", mood: 'sassy' },
  ],

  // ── NODE_MODULES PESADO ───────────────────────────────────
  heavy_node_modules: [
    { text: "500MB de node_modules. ¿Cuántos necesitas?", mood: 'mad' },
    { text: "Tu node_modules pesa más que tu laptop.", mood: 'sassy' },
    { text: "¿Instalaste el internet completo?", mood: 'mad' },
    { text: "node_modules enorme. Tu SSD ya te odia.", mood: 'worried' },
    { text: "¿De verdad necesitas todo esto? Pregunta sincera.", mood: 'judging' },
    { text: "node_modules más pesado que tus decisiones de vida.", mood: 'sassy' },
    { text: "Oye, ¿para qué es la mitad de esto?", mood: 'judging' },
  ],


  // ── SYNTAX ERROR ─────────────────────────────────────────
  syntax_error: [
    { text: "Syntax error. El punto y coma te extraña.", mood: 'sassy' },
    { text: "Se te fue una coma. O un punto. Revisa.", mood: 'worried' },
    { text: "¿Lo escribiste con los ojos cerrados?", mood: 'mad' },
    { text: "El parser no te entiende. Yo tampoco, pero es aparte.", mood: 'sassy' },
    { text: "Error de sintaxis. Hay días así.", mood: 'worried' },
    { text: "¿Leíste el error o recompilaste nomás?", mood: 'judging' },
    { text: "Falta algo. Revisa lento.", mood: 'worried' },
    { text: "El compilador dice que no. Muy claro.", mood: 'mad' },
    { text: "Syntax. La clásica. La de siempre.", mood: 'judging' },
  ],

  // ── CONSOLE.LOG EN CÓDIGO ────────────────────────────────
  console_log_left: [
    { text: "console.log detectado. ¿Lo ibas a subir a prod?", mood: 'mad' },
    { text: "Muy artesanal tu debug.", mood: 'sassy' },
    { text: "Mijo, hay debuggers. Los inventaron y todo.", mood: 'sassy' },
    { text: "console.log('aquí llegué'). Clásico. Nunca cambia.", mood: 'judging' },
    { text: "Conté 7 console.logs. Siete.", mood: 'mad' },
    { text: "console.log en prod. La tradición continúa.", mood: 'judging' },
    { text: "Ese console.log lleva más tiempo aquí que tú.", mood: 'sassy' },
    { text: "¿Lo ibas a quitar 'ahorita'? Claro.", mood: 'sassy' },
    { text: "Debug a mano. Old school. No está bien, pero okay.", mood: 'judging' },
    { text: "console.log found. Alguien aquí no confía en el debugger.", mood: 'sassy' },
  ],

  // ── TODO ABANDONADO ───────────────────────────────────────
  todo_comment: [
    { text: "// TODO de hace 8 meses. ¿Cuándo, mijo?", mood: 'judging' },
    { text: "TODO de 2022. Más viejo que algunos bugs.", mood: 'sassy' },
    { text: "TODO detectado. Spoiler: nunca se hace.", mood: 'judging' },
    { text: "// TODO: refactor. El más famoso que nunca llegó.", mood: 'sassy' },
    { text: "Ese TODO tiene telarañas. ¿Veladora o lo borramos?", mood: 'sassy' },
    { text: "Tu yo del pasado dejándote tarea. Qué considerado.", mood: 'judging' },
    { text: "TODO encontrado. Prometiste y no cumpliste. Otra vez.", mood: 'sassy' },
    { text: "// TODO: fix. ¿Cuándo? Pregunta del siglo.", mood: 'judging' },
    { text: "Ese TODO ya votó en las últimas elecciones.", mood: 'sassy' },
  ],

  // ── MERGE CONFLICT ───────────────────────────────────────
  merge_conflict: [
    { text: "Merge conflict. Alguien más sabe programar. Qué noticia.", mood: 'sassy' },
    { text: "<<<<<<< HEAD. El símbolo del terror.", mood: 'worried' },
    { text: "Conflicto de merge. ¿Hablas con tu equipo o solo commiteas?", mood: 'mad' },
    { text: "Merge conflict. ¿También en pánico o solo yo?", mood: 'worried' },
    { text: "Conflicto. Como en la familia, pero con código.", mood: 'sassy' },
    { text: "<<<<<<< HEAD otra vez. ¿Cuándo fue la última standup?", mood: 'judging' },
    { text: "Git está enojado. Y con razón.", mood: 'mad' },
    { text: "Conflict detected. El equipo no para de sorprenderte.", mood: 'sassy' },
  ],


  // ── CODING DE NOCHE ───────────────────────────────────────
  late_night_coding: [
    { text: "11pm y sigues aquí. Tu cama también te quiere.", mood: 'worried' },
    { text: "Código de noche. Nunca miente... ni funciona.", mood: 'sassy' },
    { text: "Ya duerme. Mañana lo ves y dices '¿quién hizo esto?'", mood: 'worried' },
    { text: "Bugs de madrugada son los mejores. Mentira.", mood: 'sassy' },
    { text: "Tu cerebro necesita dormir. No caffeine.", mood: 'worried' },
    { text: "12am y aquí. Tu mamá orgullosa... y preocupada.", mood: 'sassy' },
    { text: "Madrugada de código. Muy romántico si no fuera mala idea.", mood: 'sassy' },
    { text: "El código de las 2am no es tu amigo, mijo.", mood: 'worried' },
    { text: "¿Cuántos cafés van? No cuento. Sí conté.", mood: 'judging' },
    { text: "Noche de debugging. Que salga bien, Dios mío.", mood: 'worried' },
  ],

  // ── CODING FIN DE SEMANA ─────────────────────────────────
  weekend_coding: [
    { text: "Sábado y aquí. ¿No tenías vida o ya la terminaste?", mood: 'judging' },
    { text: "Domingo de código. Descansa, mijo.", mood: 'worried' },
    { text: "Fin de semana. Xolito respeta tu dedicación y soledad.", mood: 'sassy' },
    { text: "¿Sábado? Tu mamá te estaría regañando.", mood: 'sassy' },
    { text: "Weekend warrior. El deploy del lunes te espera.", mood: 'judging' },
    { text: "Domingo. Hasta Dios descansó.", mood: 'sassy' },
    { text: "Fin de semana codéando. Muy profesional. Muy triste.", mood: 'judging' },
    { text: "¿No hay nada más que hacer un sábado?", mood: 'judging' },
  ],

  // ── GIT FORCE PUSH ───────────────────────────────────────
  git_force_push: [
    { text: "git push --force. Xolito ha salido del edificio. 💀", mood: 'mad' },
    { text: "Force push. ¿Ya avisaste al equipo?", mood: 'mad' },
    { text: "Eso que hiciste tiene nombre. No es bonito.", mood: 'sassy' },
    { text: "Force push. Que Dios te perdone.", mood: 'mad' },
    { text: "Ahí va el historial. Al hoyo. Con todo.", mood: 'worried' },
    { text: "--force en viernes. Muy valiente.", mood: 'mad' },
    { text: "¿Force push? ¿En serio? ¿Hoy?", mood: 'mad' },
    { text: "Historia reescrita. Ojalá resultara.", mood: 'worried' },
  ],

  // ── BORRASTE TESTS ────────────────────────────────────────
  deleted_tests: [
    { text: "Borraste tests. Coverage subió. Qué listo.", mood: 'mad' },
    { text: "Eliminaste tests pa' que pasaran. Clásico.", mood: 'sassy' },
    { text: "Los tests no estaban mal. El código sí.", mood: 'mad' },
    { text: "¿Borraste los tests? Ajá. Bien.", mood: 'judging' },
    { text: "Tu yo del futuro te va a odiar.", mood: 'sassy' },
    { text: "Borraste los tests. Hoy ganaste, mañana lloras.", mood: 'judging' },
  ],

  // ── IDLE 10 MIN ───────────────────────────────────────────
  idle_10min: [
    { text: "Diez minutos. ¿Reflexivo o TikTok?", mood: 'judging' },
    { text: "Sigo aquí. Sin juzgar. Bueno, un poco.", mood: 'idle' },
    { text: "¿Todavía estás? Pensé que fuiste a comer.", mood: 'sleepy' },
    { text: "10 minutos. ¿Bloqueado? Escríbelo en papel.", mood: 'worried' },
    { text: "Pasan los minutos y el código sigue igual.", mood: 'judging' },
  ],

  // ── IDLE 30 MIN ───────────────────────────────────────────
  idle_30min: [
    { text: "Treinta minutos. ¿Abrazo o café?", mood: 'worried' },
    { text: "Media hora. Busca ayuda. No soy yo, pero búscala.", mood: 'sassy' },
    { text: "30 min sin código. Yo también descanso.", mood: 'sleepy' },
    { text: "Media hora parado. ¿Bug difícil o adorno?", mood: 'judging' },
    { text: "Llevas 30 min. ¿Llamo a alguien? No puedo, pero pregunto.", mood: 'sassy' },
    { text: "Media hora. El cursor parpadeando te juzga.", mood: 'judging' },
  ],

  // ── SALUDO INICIAL ────────────────────────────────────────
  greeted: [
    { text: "¡Órale, llegaste! Soy Xolito, tu ajolote de confianza. 🦎", mood: 'hyped' },
    { text: "¿Qué pasó? Xolito en línea. A tus órdenes... más o menos.", mood: 'happy' },
    { text: "Buenas. Aquí para juzgarte con cariño. 💚", mood: 'happy' },
    { text: "Hey! Soy tu compa de terminal. No muerdo. Seguido.", mood: 'hyped' },
    { text: "Buenas. ¿Vienes a romper cosas o a arreglarlas? Igual te apoyo.", mood: 'happy' },
    { text: "Xolito activo. Listo para ver tus errores con cariño.", mood: 'happy' },
    { text: "¡Qué bueno que llegaste! Yo ya estaba aquí esperando.", mood: 'hyped' },
  ],
};

// ── Anti-repetición ────────────────────────────────────────────
const phraseHistory: Map<XolitoEvent, string[]> = new Map();
const HISTORY_SIZE = 3;

export function getPhrase(event: XolitoEvent): XolitoPhrase {
  const options = PHRASES[event];
  if (!options || options.length === 0) {
    return { text: '...(Xolito te mira fijamente)', mood: 'judging' };
  }
  if (options.length === 1) return options[0];

  const history = phraseHistory.get(event) ?? [];
  const available = options.filter(p => !history.includes(p.text));
  const pool = available.length > 0 ? available : options;
  const selected = pool[Math.floor(Math.random() * pool.length)];

  history.push(selected.text);
  if (history.length > HISTORY_SIZE) history.shift();
  phraseHistory.set(event, history);

  return selected;
}

export function clearPhraseHistory(): void {
  phraseHistory.clear();
}
