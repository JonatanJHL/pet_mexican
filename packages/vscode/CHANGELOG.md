# Changelog

## 1.5.1

### Corregido
- **VS Code ya no se congela** con archivos que tenían nombres como `my_Var` o `getDatos` (el linter de Spanglish entraba en un loop infinito).
- **Linter de Chambazos más preciso:** solo marca verbo en inglés + sustantivo en español (`fetchUsuarios`, `get_datos_cliente`). Ya no regaña por `setState`, `getUser` o `createElement`.
- **Deploy Suicida, push y commits ahora sí se detectan.** Los commits se leen de la extensión de Git de VS Code y la terminal usa shell integration (VS Code 1.93+).
- `xolito-health.json` ya no se crea en la raíz de tu proyecto; se guarda en el almacenamiento privado de la extensión.
- **Auditoría de código:** el resultado ya no se pierde si el panel estaba cerrado, y el código que escribes en el panel ya no se borra solo.
- **Aplicar refactor** verifica que el código no haya cambiado antes de reemplazarlo.
- **Modo Patrón** cierra el archivo falso sin preguntar "¿Guardar cambios?" frente al jefe.
- **Evaluador offline:** mejor detección de lenguaje (JS vs Python, PHP), `catch` vacíos en Java/Kotlin/Python, anidación profunda y comentarios.
- **Pruebas de Escritorio:** conserva la función seleccionada, no se recalcula en cada tecla y muestra bien código con `<` `>`.
- **Gemini:** la API key viaja en header, con timeout de 30 s y puntajes acotados.
- Las frases inline ya no cambian en cada tecla.

## 1.5.0
- Pruebas de Escritorio (Dry Run) con IA, linter inline y termómetro de estrés.
