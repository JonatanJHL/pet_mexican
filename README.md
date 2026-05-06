# 🦎 Xolito

> *"Aquí estoy, cuidándote... y juzgándote con cariño."*

**Xolito** es tu ajolote de compañía para la terminal y VS Code.  
Regañón. Tierno. Sarcástico. 100% mexicano. 0% filtro.

```
╭──────────────────────────────────────╮
│ ¿Otra vez push a main? Ay, cabrón... │
╰──────────────────────────────────────╯
  ╲
  ~(>_<)~
  /|   |\
   | ! |
  /|   |\
 ~enojado~
```

---

## ¿Qué es Xolito?

Inspirado en el [Claude Code Buddy](https://anthropic.com) y los [Codex Pets](https://openai.com),  
pero con sabor bien mexicano. El ajolote (*Ambystoma mexicanum*) es una especie endémica  
de México que nunca termina de madurar — igual que nuestro código.

---

## Instalación

### Claude Code (terminal)
```bash
npx @xolito/claude-code
```

O instalar global:
```bash
npm install -g @xolito/claude-code
xolito
```

### VS Code
Busca `Xolito` en el Marketplace de VS Code, o:
```bash
code --install-extension xolito.xolito-vscode
```

---

## Uso en terminal

```bash
# Modo interactivo
xolito

# Reaccionar a un evento directo
xolito build_fail
xolito build_success
xolito push_to_main

# Ver ayuda
xolito help
```

### Eventos disponibles

| Evento | Qué lo dispara |
|---|---|
| `build_success` | Build exitoso 🎉 |
| `build_fail` | Build roto 💀 |
| `test_pass` | Tests verdes ✅ |
| `test_fail` | Tests rojos 🔴 |
| `push_to_main` | Push directo a main 😱 |
| `git_force_push` | git push --force 💀💀 |
| `console_log_left` | console.log en código |
| `todo_comment` | TODO abandonado |
| `merge_conflict` | Conflicto de merge |
| `no_commits_1h` | Sin commits 1 hora |
| `no_commits_3h` | Sin commits 3 horas |
| `late_night_coding` | Codéando > 11pm |
| `weekend_coding` | Codéando en fin de semana |
| `heavy_node_modules` | node_modules > 500MB |
| `deleted_tests` | Borraste tests |
| `idle_10min` | Sin actividad 10 min |
| `idle_30min` | Sin actividad 30 min |

---

## Ejemplos de frases

```
🔴 Build fallido:
  "Ay, mijo... otra vez. ¿No que muy bueno?"
  "Tranquilo, le pasa hasta al mejor... aunque tú ya vas 4."
  "Failed. Así como tu dieta de enero, pero en código."

✅ Build exitoso:
  "Órale, compiló. No siempre la riegas, manito. 💚"
  "¡Funcionó! Anótalo, porque no pasa seguido."

😴 Sin commits en 3 horas:
  "Tres horas, compa. TU MAMÁ trabaja más rápido. Con todo respeto."
  "¿Sabías que tu mamá commitea más seguido? No, mentira, pero ya."

💀 Push a main:
  "¡Ay, cabrón! ¿Y el PR? ¿Lo dejaste en el carro?"
  "Mínimo reza antes de hacer eso, ¿no?"

🌙 Noche de código:
  "Son las 11pm y sigues aquí. Tu cama también te quiere, ¿eh?"
  "Las 12am y tú aquí. Tu mamá estaría muy orgullosa... y preocupada."
```

---

## Estructura del proyecto

```
xolito/
├── packages/
│   ├── core/          ← lógica, frases, sprites ASCII
│   ├── claude-code/   ← plugin de terminal
│   └── vscode/        ← extensión de VS Code
├── pnpm-workspace.yaml
└── README.md
```

---

## Contribuir

¿Tienes una frase más chida? ¿Un sprite más bonito? ¿Una broma de mamá más ingeniosa?  
**Abre un PR.** Las contribuciones de frases son especialmente bienvenidas.

### Agregar frases

Edita `packages/core/src/phrases.ts` y agrega tu frase al arreglo correspondiente:

```typescript
build_fail: [
  // ... frases existentes ...
  { text: "Tu nueva frase bien picosa aquí.", mood: 'mad' },
],
```

**Reglas para frases:**
- Deben ser chistosas pero sin insultos reales
- Las "mamadas" son de carnal, no de enemigo
- El sarcasmo va acompañado de cariño
- Mezcla español con inglés si se siente natural
- Máximo 60 caracteres para que quepa en el status bar

---

## Licencia

MIT — Úsalo, modifícalo, ponle más frases.  
Xolito es de todos. Como el aguacate.

---

*Hecho con 🦎 y mucho café en México*
