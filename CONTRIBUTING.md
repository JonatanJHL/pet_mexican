# Contribuir a Xolito 🦎

¡Gracias por querer hacer a Xolito más chido!

## ¿Cómo agrego frases?

1. Abre `packages/core/src/phrases.ts`
2. Busca el evento al que quieres agregarle frases
3. Agrega tu objeto `{ text: "...", mood: '...' }` al arreglo
4. Haz tu PR con el título: `feat(phrases): agrega frases para [evento]`

## Reglas del juego

✅ **Sí se vale:**
- Sarcasmo amoroso ("le pasa hasta al mejor... aunque tú ya vas 4")
- Referencias a mamás pero con cariño y respeto
- Mexicanismos auténticos (órale, mijo, caray, ándale)
- Spanglish natural (no forzado)
- Referencias a cultura dev (dieta de enero = resolutions que nunca se cumplen)
- Ternura mezclada con regaño

❌ **No se vale:**
- Insultos reales o hirientes
- Discriminación de cualquier tipo
- Frases genéricas sin personalidad
- Más de 80 caracteres (no cabe en el status bar)

## Moods disponibles

| Mood | Cuándo usarlo |
|---|---|
| `happy` | Éxito, buenas noticias |
| `proud` | Logro importante |
| `hyped` | Primer commit, energía alta |
| `mad` | Error grave, bad practice |
| `sassy` | Sarcasmo suave, regaño tierno |
| `judging` | Mirando sin decir nada |
| `worried` | Advertencia, algo sospechoso |
| `tired` | Muchos errores seguidos |
| `sleepy` | Inactividad |
| `idle` | Neutral, esperando |

## Proceso de PR

1. Fork del repo
2. Crea una rama: `feat/frases-build-fail`
3. Agrega tus frases
4. Asegúrate que el build pase: `pnpm build`
5. Abre tu PR describiendo qué tan chidas son tus frases

---

*"El código sin comentarios es como un taco sin salsa. Técnicamente funciona, pero ¿a qué costo?"*
— Xolito, 2026
