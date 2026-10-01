# FRF-98 — Guion del Reel / TikTok (9:16)

Documento de producción para el reel que documenta la construcción del portafolio
**FRF-98** — un escritorio estilo Windows 98 con identidad terminal/Matrix (verde `#00ff41`)
de Federico Rodriguez Franco.

- **Formato:** vertical 9:16 (1080×1920)
- **Duración objetivo:** 45–55 s (máx. 60 s)
- **FPS:** 30
- **Edición:** DaVinci Resolve
- **Arco:** inspiración → escritorio → demos → carpeta audiovisual → reveal con música propia

---

## 1. Estructura y arco

| Bloque | Tiempo | Qué cuenta |
|---|---|---|
| Gancho | 0–3 s | Impacto + cursor |
| Inspiración | 3–8 s | archivoseladio.com |
| Login / Gate | 8–13 s | entrada tipo terminal |
| Escritorio | 13–22 s | reveal del desktop Win98 + Matrix |
| Demos | 22–34 s | proyectos con demos en vivo |
| Audiovisual | 34–40 s | carpeta audiovisual |
| Reveal música | 40–48 s | reproductor con música propia |
| Cierre / CTA | 48–53 s | marca + link en bio |

---

## 2. Guion shot-by-shot

### Shot 1 — Gancho (0–3 s)
- **Duración:** 3 s
- **Qué se ve:** Lluvia de caracteres Matrix verde en primer plano; el cursor del mouse entra y hace doble clic en un icono. Corte a negro por 2 frames.
- **Texto superpuesto:** «Recreé Windows 98 como mi portafolio.»
- **Sonido/efecto:** SFX de arranque Win98 + clic de mouse + riser breve (0.5 s).
- **Transición:** Glitch/CRT a negro → zoom al siguiente plano.

### Shot 2 — Inspiración (3–8 s)
- **Duración:** 5 s
- **Qué se ve:** Captura del sitio de inspiración **archivoseladio.com** (desktop retro). Zoom lento al logo/título y a una ventana típica.
- **Texto superpuesto:** «Todo empezó con una inspiración» → «archivoseladio.com».
- **Sonido/efecto:** Música base entra (lo-fi / synth, tempo ~100 BPM). SFX de «abrir ventana».
- **Transición:** Wipe de píxeles (efecto «pixel sort») hacia la izquierda.

### Shot 3 — Login / Gate (8–13 s)
- **Duración:** 5 s
- **Qué se ve:** Diálogo de acceso de **FRF-98**: barra de título verde oscuro «Acceder a FRF-98», badge «FR», campo de correo. Se escribe un correo y se pulsa «Entrar». Barra de progreso «Cargando sistema…».
- **Texto superpuesto:** «Le puse un login tipo terminal.»
- **Sonido/efecto:** Teclado (typing) + beep de boot + «ding» al entrar.
- **Transición:** Flash verde #00ff41 → disolución al escritorio.

### Shot 4 — Escritorio (13–22 s)
- **Duración:** 9 s
- **Qué se ve:** Desktop completo: Matrix Rain de fondo, iconos (📄 Sobre mí, 📁 Proyectos, 🎬 Audiovisual, 🎵 Reproductor, ✉️ Contacto), taskbar con «Inicio» y reloj. Se abre el menú Inicio con banner «FRF-98». Se arrastra una ventana (draggable) y se minimiza.
- **Texto superpuesto:** «Un escritorio Win98 con alma Matrix.»
- **Sonido/efecto:** Chime de Windows al abrir Inicio + clic de arrastre. Música base sigue.
- **Transición:** Corte directo sincronizado al beat.

### Shot 5 — Sobre mí / info.txt (22–25 s)
- **Duración:** 3 s
- **Qué se ve:** Doble clic en «info.txt — Sobre mí». Ventana con intro y grid de tech chips (Python, Linux, Docker, .NET, OpenCV…).
- **Texto superpuesto:** «Y mi info como un .txt.»
- **Sonido/efecto:** Doble clic + pop de apertura de ventana.
- **Transición:** Corte seco.

### Shot 6 — Proyectos y demos (25–34 s)
- **Duración:** 9 s
- **Qué se ve:** Abre «Mis Proyectos». Scroll vertical por las cards: **Kaizen Fit Club**, **Elijah**, **VuenAI**, **LÜM**, **mentesuniversales.com**. Hace clic en «Probar demo ↗» y la demo se abre (iframe) — mostrar 2–3 demos en vivo.
- **Texto superpuesto:** «Mis proyectos, con demos en vivo.»
- **Sonido/efecto:** Scroll + clics; la música sube levemente de energía (capa de percusión).
- **Transición:** Corte al ritmo entre cada demo (hard cut).

