<div align="center">

# 🦎 Xolito Monorepo

<img src="packages/vscode/assets/xolito_idle.png" width="120" alt="Xolito idle"/>

> *"Aquí estoy, cuidándote... y juzgándote con cariño."*

**Tu mascota virtual de ajolote regañón, sarcástico y 100% mexicano.**  
Este repositorio unificado contiene la extensión para VS Code, la aplicación móvil para Android y la página web comunitaria.

[![Hecho en México](https://img.shields.io/badge/Hecho%20en-México%20🇲🇽-green)](#)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](#)
[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/xolito.xolito-vscode?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com)
[![Licencia](https://img.shields.io/badge/license-Dual%20License-orange)](#)

</div>

---

## 📂 Estructura del Monorepo

Este es un proyecto multipaquete gestionado con `pnpm`:

```
xolito/
├── packages/
│   ├── core/              ← Lógica común, sprites SVG y base de frases
│   ├── vscode/            ← Extensión para VS Code (LSP watcher, logros, exorcismo)
│   └── android/           ← Aplicación Android (Kotlin, Jetpack Compose, Gemini IA, Widget)
├── importar/              ← Plataforma web para previsualizar e importar skins/moods
└── README.md
```

---

## 💻 1. Extensión para VS Code (`packages/vscode`)

Xolito vive en tu editor, vigila tus advertencias LSP y compila tus archivos, reaccionando con animaciones y frases de humor mexicano:

- 🧪 **Pruebas de Escritorio (Dry Run)**: Simula paso a paso la ejecución y rastro de variables de tus funciones en un panel lateral con IA de Gemini.
- 📊 **Auditoría de Código Híbrida & Refactor 1-Clic**: Evalúa la calidad de tu código (Semántica, Robustez, Modularidad, Documentación) con score/10 y aplica refactorizaciones con un solo clic.
- 🧠 **Traductor de Barrio**: Traduce los aburridos errores técnicos del compilador a modismos mexicanos divertidos en el hover del código.
- 🔴 **Linter de Chambazos**: Detecta variables y funciones con nombres Spanglish mezclados (ej. `fetchUsuarios()`, `get_datos()`) y te invita a elegir un solo idioma.
- 💀 **Sistema de Corrupción**: Cuantos más errores y compilaciones fallidas acumules, más se corrompe tu entorno. En niveles extremos (80%+), Xolito se vuelve "Poseído" (efecto glitch de temblor en pantalla).
- 🔮 **Exorcismo**: Un ritual animado completo con copal digital y agua bendita para limpiar el estado de corrupción del repositorio.
- 🏆 **Sistema de Logros**: Medallas desbloqueables basadas en tus hábitos de desarrollo reales (ej. "Viernes de Peligro" por compilar después de las 3:00 PM los viernes).
- 💼 **Modo Patrón** (`Shift + Esc`): Camufla tu editor abriendo un archivo de código C++ denso empresarial si ves acercarse a tu jefe.

### Instalación de la Extensión
Busca **Xolito** en la barra de extensiones de VS Code o instálalo por terminal:
```bash
ext install xolito.xolito-vscode
```

---

## 📱 2. Aplicación Móvil Android (`packages/android`)

La aplicación oficial de Xolito que reacciona a tus notificaciones reales de WhatsApp y WhatsApp Business utilizando inteligencia artificial de **Gemini** (a través de OpenRouter) u offline:

- 💬 **Burbuja Flotante Contextual (Overlay)**: Muestra el mensaje recibido del remitente y la sugerencia de respuesta sarcástica de Xolito en una burbuja de baja latencia con tipografía temática según tu aspecto activo.
- 🎭 **Creador de Personalidades (Moods)**: Define respuestas offline para roles predeterminados (Papá, Mamá, Tóxic@, Cobrador, Jefe, Ex, Amigo).
- 📊 **Dashboard de Sarcasmo & Sarcasmo Wrapped**: Visualiza gráficos de barras de toxicidad acumulados e imprime un reporte completo en vertical (9:16) con márgenes protectores diseñado para tus estados de WhatsApp o Stories.
- 🧩 **Widget Interactivo de Pantalla de Inicio**: Un widget en tu home que lee tu skin y muestra respuestas basadas en el rol del último mensaje de WhatsApp.
- 💎 **Regla PRO**: Permite crear/importar hasta 2 elementos personalizados en el plan gratuito; activa la suscripción PRO (o activa el botón **Bypass Dev** en depuración) para desbloquear personalizaciones ilimitadas.

---

## 🌐 3. Landing Page de Importación (`importar/`)

Una página web ligera y optimizada para servir de puente y previsualizador comunitario de las skins y personalidades compartidas:

- 🎨 **Renderizado Dinámico de Pixel Art**: Lee la query param de 256 caracteres de la URL y la dibuja sobre un `<canvas>` HTML5 escalado a 12x con la paleta oficial.
- 🎭 **Previsualizador de Moods**: Carga el emoji e imprime la lista de frases custom de forma ordenada en tarjetas animadas.
- 🚀 **Deep Linking Directo**: Un botón "Importar en Xolito App" que invoca el esquema URI `xolito://importar?...` para abrir directamente la app instalada en Android y disparar el popup de confirmación.
- 💸 **Monetización con Google AdSense**: Contenedor e instrucciones CSS/HTML listas para insertar tu script de anuncios automáticos y monetizar cada visita.
- ⏳ **Temporizador de Redirección Inteligente**: Hace una cuenta atrás de 6 segundos antes de enviar al usuario a Google Play, ofreciendo la opción de "Pausar" para permitirle revisar la skin.

---

## 🚀 Despliegue Gratuito de la Landing Page

Para que tus usuarios puedan visualizar e importar skins/moods compartidos, debes subir la carpeta `/importar` a internet. Te recomendamos usar **GitHub Pages**:

1. Sube tu monorepo a tu perfil de GitHub.
2. Ve a la pestaña **Settings** (Ajustes) de tu repositorio.
3. En el menú lateral izquierdo, haz clic en **Pages**.
4. En la sección *Build and deployment*, selecciona la rama principal (`main` o `master`) y la carpeta raíz.
5. Guarda los cambios. GitHub te proporcionará una URL gratuita (ej. `https://tu-usuario.github.io/xolito2/importar/index.html`).
6. Abre `packages/android/app/src/main/java/com/jonatanjhl/xolito/MainActivity.kt` y cambia el valor de la constante `BASE_SHARE_URL` por tu dirección de GitHub Pages:
   ```kotlin
   const val BASE_SHARE_URL = "https://tu-usuario.github.io/xolito2/importar"
   ```
7. ¡Compila de nuevo tu app de Android y listo!

---

## 🛠️ Guía de Desarrollo Local

Si deseas compilar el código fuente del monorepo en tu entorno de desarrollo:

### Requisitos Previos
* Node.js v18+ y `pnpm` (`npm install -g pnpm`)
* Java JDK 17+ (para el subproyecto Android)
* Android SDK y Gradle (integrados por Android Studio)

### Instalación de Dependencias
```bash
pnpm install
```

### Compilar Extensión de VS Code
```bash
cd packages/core && pnpm exec tsc
cd ../vscode && node build.mjs
# Abre packages/vscode en VS Code y presiona F5 para depurar
```

### Compilar y Validar Aplicación de Android
```bash
cd packages/android
./gradlew compileDebugKotlin    # Compilación de Kotlin
./gradlew test                  # Ejecutar suite de pruebas de Mockito
./gradlew assembleDebug         # Generar APK de depuración
```

---

## 📄 Licencia

Licencia Dual — uso personal educativo libre. El uso comercial o de distribución monetizada en tiendas públicas requiere una licencia autorizada por el autor.

📩 jonatanhidalgoledesma@gmail.com

<div align="center">
  <img src="packages/vscode/assets/xolito_sheet.png" width="350" alt="Xolito character sheet"/>
  <br>
  <em>Hecho con 🦎, ☕ y mucho sarcasmo en México</em>
</div>
