# 🌍 ¡La Geósfera! — Capas de la Tierra

Aplicación web educativa e interactiva para alumnos de nivel primario (4º–5º grado).
Los estudiantes repasan conceptos de ciencias naturales —el tiempo, los subsistemas
terrestres, las capas de la geósfera, las placas tectónicas y los fenómenos
sísmicos y volcánicos— y después **construyen su propia maqueta 3D** de las capas
de la Tierra, la exploran y la guardan.

Funciona **100 % en el navegador, sin servidor ni base de datos**: se puede abrir
`index.html` directamente en Google Chrome (ideal para Chromebooks escolares) o
publicarla como sitio estático (por ejemplo con GitHub Pages).

---

## 📸 Capturas

| Bienvenida | Menú principal | Repaso |
|---|---|---|
| ![Pantalla de inicio](docs/capturas/01-inicio.png) | ![Menú principal](docs/capturas/02-menu.png) | ![Modo repaso](docs/capturas/03-repaso.png) |

| Construcción 3D | Modo Explorar |
|---|---|
| ![Taller de construcción](docs/capturas/04-construccion.png) | ![Modo explorar](docs/capturas/05-explorar.png) |

---

## ✨ Qué incluye

- **Modo Repaso**: siete temas con animaciones e interacciones (el tiempo,
  subsistemas terrestres, capas de la geósfera, placas tectónicas, fenómenos
  geológicos, seguridad ante sismos y un quiz de Verdadero/Falso con devolución).
- **Modo Construir**: escena 3D (Three.js) donde el alumno agrega formas
  geométricas, las mueve, escala, rota, colorea, texturiza, etiqueta, copia,
  corta y borra — con deshacer/rehacer e historial.
- **Modo Explorar**: recorrido libre de la maqueta terminada; al tocar una
  pieza etiquetada aparece su definición. Incluye pantalla completa.
- **Guardado**: en el navegador (localStorage, con autoguardado), como imagen
  PNG de 4 vistas, como archivo `.json` descargable/reabrible, o enviado a una
  carpeta de Google Drive mediante Google Apps Script (opcional).
- **Ver maquetas**: galería de las maquetas guardadas en esa computadora.
- Interfaz pensada para 9–11 años: botones grandes, textos cortos, sin
  publicidad ni enlaces externos, compatible con mouse y pantalla táctil.

---

## 📁 Estructura del repositorio

```
.
├── index.html          # Estructura de las 5 pantallas de la app
├── styles.css           # Estilos (colores y medidas editables en :root)
├── script.js             # Toda la lógica: navegación, repaso, 3D, guardado
├── codigo.gs              # Google Apps Script opcional para guardar en Drive
├── three.min.js            # Copia local de Three.js r128 (respaldo sin internet)
├── docs/
│   └── capturas/               # Imágenes usadas en este README
├── .github/
│   └── workflows/
│       └── deploy-pages.yml    # Publica el sitio en GitHub Pages automáticamente
├── .gitignore
├── LICENSE
└── README.md
```

---

## ▶️ Uso local (sin instalar nada)

1. Descargá o cloná este repositorio.
2. Abrí `index.html` con doble clic en Google Chrome.
3. Listo — no hace falta internet, servidor ni instalación.

> Three.js se intenta cargar primero desde un CDN; si no hay conexión, la
> aplicación usa automáticamente la copia local `three.min.js` incluida en el
> repositorio.

## 🌐 Publicar con GitHub Pages

Este repositorio ya incluye un flujo de GitHub Actions (`.github/workflows/deploy-pages.yml`)
que publica el sitio solo. Para activarlo:

1. Subí este repositorio a GitHub (ver sección siguiente).
2. Entrá a **Settings → Pages**.
3. En **Source**, elegí **GitHub Actions**.
4. Hacé un push a la rama `main`: la acción compila y publica el sitio.
5. La URL pública va a aparecer en **Settings → Pages** (algo como
   `https://tu-usuario.github.io/tu-repositorio/`).

## ⬆️ Subir este proyecto a GitHub por primera vez

```bash
git init
git add .
git commit -m "Primera versión: La Geósfera"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

---

## ☁️ Conectar el guardado con Google Drive (opcional)

Por defecto, “Guardar” funciona sin Drive (computadora, imagen o `.json`).
Para que el botón **“Enviar a la carpeta de Drive”** también funcione:

1. Entrá a [script.google.com](https://script.google.com) y creá un proyecto nuevo.
2. Pegá el contenido de [`codigo.gs`](codigo.gs) en `Código.gs`.
3. (Opcional) Cambiá `NOMBRE_CARPETA`, `ID_CARPETA` o `CLAVE` al principio del archivo.
4. **Implementar → Nueva implementación → Tipo: Aplicación web**
   - Ejecutar como: **yo** (tu cuenta)
   - Quién tiene acceso: **cualquier persona**
5. Copiá la URL que termina en `/exec`.
6. En `script.js`, dentro de `CONFIG`, completá:
   ```js
   URL_APPS_SCRIPT: 'https://script.google.com/macros/s/AKfycb.../exec',
   CLAVE_DOCENTE: '',   // opcional, debe coincidir con CLAVE en codigo.gs
   ```
7. Guardá y volvé a publicar/abrir la app.

---

## 🎨 Personalización para docentes

Todo lo editable está agrupado y comentado en español:

- **Colores generales**: sección `:root` al principio de `styles.css`.
- **Textos, preguntas del quiz, formas disponibles, paleta de colores,
  etiquetas sugeridas, definiciones del modo Explorar**: objeto `CONFIG`
  al principio de `script.js`.
- **Textos del modo Repaso** (el tiempo, subsistemas, capas, placas,
  fenómenos, sismos): directamente en `index.html`, dentro de
  `<section id="pantalla-repaso">`.

No se necesita saber programar para cambiar textos o colores: alcanza con
editar esos valores entre comillas.

---

## 💻 Compatibilidad

- Navegador: Google Chrome (recomendado) y otros navegadores modernos con WebGL.
- Dispositivos: computadoras, Chromebooks, tablets y celulares (interfaz responsiva).
- Entrada: mouse, teclado y pantalla táctil (multitouch para acercar/alejar).
- Sin backend, sin base de datos, sin conexión obligatoria.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE): podés usarlo,
copiarlo y adaptarlo libremente, citando la fuente.

Incluye una copia local de **[Three.js](https://threejs.org/)** (r128),
distribuido bajo licencia MIT por sus autores.
