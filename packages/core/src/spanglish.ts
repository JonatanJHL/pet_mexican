// ============================================================
//  xolito/packages/core/src/spanglish.ts
//  Detección de Spanglish: verbo en inglés + sustantivo en español
//  Fuente única para el evaluador (core) y el linter (vscode)
// ============================================================

/** Sustantivos en español comunes en nombres de variables/funciones. */
const SPANISH_WORDS = [
  'usuario', 'cliente', 'datos', 'dato', 'articulo', 'nombre', 'direccion',
  'factura', 'precio', 'fecha', 'empresa', 'configuracion', 'estado', 'firma',
  'comentario', 'mensaje', 'detalle', 'lista', 'fila', 'columna', 'tabla',
  'archivo', 'imagen', 'texto', 'excepcion', 'fase', 'logro', 'medalla',
  'ficha', 'lote', 'grupo', 'cuenta', 'clave', 'contrasena', 'perfil', 'rol',
  'alerta', 'notificacion', 'calendario', 'evento', 'recordatorio', 'tarea',
  'chambazo', 'termometro', 'estres', 'barrio', 'viernes', 'pedido',
  'producto', 'venta', 'compra', 'pago', 'saldo', 'correo', 'telefono',
  'ciudad', 'pais', 'empleado', 'colaborador', 'servicio', 'equipo',
];

const VERBS = 'get|set|fetch|update|delete|create|load|save|find|remove|add|check';

const cap = (w: string) => w[0].toUpperCase() + w.slice(1);

// camelCase: getDatosCliente, fetchUsuarios, getDirección
const CAMEL_SOURCE =
  `\\b(?:${VERBS})(?:[A-Z][a-z0-9]*)*?` +
  `(?:(?:${SPANISH_WORDS.map(cap).join('|')})(?:s|es)?|[A-Za-z]*[áéíóúñÁÉÍÓÚÑ][a-záéíóúñ]*)` +
  `(?![a-z])`;

// snake_case: get_datos_cliente, fetch_usuarios
const SNAKE_SOURCE =
  `\\b(?:${VERBS})_(?:[a-z0-9]+_)*?` +
  `(?:(?:${SPANISH_WORDS.join('|')})(?:s|es)?|[a-z]*[áéíóúñ][a-záéíóúñ]*)` +
  `(?![a-z0-9])`;

export interface SpanglishMatch {
  index:  number;
  length: number;
  text:   string;
}

/** Regresa todas las coincidencias. Crea regex nuevas en cada llamada (sin lastIndex compartido). */
export function findSpanglish(text: string): SpanglishMatch[] {
  const out: SpanglishMatch[] = [];
  for (const source of [CAMEL_SOURCE, SNAKE_SOURCE]) {
    const re = new RegExp(source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      out.push({ index: m.index, length: m[0].length, text: m[0] });
      if (m[0].length === 0) re.lastIndex++; // defensa contra match vacío
    }
  }
  return out.sort((a, b) => a.index - b.index);
}

export function hasSpanglish(text: string): boolean {
  return new RegExp(CAMEL_SOURCE).test(text) || new RegExp(SNAKE_SOURCE).test(text);
}
