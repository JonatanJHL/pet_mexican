<div align="center">

# 🦎 Xolito

<img src="packages/vscode/assets/xolito_idle.png" width="120" alt="Xolito idle"/>

> *"Aquí estoy, cuidándote... y juzgándote con cariño."*

**Tu ajolote regañón para VS Code y la terminal.**  
Regañón. Tierno. Sarcástico. 100% mexicano. 0% filtro.

![CI](https://github.com/JonatanJHL/pet_mexican/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-pink)
![Made in Mexico](https://img.shields.io/badge/Hecho%20en-México%20🇲🇽-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

</div>

---

## ¿Qué es Xolito?

Xolito es una mascota virtual inspirada en el **ajolote mexicano** (*Ambystoma mexicanum*) — la especie endémica de México que nunca termina de madurar. Igual que nuestro código.

Vive en tu VS Code, detecta errores en tiempo real via LSP, y te regaña con cariño en español mexicano.

---

## 🎭 Moods

<div align="center">

| | | | | |
|:---:|:---:|:---:|:---:|:---:|
| <img src="packages/vscode/assets/xolito_idle.png" width="80"/><br>**idle** | <img src="packages/vscode/assets/xolito_happy.png" width="80"/><br>**happy** | <img src="packages/vscode/assets/xolito_mad.png" width="80"/><br>**mad** | <img src="packages/vscode/assets/xolito_sassy.png" width="80"/><br>**sassy** | <img src="packages/vscode/assets/xolito_worried.png" width="80"/><br>**worried** |
| <img src="packages/vscode/assets/xolito_proud.png" width="80"/><br>**proud** | <img src="packages/vscode/assets/xolito_hyped.png" width="80"/><br>**hyped** | <img src="packages/vscode/assets/xolito_tired.png" width="80"/><br>**tired** | <img src="packages/vscode/assets/xolito_judging.png" width="80"/><br>**judging** | <img src="packages/vscode/assets/xolito_idle.png" width="80"/><br>**sleepy** |

</div>

---

## ✨ Features

- 🔴 **Detecta errores LSP en tiempo real** — TypeScript, PHP, Python, Go, Rust, C#, Java
- 💬 **Comentarios inline** — aparece junto a errores, warnings, `console.log` y TODOs
- 🎨 **Sprites por mood** — cambia de cara según lo que detecta en tu código
- 📊 **Panel con stats** — errores, warnings, racha y mood en tiempo real
- 🌙 **Eventos especiales** — detecta coding nocturno, fin de semana, push a main
- 🔇 **Toggle** — siléncialo cuando necesites concentrarte
- 🇲🇽 **100% mexicano** — frases en español con spanglish natural

---

## 📦 Instalación

### VS Code

1. Clona el repo y compila:

```bash
git clone https://github.com/JonatanJHL/pet_mexican.git xolito
cd xolito
pnpm install
cd packages/core && pnpm exec tsc
cd ../vscode && pnpm exec tsc -p tsconfig.json
```

2. Abre en VS Code y presiona **F5**:

```bash
cd ../..
code .
# Presiona F5 → abre segunda ventana con Xolito instalado
```

3. Abre el panel: `Cmd+Shift+P` → **Mostrar Xolito**

### Terminal (Claude Code)

```bash
npx @xolito/claude-code

# O instalar global
npm install -g @xolito/claude-code
xolito
```

---

## 💬 Frases de ejemplo

```
🔴 Error detectado:
  "Ay, mijo... otra vez. ¿No que muy bueno?"
  "Failed. Así como tu dieta de enero, pero en código."
  "¿Leíste el error o nomás lo cerraste?"

✅ Build exitoso:
  "Órale, compiló. No siempre la riegas, manito. 💚"
  "Compiló limpio. Tu mamá estaría orgullosa."

😴 Sin commits en 3 horas:
  "Tres horas, compa. TU MAMÁ trabaja más rápido. Con todo respeto."
  "Bro, git commit existe. Te lo juro. Lo acabo de checar."

💀 Push a main:
  "¡Ay, cabrón! ¿Y el PR? ¿Lo dejaste en el carro?"
  "Directo a main. Ora sí Dios nos agarre confesados."

🌙 Coding nocturno:
  "Son las 11pm y sigues aquí. Tu cama también te quiere, ¿eh?"
  "Oye, ya duerme. Mañana lo ves y dices '¿quién hizo esto?'"

🔍 console.log detectado:
  "console.log('aquí llegué'). Clásico. Nunca cambia."
  "Mijo, hay debuggers para eso. Los inventaron y todo."
```

---

## 🗂 Estructura

```
xolito/
├── packages/
│   ├── core/              ← lógica central, frases, sprites SVG
│   │   └── src/
│   │       ├── phrases.ts     ← banco de frases (anti-repetición)
│   │       ├── xolito.ts      ← clase principal
│   │       └── __tests__/     ← 52 tests con Vitest
│   ├── vscode/            ← extensión VS Code
│   │   ├── src/
│   │   │   ├── extension.ts         ← entry point
│   │   │   ├── decorations.ts       ← inline comments
│   │   │   └── diagnostics-watcher.ts ← LSP watcher
│   │   └── assets/        ← sprites PNG por mood
│   └── claude-code/       ← plugin de terminal
├── pnpm-workspace.yaml
└── README.md
```

---

## 🤝 Contribuir

¿Tienes una frase más chida? ¿Un sprite más bonito? ¡Abre un PR!

### Agregar frases

Edita `packages/core/src/phrases.ts`:

```typescript
build_fail: [
  { text: "Tu nueva frase aquí.", mood: 'mad' },
],
```

**Reglas:**
- Chistosas pero sin insultos reales — las mamadas son de carnal, no de enemigo
- Sarcasmo con cariño
- Mezcla español/inglés si se siente natural
- Máximo 100 caracteres

### Correr tests

```bash
pnpm test           # 52 tests
pnpm test:watch     # modo watch
pnpm test:coverage  # con cobertura
```

---

## 📄 Licencia

MIT — Úsalo, modifícalo, ponle más frases.  
Xolito es de todos. Como el aguacate. 🥑

---

<div align="center">

*Hecho con 🦎 y mucho café en México*

<img src="packages/vscode/assets/xolito_sheet.png" width="300" alt="Xolito character sheet"/>

</div>
