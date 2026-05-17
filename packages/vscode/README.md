<div align="center">

# 🦎 Xolito

<img src="packages/vscode/assets/xolito_idle.png" width="120" alt="Xolito idle"/>

> *"Aquí estoy, cuidándote... y juzgándote con cariño."*

**Tu ajolote regañón para VS Code.**  
Regañón. Tierno. Sarcástico. 100% mexicano. 0% filtro.

![CI](https://github.com/JonatanJHL/pet_mexican/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-pink)
![Made in Mexico](https://img.shields.io/badge/Hecho%20en-México%20🇲🇽-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![Version](https://img.shields.io/visual-studio-marketplace/v/xolito.xolito-vscode?label=Marketplace)

</div>

---

## ¿Qué es Xolito?

Xolito es una mascota virtual inspirada en el **ajolote mexicano** — la especie endémica de México que nunca termina de madurar. Igual que nuestro código.

Vive en tu VS Code, detecta errores LSP en tiempo real y te regaña con cariño en español mexicano.

---

## 🎭 Moods

<div align="center">

| | | | | | |
|:---:|:---:|:---:|:---:|:---:|:---:|
| <img src="packages/vscode/assets/xolito_idle.png" width="72"/><br>**idle** | <img src="packages/vscode/assets/xolito_happy.png" width="72"/><br>**happy** | <img src="packages/vscode/assets/xolito_mad.png" width="72"/><br>**mad** | <img src="packages/vscode/assets/xolito_sassy.png" width="72"/><br>**sassy** | <img src="packages/vscode/assets/xolito_worried.png" width="72"/><br>**worried** | <img src="packages/vscode/assets/xolito_panic.png" width="72"/><br>**panic** |

</div>

---

## ✨ Features

- 🔴 **Detecta errores LSP en tiempo real** — TypeScript, PHP, Python, Go, Rust, C#, Java
- 💬 **Comentarios inline con rotación** — frases distintas por tipo de error, sin repetirse
- 🧠 **Memoria entre archivos** — recuerda si en el archivo anterior también la regaste
- 🎨 **11 sprites por mood** — incluyendo `panic` con corbata para el jefe
- 📊 **Panel con stats de sesión** — errores, warnings, builds, archivos, tiempo y nivel de estrés
- 💼 **Modo Patrón** (`Shift+Esc`) — camufla tu pantalla cuando llega el jefe
- 🌶️ **Linter de Chambazos** — detecta spanglish en nombres (`fetchUsuarios`, `get_datos`)
- 📈 **Sistema de estrés** — 5+ errores seguidos escalan el sarcasmo automáticamente
- 🕐 **Contexto dinámico** — viernes 4pm y fines de semana activan frases de descanso
- 🌙 **Eventos especiales** — coding nocturno, push a main, force push, merge conflicts
- 🔇 **Toggle silencio** — se calla cuando lo necesitas
- 🇲🇽 **100% mexicano** — frases en español con spanglish natural

---

## 💼 Modo Patrón — `Shift+Esc`

Presiona `Shift+Esc` cuando se acerque el jefe:

```
Antes:  🦎 Compiló limpio. Tu mamá estaría orgullosa.
Después: 💼 [PROD] cluster_matrix_balancer.cpp
```

- Se abre un archivo C++ con templates, mutex y operaciones atómicas
- Xolito se pone serio con corbata y fondo verde consola
- Al presionar `Shift+Esc` de nuevo: cierra el dummy y regresa a donde estabas

---

## 📦 Instalación

### VS Code Marketplace

```
ext install xolito.xolito-vscode
```

### Desde código fuente

```bash
git clone https://github.com/JonatanJHL/pet_mexican.git xolito
cd xolito
pnpm install
cd packages/core && pnpm exec tsc
cd ../vscode && node build.mjs
# Presiona F5 en VS Code
```

---

## 💬 Frases de ejemplo

```
🔴 Error:
  "Ay, mijo... otra vez. ¿No que muy bueno?"
  "¿recuerdas que en el otro archivo también la regaste?"

✅ Build exitoso:
  "Compiló limpio. Tu mamá estaría orgullosa."

💼 Boss Mode activado:
  "¡Disimula, disimula! ¡Ponte a leer código denso!"

🌶️ Spanglish detectado:
  "fetchUsuarios. Mijo, consistencia. Elige un idioma."

😤 5+ errores seguidos:
  "El compilador te odia hoy. Respira."

🍺 Viernes 4pm:
  "Viernes 4pm. Cierra el IDE y agarra una chela."

💀 Push a main:
  "¡Ay, cabrón! ¿Y el PR? ¿Lo dejaste en el carro?"
```

---

## 🗂 Estructura

```
xolito/
├── packages/
│   ├── core/              ← lógica central, frases, sistema de estrés
│   │   └── src/
│   │       ├── phrases.ts         ← banco de frases por evento
│   │       ├── xolito.ts          ← clase principal
│   │       ├── types.ts           ← tipos y 11 moods
│   │       └── sprites/generator.ts ← generador SVG por mood
│   ├── vscode/            ← extensión VS Code
│   │   └── src/
│   │       ├── extension.ts       ← boss mode, linter, contexto dinámico
│   │       ├── decorations.ts     ← inline comments con rotación
│   │       └── diagnostics-watcher.ts
│   └── claude-code/       ← plugin de terminal (WIP)
└── README.md
```

---

## 🤝 Contribuir frases

Las frases viven en dos archivos:

- **`packages/core/src/phrases.ts`** — notificaciones y panel
- **`packages/vscode/src/decorations.ts`** — comentarios inline

```typescript
// Agregar frase en phrases.ts
build_fail: [
  { text: "Tu nueva frase aquí.", mood: 'mad' },
],
```

**Reglas:** máx 100 chars · sarcasmo con cariño · español mexicano o spanglish · mood correcto

```bash
pnpm test           # 52+ tests
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
