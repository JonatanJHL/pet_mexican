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
    { text: "¡Compiló sin chistar! Hasta parece que sabes lo que haces.", mood: 'happy' },
    { text: "Build verde. Tu compilador te da un abrazo. Cóbralo.", mood: 'proud' },
    { text: "Todo en orden. Me das chance de ir por un café.", mood: 'happy' },
    { text: "Compiló. Día productivo... o suerte. Igual cuenta.", mood: 'sassy' },
    { text: "Build exitoso. Marca esto en tu calendario.", mood: 'hyped' },
    { text: "Sin errores. ¿Seguro que esto es tuyo?", mood: 'sassy' },
    { text: "Limpio, sin warnings. ¿Quién eres y qué hiciste con mi dev?", mood: 'proud' },
    { text: "Verde. Dime qué cambiaste para no moverle otra vez.", mood: 'sassy' },
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
    { text: "Tronó el build. Como mis intentos de dieta.", mood: 'sassy' },
    { text: "Error de compilación. El clásico de todas las tardes.", mood: 'judging' },
    { text: "No compiló. Checa la línea veintitantos.", mood: 'worried' },
    { text: "Build rojo. Tan rojo como tu cara de coraje.", mood: 'mad' },
    { text: "El compilador dijo que no. Otra vez no.", mood: 'tired' },
    { text: "Failed build. Pasa más seguido de lo que admites.", mood: 'sassy' },
    { text: "Error. Error. Error. Tres veces, por si no viste.", mood: 'mad' },
  ],


  // ── TESTS PASARON


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
    { text: "Tests verdes. Vete antes de que algo truene.", mood: 'sassy' },
    { text: "Pasaron todos. Tómalo con calma.", mood: 'happy' },
    { text: "Cero fallos en tests. Ni yo puedo creerlo.", mood: 'proud' },
    { text: "Tests verdes. ¿Seguro los corriste bien?", mood: 'sassy' },
    { text: "Todo pasando. Buen momento para commitear.", mood: 'happy' },
    { text: "Verdecito el test suite. Bien ahí.", mood: 'proud' },
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
    { text: "Test rojo como el amor de tu ex.", mood: 'sassy' },
    { text: "Falló un test. ¿Ya viste qué cambiaste?", mood: 'worried' },
    { text: "Ni los tests te perdonan hoy.", mood: 'tired' },
    { text: "Rojo. Como semáforo de que te detengas.", mood: 'sassy' },
    { text: "Test caído. Un clásico de las 5pm.", mood: 'judging' },
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
    { text: "Archivo guardado sin comentarios. Muy confiado.", mood: 'sassy' },
    { text: "Cero comentarios. Como película sin subtítulos.", mood: 'judging' },
    { text: "Sin comentarios. Los futuros devs te van a odiar.", mood: 'worried' },
    { text: "Guardaste sin explicar nada. Típico.", mood: 'sassy' },
    { text: "Código sin comentarios. Eres un riesgo laboral.", mood: 'judging' },
    { text: "Sin comentarios. Como mapa sin leyenda.", mood: 'judging' },
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
    { text: "Main directo. ¿PR? No, gracias.", mood: 'sassy' },
    { text: "Push a main sin PR. Vivir al límite.", mood: 'worried' },
    { text: "Directo a producción. Que sea lo que Dios quiera.", mood: 'worried' },
    { text: "Main branch violentada con éxito.", mood: 'judging' },
    { text: "Push a main. El equipo no lo sabe.", mood: 'worried' },
    { text: "Main sin revisión. Xolito se persigna.", mood: 'mad' },
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
    { text: "Esa función es un edificio de 10 pisos.", mood: 'sassy' },
    { text: "Función larga. ¿Heredaste esto o lo escribiste hoy?", mood: 'judging' },
    { text: "Esa función necesita su propio archivo.", mood: 'sassy' },
    { text: "Monolito funcional. Como las pirámides.", mood: 'judging' },
    { text: "Cien líneas haciendo una cosa. Miente, hace tres.", mood: 'sassy' },
    { text: "Función larga. Cuestión de orgullo.", mood: 'sassy' },
  ],


  // ── SIN COMMITS EN 1 HORA ────────────────────────────────
  no_commits_1h: [
    { text: "Una hora sin commits. ¿TikTok o bloqueado?", mood: 'judging' },
    { text: "Sin guardar nada. ¿Todo bien, mano?", mood: 'idle' },
    { text: "¿Vas a codear o calientas la silla?", mood: 'sassy' },
    { text: "Sin commits. Juzgo un poco, no voy a mentir.", mood: 'judging' },
    { text: "Una hora. ¿Bloqueado o distraído? Ambas son válidas.", mood: 'worried' },
    { text: "Tick tock, mijo. El código no se escribe solo.", mood: 'sassy' },
    { text: "1 hora sin commits. ¿Programando o viendo memes?", mood: 'judging' },
    { text: "Una hora sin cambios. ¿Todo bien?", mood: 'worried' },
    { text: "Sin commits. Reflexionando o procrastinando.", mood: 'judging' },
    { text: "Llevas sesenta minutos sin mover un archivo.", mood: 'sassy' },
    { text: "Una hora. El cursor parpadea desesperado.", mood: 'judging' },
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
    { text: "3 horas. La jornada se va y tú sin commitear.", mood: 'sassy' },
    { text: "Tres horas en blanco. Espero que sea un bug cabrón.", mood: 'worried' },
    { text: "Sin commits desde antes de comer.", mood: 'judging' },
    { text: "3h sin código. ¿Ya despediste o nomás estás viendo?", mood: 'sassy' },
    { text: "Entre más pasa el tiempo, más me preocupo.", mood: 'worried' },
    { text: "Tres horas y nada. Tu repo se siente solo.", mood: 'judging' },
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
    { text: "Primer commit. El día oficialmente arrancó.", mood: 'happy' },
    { text: "¡Primer cambio! Ya era hora.", mood: 'sassy' },
    { text: "El primer paso cuesta trabajo, pero ya lo diste.", mood: 'proud' },
    { text: "Primer commit. Lo demás es cuesta abajo.", mood: 'happy' },
    { text: "Abriendo el repo. Vamos a ver qué sale.", mood: 'hyped' },
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
    { text: "Instalando dependencias. Reza para que no rompa nada.", mood: 'worried' },
    { text: "npm install. El tiempo vuela cuando te embotellas.", mood: 'idle' },
    { text: "Descargando node_modules. El Internet hace su magia.", mood: 'idle' },
    { text: "Instalando paquetes. Ojalá no sea otro left-pad.", mood: 'worried' },
    { text: "Dependencias descargando. Tiempo de estirar las piernas.", mood: 'sassy' },
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
    { text: "node_modules: 1 proyecto, 500MB. Matemáticas raras.", mood: 'sassy' },
    { text: "Más pesado que tu conciencia los lunes.", mood: 'sassy' },
    { text: "Tu node_modules parece sistema operativo.", mood: 'judging' },
    { text: "GBs de dependencias. ¿Para un hola mundo?", mood: 'mad' },
    { text: "node_modules enorme. Tus discos duros lloran.", mood: 'worried' },
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
    { text: "Syntax error. No, no me lo esperaba.", mood: 'sassy' },
    { text: "Error de sintaxis. Te faltó un caracter de amor.", mood: 'worried' },
    { text: "Syntax. La puntuación importa, mijo.", mood: 'judging' },
    { text: "No compila por sintaxis. Revisa lo básico.", mood: 'worried' },
    { text: "Syntax error en domingo. Descansa.", mood: 'judging' },
    { text: "Te faltó un paréntesis. Y una vida pasada.", mood: 'sassy' },
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
    { text: "console.log en prod. Más viejo que internet.", mood: 'sassy' },
    { text: "console.log: debug noble y patético a la vez.", mood: 'judging' },
    { text: "Otro console.log. Como tatuaje de ex.", mood: 'sassy' },
    { text: "Ese log no debería estar ahí. Como tú a las 3am.", mood: 'judging' },
    { text: "console.log detectado. La tradición no muere.", mood: 'sassy' },
    { text: "console.log. ¿También debuggeas con palitos y piedras?", mood: 'sassy' },
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
    { text: "TODO: arreglar esto. Spoiler: no se arregla.", mood: 'judging' },
    { text: "TODO de hace 2 años. Vintage.", mood: 'sassy' },
    { text: "Ese TODO es pre-pandémico.", mood: 'sassy' },
    { text: "TODO: refactor. Refactor: nunca.", mood: 'judging' },
    { text: "TODO. También conocido como 'nunca va a pasar'.", mood: 'sassy' },
    { text: "TODO abandonado. Como tus propósitos de año nuevo.", mood: 'judging' },
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
    { text: "<<<<<<< HEAD. El clásico del miedo.", mood: 'worried' },
    { text: "Merge conflict. ¿Hablaste con tu compañero?", mood: 'sassy' },
    { text: "Conflicto de merge. La vida en sociedad.", mood: 'judging' },
    { text: "Git no está feliz contigo. Y con razón.", mood: 'mad' },
    { text: "Conflictos. Como en la familia, pero más fáciles.", mood: 'sassy' },
    { text: "Merge conflict. Llamen a un adulto.", mood: 'worried' },
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
    { text: "1am y codeando. Mañana te duele la cabeza.", mood: 'worried' },
    { text: "De madrugada programando. Muy hacker.", mood: 'sassy' },
    { text: "Noche de código. Las mejores ideas vienen de noche.", mood: 'sassy' },
    { text: "¿Sabes qué hora es? Hora de dormir.", mood: 'worried' },
    { text: "Código nocturno. Tus ojos te pasarán factura.", mood: 'tired' },
    { text: "De madrugada y debuggeando. Qué vida, mijo.", mood: 'judging' },
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
    { text: "Sábado codeando. ¿No tenías algo mejor?", mood: 'judging' },
    { text: "Finde de trabajo. Tu therapist no aprueba.", mood: 'sassy' },
    { text: "Domingo y con código. El burnout llama.", mood: 'worried' },
    { text: "Fin de semana laboral. Respira, mijo.", mood: 'worried' },
    { text: "Sábado de debugging. Tus hobbies te esperan.", mood: 'judging' },
    { text: "Código en domingo. Hasta el teclado está triste.", mood: 'sassy' },
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
    { text: "Force push. El botón nuclear de git.", mood: 'mad' },
    { text: "--force. Porque la historia no importa.", mood: 'sassy' },
    { text: "Force push detectado. Dios tenga piedad.", mood: 'worried' },
    { text: "Push violento. Como tus cambios.", mood: 'judging' },
    { text: "Force push en 3, 2, 1... historial voló.", mood: 'mad' },
    { text: "¿Force push en main? Avisa, mijo.", mood: 'mad' },
  ],

  // ── BORRASTE TESTS ────────────────────────────────────────
  deleted_tests: [
    { text: "Borraste tests. Coverage subió. Qué listo.", mood: 'mad' },
    { text: "Eliminaste tests pa' que pasaran. Clásico.", mood: 'sassy' },
    { text: "Los tests no estaban mal. El código sí.", mood: 'mad' },
    { text: "¿Borraste los tests? Ajá. Bien.", mood: 'judging' },
    { text: "Tu yo del futuro te va a odiar.", mood: 'sassy' },
    { text: "Borraste los tests. Hoy ganaste, mañana lloras.", mood: 'judging' },
    { text: "Tests borrados. El coverage subió automágicamente.", mood: 'sassy' },
    { text: "Eliminaste tests. Mi fe en la humanidad bajó.", mood: 'judging' },
    { text: "Borraste pruebas. Eso no es ágil, es trampa.", mood: 'mad' },
    { text: "Adiós tests. No los vamos a extrañar. Yo sí.", mood: 'sassy' },
    { text: "Tests: desaparecidos. Tú: en la mira.", mood: 'judging' },
  ],

  // ── IDLE 10 MIN ───────────────────────────────────────────
  idle_10min: [
    { text: "Diez minutos. ¿Reflexivo o TikTok?", mood: 'judging' },
    { text: "Sigo aquí. Sin juzgar. Bueno, un poco.", mood: 'idle' },
    { text: "¿Todavía estás? Pensé que fuiste a comer.", mood: 'sleepy' },
    { text: "10 minutos. ¿Bloqueado? Escríbelo en papel.", mood: 'worried' },
    { text: "Pasan los minutos y el código sigue igual.", mood: 'judging' },
    { text: "10 min sin moverle. ¿Bug o break?", mood: 'judging' },
    { text: "Diez minutos. ¿Reflexionando o viendo el techo?", mood: 'idle' },
    { text: "Pausa activa... o pausa nomás.", mood: 'sleepy' },
    { text: "10 minutos. Tu código te espera paciente.", mood: 'idle' },
  ],

  // ── IDLE 30 MIN ───────────────────────────────────────────
  idle_30min: [
    { text: "Treinta minutos. ¿Abrazo o café?", mood: 'worried' },
    { text: "Media hora. Busca ayuda. No soy yo, pero búscala.", mood: 'sassy' },
    { text: "30 min sin código. Yo también descanso.", mood: 'sleepy' },
    { text: "Media hora parado. ¿Bug difícil o adorno?", mood: 'judging' },
    { text: "Llevas 30 min. ¿Llamo a alguien? No puedo, pero pregunto.", mood: 'sassy' },
    { text: "Media hora. El cursor parpadeando te juzga.", mood: 'judging' },
    { text: "30 minutos. ¿Comida o crisis existencial?", mood: 'worried' },
    { text: "Media hora. Xolito se preocupa de verdad.", mood: 'worried' },
    { text: "¿Sigues ahí o ya te fuiste a dormir?", mood: 'sleepy' },
    { text: "30 min sin actividad. Me veo Netflix.", mood: 'judging' },
    { text: "Una llamita de atención. ¿Sigues?", mood: 'worried' },
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
    { text: "¡Qué onda! Xolito al rescate. O al chisme.", mood: 'hyped' },
    { text: "Llegaste. El día mejora. O se pone más interesante.", mood: 'happy' },
    { text: "Bienvenido. Xolito modo on. Paciencia modo off.", mood: 'sassy' },
    { text: "¡Ey! Tú pon el código y yo los comentarios.", mood: 'hyped' },
    { text: "Saludos de tu ajolote favorito. ¿A qué le entramos?", mood: 'happy' },
  ],
  
  // ── ¡AHÍ VIENE EL PATRÓN! ───────────────────────────────────

  // ── CORRUPCIÓN DEL REPO ──────────────────────────────────────
  corruption_warning: [
    { text: "Algo huele raro en este repo...",                mood: 'worried'  },
    { text: "Los TODOs se acumulan, mijo. Límpialos.",        mood: 'judging'  },
    { text: "El repo empieza a crujir. Xolito lo siente.",   mood: 'worried'  },
    { text: "Corrupción detectada. Leve. Por ahora.",        mood: 'sassy'    },
    { text: "¿Cuándo fue el último commit limpio?",           mood: 'judging'  },
    { text: "Hay demasiados errores acumulados, mijo.",       mood: 'worried'  },
  ],

  corruption_critical: [
    { text: "EL REPO ESTÁ EN PELIGRO.",                       mood: 'mad'      },
    { text: "Demasiados errores. La corrupción avanza.",      mood: 'mad'      },
    { text: "El linter ya no puede salvarte.",                mood: 'tired'    },
    { text: "¿Cuándo compiló esto limpio por última vez?",   mood: 'tired'    },
    { text: "Xolito está muy preocupado. Muy.",              mood: 'worried'  },
    { text: "ALERT: repo integrity compromised.",             mood: 'mad'      },
    { text: "Ese undefined ya tiene conciencia propia.",      mood: 'mad'      },
  ],

  corruption_cleaned: [
    { text: "0 corrupción. ¿Quién eres y qué hiciste con mi dev?", mood: 'happy'  },
    { text: "Repo limpio. Xolito respira de nuevo.",          mood: 'proud'    },
    { text: "Limpiaste todo. Xolito está orgulloso.",        mood: 'proud'    },
    { text: "Clean build. Clean repo. Clean conscience.",    mood: 'hyped'    },
    { text: "Cero corrupción. Esto merece un taquito.",       mood: 'happy'    },
  ],

  // ── DEPLOY EN VIERNES ────────────────────────────────────────
  deploy_friday: [
    { text: "NO SE HACE DEPLOY EN VIERNES. NUNCA.",           mood: 'mad'      },
    { text: "¿DEPLOY EN VIERNES? Xolito no se responsabiliza.", mood: 'mad'   },
    { text: "El on-call ya te odia. Lo acabas de confirmar.", mood: 'sassy'   },
    { text: "ALARM: FRIDAY DEPLOY. GOD HELP US ALL.",         mood: 'mad'      },
    { text: "Viernes + deploy = weekend on-call. Suerte.",    mood: 'worried'  },
    { text: "Histórico: 94% de deploys del viernes rompen prod.", mood: 'worried' },
    { text: "Deploy en viernes. Xolito se persigna.",         mood: 'mad'      },
  ],

  boss_alert: [
    { text: "¡Disimula, disimula! ¡Ponte a leer código denso! 🤫", mood: 'panic' },
    { text: "¡Ahí viene el jefe! Modo ultra-godín activado.", mood: 'panic' },
    { text: "¡Saca la corbata, mijo! Abre un archivo que se vea difícil.", mood: 'panic' },
    { text: "¡Finge demencia! Tú estás optimizando bases de datos, ¿va?", mood: 'panic' },
    { text: "¡No voltees! Mirada fija a la pantalla como hacker ruso.", mood: 'panic' },
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