### Shot 7 — Carpeta Audiovisual (34–40 s)
- **Duración:** 6 s
- **Qué se ve:** Doble clic en «Audiovisual». Se muestran las cuatro carpetas: 📷 Fotos, 🎬 Videos, 🎚️ Mezclas, 🎵 Música.
- **Texto superpuesto:** «Y una carpeta audiovisual.»
- **Sonido/efecto:** SFX de carpeta + riser que prepara el drop.
- **Transición:** Zoom rápido hacia la carpeta 🎵.

### Shot 8 — Reveal música propia (40–48 s)
- **Duración:** 8 s
- **Qué se ve:** Abre «Reproductor». El arte 💿 gira, la pista cambia de «Sin pista» a un track propio, se pulsa ▶ y suena la mezcla/música del autor. La Matrix Rain se intensifica (más contraste) al ritmo del drop.
- **Texto superpuesto:** «Con mi propia música.» (o «Música y mezclas propias.»)
- **Sonido/efecto:** **La música propia del autor** reemplaza la base (drop). Sidechain/ducking sobre los SFX.
- **Transición:** Flash de color + corte a negro sincronizado con el beat.

### Shot 9 — Cierre / CTA (48–53 s)
- **Duración:** 5 s
- **Qué se ve:** Menú Inicio → «Apagar…» → pantalla negra con «Ya es seguro apagar el equipo.» Luego aparece el logo/badge «FRF-98» centrado.
- **Texto superpuesto:** «FRF-98» + «link en bio ↗».
- **Sonido/efecto:** SFX de apagado de Windows + fundido musical (tail).
- **Transición:** Fade out final.

---

## 3. Capturas exactas a tomar

Método: el proyecto corre local con `npm run dev` (http://localhost:3000). Reusar la skill
`portfolio-shots` (Chromium headless) para capturar en viewport **1080×1920** (vertical) o
capturar en horizontal y reencuadrar en Resolve. Para las demos externas, capturar la URL real.

| # | Captura | Qué mostrar / origen | Uso |
|---|---|---|---|
| 1 | `gate.png` | Diálogo de acceso FRF-98 (campo correo + progreso) | Shot 3 |
| 2 | `desktop.png` | Escritorio completo: Matrix Rain + 5 iconos + taskbar | Shot 4 |
| 3 | `start-menu.png` | Menú Inicio abierto (banner FRF-98 + Apagar…) | Shots 4, 9 |
| 4 | `about.png` | Ventana info.txt con grid de tech chips | Shot 5 |
| 5 | `projects.png` | Ventana Mis Proyectos con cards visibles | Shot 6 |
| 6 | `demo-elijah.png` | https://elijahluxuryride.com/ (demo en vivo) | Shot 6 |
| 7 | `demo-vuenai.png` | https://app.vuen.ai/ (demo en vivo) | Shot 6 |
| 8 | `demo-mentesuniversales.png` | https://mentesuniversales.com/ | Shot 6 |
| 9 | `media.png` | Ventana Audiovisual (4 carpetas: Fotos/Videos/Mezclas/Música) | Shot 7 |
| 10 | `player.png` | Ventana Reproductor 💿 con track propio en ▶ | Shot 8 |
| 11 | `shutdown.png` | Pantalla negra «Ya es seguro apagar el equipo.» | Shot 9 |
| 12 | `inspiracion.png` | archivoseladio.com (desktop retro de referencia) | Shot 2 |

> **Nota:** las capturas 10 y 12 dependen de contenido aún no cargado
> (`data/media.json` está vacío y el reproductor muestra «Sin pista»). Capturar
> cuando `app-media` haya poblado mezclas/música; mientras tanto usar un mock visual
> para el storyboard del reel.

---

## 4. Notas de edición — DaVinci Resolve

- **Timeline:** 1080×1920, 30 fps, color space Rec.709. Proxies si las capturas pesan.
- **Ritmo:** cortar sobre el beat de la música base (~100 BPM). Hard cuts en el bloque de demos; glitch/pixel-sort en inspiración y reveal.
- **Color:** unificar con un LUT frío-verde; acentuar `#00ff41` (Matrix) y mantener neutros los grises del chrome Win98. Subir contraste en el drop (Shot 8).
- **Overlay:** capa sutil de scanlines/CRT (opacidad 6–10 %) en todo el reel para el look retro-terminal.
- **Texto:** fuente **VT323** o **Share Tech Mono** (mismas del sitio), blanco `#c8ffd4` con sombra dura negra; máximo 4–5 palabras por overlay, centrado o tercio inferior.
- **Audio:** base lo-fi en -14 LUFS; ducking (-6 dB) sobre la voz en off si la hay. En el Shot 8 reemplazar la base por la música propia del autor con fade de 0.5 s.
- **SFX:** arranque Win98, clic doble, beep de boot, chime de ventana, apagado — sincronizados a cada acción en pantalla.
- **Export:** H.264, 1080×1920, 30 fps, audio AAC 320 kbps, bitrate 10–12 Mbps. Versión con y sin subtítulos quemados.
