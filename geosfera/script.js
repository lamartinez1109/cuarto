/* =====================================================================
   ¡LA GEÓSFERA!  ·  script.js
   ---------------------------------------------------------------------
   Contenido de este archivo:
     1. Configuración (el docente puede editar textos, colores y formas)
     2. Utilidades y estado
     3. Navegación entre pantallas
     4. Modo Repaso (pestañas, animaciones interactivas y quiz)
     5. Escena 3D (Three.js): luces, suelo y cámara
     6. Objetos 3D: formas, texturas, etiquetas
     7. Selección y edición (mover, tamaño, girar, color…)
     8. Historial (deshacer / rehacer) y guardado automático
     9. Entrada con mouse y pantalla táctil
    10. Vistas, capturas e imágenes
    11. Guardar: computadora, archivo .json, Drive y galería
    12. Modos Explorar y "Mostrar mi maqueta"
    13. Diálogos, avisos y arranque
   ===================================================================== */
'use strict';


/* =====================================================================
   1. CONFIGURACIÓN  (editable por el docente)
   ===================================================================== */
const CONFIG = {
  // --- Google Drive (opcional). Ver README.md, paso "Conectar con Drive". ---
  URL_APPS_SCRIPT: '',   // Pegar acá la URL de la aplicación web (termina en /exec)
  CLAVE_DOCENTE: '',     // Opcional: la misma clave que se escribe en codigo.gs

  // --- Comportamiento de los controles ---
  PASO_MOVER: 0.25,      // cuánto se mueve un objeto en cada toque
  PASO_ROTAR: 15,        // grados por toque
  FACTOR_TAMANO: 1.12,   // cuánto crece o se achica en cada toque
  TAMANO_MIN: 0.15,
  TAMANO_MAX: 15,
  HISTORIAL_MAX: 60,

  // --- Colores del espacio 3D ---
  COLOR_FONDO_3D: 0xdff3ff,
  COLOR_SUELO: 0xcfe8c4,
  COLOR_RESALTE: 0xff7a00,

  // --- Claves para guardar en la computadora ---
  ALMACEN_MAQUETAS: 'geosfera.maquetas',
  ALMACEN_AUTO: 'geosfera.autoguardado',

  // --- Formas disponibles (alto = altura de la forma sin agrandar) ---
  FORMAS: [
    { id: 'esfera',   nombre: 'Esfera',   icono: '🔵', alto: 1,    color: '#4cc9f0' },
    { id: 'cubo',     nombre: 'Cubo',     icono: '🟦', alto: 1,    color: '#ffab2e' },
    { id: 'cilindro', nombre: 'Cilindro', icono: '🥫', alto: 1,    color: '#8d99ae' },
    { id: 'cono',     nombre: 'Cono',     icono: '🔺', alto: 1,    color: '#d62839' },
    { id: 'anillo',   nombre: 'Anillo',   icono: '🍩', alto: 0.3,  color: '#f27bb5' },
    { id: 'placa',    nombre: 'Placa',    icono: '▬',  alto: 0.25, color: '#a5763f' },
    { id: 'montana',  nombre: 'Montaña',  icono: '⛰',  alto: 1.2,  color: '#7b4a26' },
    { id: 'volcan',   nombre: 'Volcán',   icono: '🌋', alto: 1,    color: '#d94a2b' }
  ],

  // --- Colores de la paleta ---
  PALETA: [
    { nombre: 'Rojo',        valor: '#d62839' }, { nombre: 'Naranja',  valor: '#f4842a' },
    { nombre: 'Amarillo',    valor: '#ffd23f' }, { nombre: 'Verde',    valor: '#3bb273' },
    { nombre: 'Celeste',     valor: '#4cc9f0' }, { nombre: 'Azul',     valor: '#2f6fde' },
    { nombre: 'Violeta',     valor: '#8e5bd9' }, { nombre: 'Rosa',     valor: '#f27bb5' },
    { nombre: 'Marrón',      valor: '#7b4a26' }, { nombre: 'Gris',     valor: '#8d99ae' },
    { nombre: 'Blanco',      valor: '#ffffff' }, { nombre: 'Negro',    valor: '#2b2d42' },
    { nombre: 'Dorado',      valor: '#ffab2e' }, { nombre: 'Rojo magma', valor: '#d94a2b' }
  ],

  // --- Texturas sencillas (se dibujan por código, no hay imágenes externas) ---
  TEXTURAS: [
    { id: 'lisa',   nombre: 'Lisa',   icono: '⬜' },
    { id: 'roca',   nombre: 'Roca',   icono: '🪨' },
    { id: 'olas',   nombre: 'Agua',   icono: '🌊' },
    { id: 'lava',   nombre: 'Lava',   icono: '🔥' },
    { id: 'arena',  nombre: 'Arena',  icono: '🏖' },
    { id: 'pasto',  nombre: 'Pasto',  icono: '🌱' }
  ],

  // --- Etiquetas sugeridas ---
  ETIQUETAS_SUGERIDAS: ['Corteza', 'Manto', 'Núcleo externo', 'Núcleo interno', 'Litósfera', 'Astenósfera', 'Atmósfera', 'Hidrósfera', 'Biósfera', 'Volcán'],

  // --- Textos que aparecen al tocar una pieza en el modo Explorar.
  //     Las claves van en minúscula y sin tildes. ---
  DEFINICIONES: {
    'corteza': 'Es la capa más externa y delgada. Está formada por rocas sólidas: granito y basalto.',
    'manto': 'Es la capa intermedia y más gruesa. Tiene rocas fundidas que forman el magma.',
    'manto superior': 'Parte del manto. Arriba forma la litósfera y debajo está la astenósfera, viscosa como la miel.',
    'manto inferior': 'Es la mesósfera: la parte más interna del manto. Es más rígida que la astenósfera.',
    'nucleo externo': 'Está formado por metales como hierro y níquel. Es fluido y su movimiento genera el magnetismo terrestre.',
    'nucleo interno': 'Es rígido y soporta la mayor presión y temperatura: ¡llega a 6.000 °C!',
    'nucleo': 'Es la capa más interna. Está formada por metales, entre ellos hierro y níquel.',
    'litosfera': 'Es una capa rígida: incluye la corteza y la parte más externa del manto. Está dividida en placas tectónicas.',
    'astenosfera': 'Es la parte del manto con consistencia viscosa como la miel. Sobre ella se mueven las placas.',
    'atmosfera': 'Es la capa de gases que rodea al planeta. En la tropósfera ocurren los fenómenos del tiempo.',
    'hidrosfera': 'Es toda el agua de la Tierra, sólida, líquida o gaseosa. Ocupa cerca del 70 % del planeta.',
    'biosfera': 'Es el conjunto de todos los seres vivos que habitan el planeta.',
    'volcan': 'Es un cono formado por lava y rocas que salen por un cráter. Suele estar en márgenes convergentes.'
  },

  // --- Ejemplo "Tierra por capas" (diámetros relativos, del más grande al más chico) ---
  EJEMPLO_TIERRA: [
    { etiqueta: 'Corteza',        color: '#7b4a26', textura: 'roca', diametro: 3.5, dy: 0.95 },
    { etiqueta: 'Manto',          color: '#f26a2e', textura: 'lava', diametro: 3.3, dy: 0.45 },
    { etiqueta: 'Núcleo externo', color: '#ffab2e', textura: 'lisa', diametro: 1.8, dy: 0.1 },
    { etiqueta: 'Núcleo interno', color: '#ffe066', textura: 'lisa', diametro: 1.0, dy: 0 }
  ],

  // --- Preguntas del quiz de repaso (Verdadero / Falso) ---
  PREGUNTAS: [
    { texto: 'El agua ocupa aproximadamente el 70 % de la superficie del planeta.', valor: true,
      explica: 'Por eso, desde el espacio, la Tierra se ve de color azul.' },
    { texto: 'La capa de ozono filtra una parte de los rayos ultravioleta del Sol.', valor: true,
      explica: 'El ozono es una capa de la atmósfera.' },
    { texto: 'El magma que sale de los volcanes forma parte del manto.', valor: true,
      explica: 'Cuando el magma sale a la superficie se llama lava.' },
    { texto: 'La litósfera es una capa fluida, parecida a la miel.', valor: false,
      explica: 'La que se parece a la miel es la astenósfera. La litósfera es rígida y está dividida en placas.' },
    { texto: 'Los metales del núcleo pueden ser líquidos o sólidos.', valor: true,
      explica: 'El núcleo externo es líquido y el núcleo interno es sólido.' },
    { texto: 'La corteza es la capa más gruesa de la Tierra.', valor: false,
      explica: 'La corteza es la capa más externa y delgada. La más gruesa es el manto.' },
    { texto: 'Los terremotos se generan por el roce de las placas tectónicas.', valor: true,
      explica: 'Al rozarse, las placas acumulan energía y la liberan de golpe.' },
    { texto: 'Un maremoto es un terremoto cuyo epicentro está en el fondo del océano.', valor: true,
      explica: 'Puede transformarse en una ola gigante llamada tsunami.' },
    { texto: 'La Argentina está sobre la placa Sudamericana.', valor: true,
      explica: 'En el oeste, la placa de Nazca se hunde bajo la Sudamericana y así se formó la cordillera de los Andes.' },
    { texto: 'El pozo más profundo que hizo el ser humano llega hasta el núcleo de la Tierra.', valor: false,
      explica: 'Llega a 12,3 km. El centro de la Tierra está a unos 6.371 km.' }
  ]
};


/* =====================================================================
   2. UTILIDADES Y ESTADO
   ===================================================================== */
const $  = (selector, contexto = document) => contexto.querySelector(selector);
const $$ = (selector, contexto = document) => Array.from(contexto.querySelectorAll(selector));
const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
const redondear = (n) => Math.round(n * 10000) / 10000;

/** Pasa a minúscula y quita tildes (para buscar definiciones). */
function normalizar(texto) {
  return String(texto).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/** Convierte un nombre en algo seguro para un nombre de archivo. */
function nombreArchivo(texto) {
  return normalizar(texto || 'maqueta').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'maqueta';
}

const estado = {
  pantalla: 'inicio',
  modo: 'construir',       // construir | explorar
  vista: 'libre',          // libre | arriba | frontal | lateral
  objetos: [],             // piezas de la maqueta
  seleccion: [],           // ids de las piezas elegidas
  multiple: false,         // modo "elegir varios"
  siguienteId: 1,
  historial: [],           // fotos (JSON) de la maqueta para deshacer/rehacer
  indice: -1,
  nombre: 'Mi maqueta',
  alumno: '',
  proyectoId: null,        // id si viene de "Mis maquetas"
  autoGirar: false,
  autoguardadoLeido: false
};

// Objetos de Three.js (se crean recién al entrar al taller)
let renderer = null, escena3d = null, camara = null, grupoEtiquetas = null;
let ayudas = [];                                  // recuadros de selección
const cam = { theta: 0.7, phi: 1.05, radio: 12, objetivo: null };
let camDestino = null;                            // hacia dónde se anima la cámara
const texturasCache = {};
const raycaster = { obj: null };


/* =====================================================================
   3. NAVEGACIÓN ENTRE PANTALLAS
   ===================================================================== */

/** Muestra una pantalla: inicio, menu, repaso, taller o maquetas. */
function irA(nombre) {
  $$('.pantalla').forEach((p) => p.classList.toggle('activa', p.id === 'pantalla-' + nombre));
  estado.pantalla = nombre;
  const titulo = $('#pantalla-' + nombre + ' [tabindex="-1"]');
  if (titulo) titulo.focus({ preventScroll: true });
  if (nombre === 'taller') setTimeout(redimensionar, 30);
  if (nombre === 'maquetas') dibujarGaleria();
}

/** Destinos de los botones data-ir="…". */
function navegar(destino) {
  if (destino === 'construir') entrarTaller('construir');
  else {
    if (estado.pantalla === 'taller') salirDelTaller();
    irA(destino);
  }
}

function salirDelTaller() {
  estado.autoGirar = false;
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
}

function iniciarNavegacion() {
  $('#btn-comenzar').addEventListener('click', () => irA('menu'));
  $$('[data-ir]').forEach((b) => b.addEventListener('click', () => navegar(b.dataset.ir)));
  $('#btn-volver-menu').addEventListener('click', () => navegar('menu'));
}


/* =====================================================================
   4. MODO 1 · REPASO
   ===================================================================== */
function iniciarRepaso() {
  $$('.pestana-repaso').forEach((b) => b.addEventListener('click', () => mostrarTema(b.dataset.tema)));

  // El tiempo: cambia el paisaje y los textos
  $$('.btn-tiempo').forEach((b) => b.addEventListener('click', () => {
    $('#escena-tiempo').dataset.t = b.dataset.tiempo;
    $('#texto-tiempo').textContent = b.dataset.desc;
    $('#texto-ropa').textContent = b.dataset.ropa;
    $$('.btn-tiempo').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
  }));

  // Subsistemas: resalta la parte del paisaje
  $$('.tarjeta-sub').forEach((t) => t.addEventListener('click', () => {
    const paisaje = $('#paisaje');
    const activa = paisaje.dataset.resalta === t.dataset.sub;
    paisaje.dataset.resalta = activa ? '' : t.dataset.sub;
    $$('.tarjeta-sub').forEach((o) => o.setAttribute('aria-pressed', String(!activa && o === t)));
  }));

  // Capas: al tocar una capa (dibujo o botón) se muestra su información
  $$('.capa, .btn-capa').forEach((el) => {
    el.addEventListener('click', () => elegirCapa(el.dataset.capa));
    if (el.classList.contains('capa')) {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegirCapa(el.dataset.capa); } });
    }
  });

  iniciarQuiz();
  mostrarTema('tiempo');
}

function mostrarTema(id) {
  $$('.tema').forEach((t) => t.classList.toggle('activo', t.id === 'tema-' + id));
  $$('.pestana-repaso').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tema === id)));
  const cont = $('.contenido-repaso');
  if (cont && cont.parentElement) cont.parentElement.scrollTop = 0;
  if (id === 'quiz') reiniciarQuiz();
}

function elegirCapa(id) {
  $$('.capa').forEach((c) => c.classList.toggle('sel', c.dataset.capa === id));
  $$('.btn-capa').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.capa === id)));
  $$('.info-capa').forEach((i) => { i.hidden = i.dataset.info !== id; });
}

/* ---- Quiz Verdadero / Falso ---- */
const quiz = { i: 0, aciertos: 0, respondida: false };

function iniciarQuiz() { reiniciarQuiz(); }

function reiniciarQuiz() {
  quiz.i = 0; quiz.aciertos = 0; quiz.respondida = false;
  dibujarQuiz();
}

function dibujarQuiz() {
  const caja = $('#quiz');
  caja.textContent = '';
  const total = CONFIG.PREGUNTAS.length;

  if (quiz.i >= total) {                       // pantalla final
    const fin = document.createElement('div');
    fin.className = 'quiz-tarjeta quiz-fin';
    const estrellas = Math.round((quiz.aciertos / total) * 5);
    fin.innerHTML = '<div class="quiz-estrellas" aria-hidden="true"></div><h4></h4><p></p>';
    $('.quiz-estrellas', fin).textContent = '⭐'.repeat(estrellas) + '☆'.repeat(5 - estrellas);
    $('h4', fin).textContent = `¡Terminaste! Acertaste ${quiz.aciertos} de ${total}`;
    $('p', fin).textContent = quiz.aciertos === total ? '¡Muy bien! Ya sos una experta o un experto en la geósfera.' : 'Repasá los temas y probá de nuevo.';
    const otra = crearBoton('🔁 Probar de nuevo', 'btn btn-naranja btn-grande', reiniciarQuiz);
    fin.appendChild(otra);
    caja.appendChild(fin);
    return;
  }

  const p = CONFIG.PREGUNTAS[quiz.i];
  const prog = document.createElement('div');
  prog.className = 'quiz-progreso';
  prog.textContent = `Pregunta ${quiz.i + 1} de ${total}`;
  const tarjeta = document.createElement('div');
  tarjeta.className = 'quiz-tarjeta';
  const enun = document.createElement('p');
  enun.className = 'quiz-enunciado';
  enun.textContent = p.texto;
  const botones = document.createElement('div');
  botones.className = 'quiz-botones';
  botones.appendChild(crearBoton('✔ Verdadero', 'btn btn-verde btn-grande', () => responderQuiz(true)));
  botones.appendChild(crearBoton('✖ Falso', 'btn btn-rojo btn-grande', () => responderQuiz(false)));
  tarjeta.append(enun, botones);
  caja.append(prog, tarjeta);
}

function responderQuiz(respuesta) {
  if (quiz.respondida) return;
  quiz.respondida = true;
  const p = CONFIG.PREGUNTAS[quiz.i];
  const acierto = respuesta === p.valor;
  if (acierto) quiz.aciertos++;
  $$('#quiz .quiz-botones .btn').forEach((b) => { b.disabled = true; });

  const resp = document.createElement('div');
  resp.className = 'quiz-resp ' + (acierto ? 'ok' : 'mal');
  const t = document.createElement('strong');
  t.textContent = acierto ? '✔ ¡Correcto!' : `✖ Casi. La respuesta era: ${p.valor ? 'Verdadero' : 'Falso'}`;
  const e = document.createElement('span');
  e.textContent = p.explica;
  resp.append(t, e);
  const sig = crearBoton(quiz.i + 1 >= CONFIG.PREGUNTAS.length ? '🏁 Ver resultado' : 'Siguiente ▶', 'btn btn-azul btn-grande', () => {
    quiz.i++; quiz.respondida = false; dibujarQuiz();
  });
  sig.style.marginTop = '12px';
  $('#quiz .quiz-tarjeta').append(resp, sig);
  sig.focus();
}

function crearBoton(texto, clases, alClic) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = clases;
  b.textContent = texto;
  b.addEventListener('click', alClic);
  return b;
}


/* =====================================================================
   5. ESCENA 3D  (Three.js)
   ===================================================================== */

/** Crea el renderizador, luces, suelo y cámara. Devuelve false si no se pudo. */
function asegurar3D() {
  if (renderer) return true;
  if (typeof THREE === 'undefined') { $('#aviso-sin-3d').hidden = false; return false; }
  try {
    renderer = new THREE.WebGLRenderer({ canvas: $('#lienzo-3d'), antialias: true, preserveDrawingBuffer: true });
  } catch (e) {
    $('#aviso-sin-3d').hidden = false;
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  escena3d = new THREE.Scene();
  escena3d.background = new THREE.Color(CONFIG.COLOR_FONDO_3D);
  camara = new THREE.PerspectiveCamera(45, 1, 0.3, 200);
  cam.objetivo = new THREE.Vector3(0, 1, 0);
  raycaster.obj = new THREE.Raycaster();

  // Luces: una suave general y dos direccionales para dar volumen
  escena3d.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.85));
  const sol = new THREE.DirectionalLight(0xffffff, 0.85);
  sol.position.set(6, 12, 8);
  escena3d.add(sol);
  const relleno = new THREE.DirectionalLight(0xffffff, 0.35);
  relleno.position.set(-6, 5, -7);
  escena3d.add(relleno);

  // Suelo con cuadrícula: cada cuadradito mide 1 unidad
  const suelo = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.2, 18),
    new THREE.MeshStandardMaterial({ color: CONFIG.COLOR_SUELO, roughness: 1 })
  );
  suelo.position.y = -0.1;
  escena3d.add(suelo);
  const grilla = new THREE.GridHelper(18, 18, 0x7fa37a, 0xa9c8a2);
  grilla.position.y = 0.01;
  escena3d.add(grilla);

  grupoEtiquetas = new THREE.Group();
  escena3d.add(grupoEtiquetas);

  aplicarCamara();
  if ('ResizeObserver' in window) new ResizeObserver(redimensionar).observe($('#zona-3d'));
  window.addEventListener('resize', redimensionar);
  redimensionar();
  return true;
}

/** Ajusta el tamaño del dibujo al del contenedor. */
function redimensionar() {
  if (!renderer) return;
  const zona = $('#zona-3d');
  const w = zona.clientWidth, h = zona.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camara.aspect = w / h;
  camara.updateProjectionMatrix();
}

/** Coloca la cámara según cam.theta (giro), cam.phi (altura) y cam.radio (distancia). */
function aplicarCamara() {
  const s = Math.sin(cam.phi);
  camara.position.set(
    cam.objetivo.x + cam.radio * s * Math.sin(cam.theta),
    cam.objetivo.y + cam.radio * Math.cos(cam.phi),
    cam.objetivo.z + cam.radio * s * Math.cos(cam.theta)
  );
  // Mirando desde arriba, el "arriba" de la pantalla depende del giro
  if (cam.phi < 0.05) camara.up.set(-Math.sin(cam.theta), 0, -Math.cos(cam.theta));
  else camara.up.set(0, 1, 0);
  camara.lookAt(cam.objetivo);
  camara.updateMatrixWorld(true);
}

/** Bucle de dibujo: se repite en cada cuadro. */
function bucle() {
  requestAnimationFrame(bucle);
  if (!renderer || estado.pantalla !== 'taller') return;
  animarCamara();
  if (estado.autoGirar && estado.vista === 'libre' && !arrastre) cam.theta += 0.005;
  aplicarCamara();
  ayudas.forEach((h) => h.update());
  renderer.render(escena3d, camara);
}


/* =====================================================================
   6. OBJETOS 3D
   ===================================================================== */
const buscarForma = (id) => CONFIG.FORMAS.find((f) => f.id === id) || CONFIG.FORMAS[0];
const buscarObjeto = (id) => estado.objetos.find((o) => o.id === id) || null;

/** Dibuja una textura sencilla en un canvas. Los dibujos son claros para que el color se note. */
function obtenerTextura(id) {
  if (id === 'lisa') return null;
  if (texturasCache[id]) return texturasCache[id];
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 256, 256);
  const azar = (n) => Math.random() * n;

  if (id === 'roca') {
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(90,90,90,${0.08 + azar(0.2)})`;
      g.beginPath(); g.ellipse(azar(256), azar(256), 4 + azar(18), 3 + azar(12), azar(3), 0, 7); g.fill();
    }
    g.strokeStyle = 'rgba(70,70,70,.35)'; g.lineWidth = 2;
    for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(azar(256), azar(256)); g.lineTo(azar(256), azar(256)); g.stroke(); }
  } else if (id === 'olas') {
    g.strokeStyle = 'rgba(70,90,120,.45)'; g.lineWidth = 6; g.lineCap = 'round';
    for (let y = 16; y < 256; y += 32) {
      g.beginPath();
      for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + Math.sin(x / 256 * Math.PI * 4) * 8);
      g.stroke();
    }
  } else if (id === 'lava') {
    for (let i = 0; i < 40; i++) {
      const x = azar(256), y = azar(256), r = 12 + azar(30);
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(60,60,60,.45)'); grad.addColorStop(1, 'rgba(60,60,60,0)');
      g.fillStyle = grad; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  } else if (id === 'arena') {
    for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(100,90,70,${0.25 + azar(0.4)})`; g.fillRect(azar(256), azar(256), 2, 2); }
  } else if (id === 'pasto') {
    g.strokeStyle = 'rgba(60,90,60,.5)'; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 220; i++) { const x = azar(256), y = azar(256); g.beginPath(); g.moveTo(x, y); g.lineTo(x + azar(6) - 3, y - 8 - azar(12)); g.stroke(); }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1.5, 1.5);
  texturasCache[id] = t;
  return t;
}

/** Geometría según la forma. La esfera puede estar cortada (corte 0, 1 o 2). */
function crearGeometria(tipo, corte) {
  switch (tipo) {
    case 'esfera': {
      const largo = corte === 0 ? Math.PI * 2 : (corte === 1 ? Math.PI * 1.5 : Math.PI);
      // El corte empieza en PI para que la abertura mire hacia la cámara inicial
      return new THREE.SphereGeometry(0.5, 48, 32, corte === 0 ? 0 : Math.PI, largo);
    }
    case 'cubo':     return new THREE.BoxGeometry(1, 1, 1);
    case 'cilindro': return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    case 'cono':     return new THREE.ConeGeometry(0.5, 1, 32);
    case 'anillo': { const g = new THREE.TorusGeometry(0.35, 0.15, 16, 48); g.rotateX(Math.PI / 2); return g; }
    case 'placa':    return new THREE.BoxGeometry(2, 0.25, 1.2);
    case 'montana':  return new THREE.ConeGeometry(0.6, 1.2, 5);
    case 'volcan':   return new THREE.CylinderGeometry(0.2, 0.7, 1, 32);
    default:         return new THREE.BoxGeometry(1, 1, 1);
  }
}

/** Tapas planas (medio círculo) que se ven al cortar una esfera. */
function crearTapas(material, corte) {
  const largo = corte === 1 ? Math.PI * 1.5 : Math.PI;
  const forma = new THREE.Shape();
  forma.moveTo(0, -0.5);
  forma.absarc(0, 0, 0.5, -Math.PI / 2, Math.PI / 2, false);
  const geo = new THREE.ShapeGeometry(forma, 32);
  return [Math.PI, Math.PI + largo].map((phi) => {
    const dir = new THREE.Vector3(-Math.cos(phi), 0, Math.sin(phi));
    const arriba = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(dir, arriba);
    const m = new THREE.Matrix4().makeBasis(dir, arriba, normal);
    const tapa = new THREE.Mesh(geo, material);
    tapa.quaternion.setFromRotationMatrix(m);
    return tapa;
  });
}

/** (Re)arma las mallas de una pieza según su forma y su corte. */
function reconstruirGeometria(o) {
  o.grupo.children.slice().forEach((h) => { o.grupo.remove(h); if (h.geometry) h.geometry.dispose(); });
  o.grupo.add(new THREE.Mesh(crearGeometria(o.tipo, o.corte), o.material));
  if (o.tipo === 'esfera' && o.corte > 0) crearTapas(o.material, o.corte).forEach((t) => o.grupo.add(t));
}

function aplicarTextura(o) {
  o.material.map = obtenerTextura(o.textura);
  o.material.needsUpdate = true;
}

/**
 * Si dos esferas cortadas tienen el mismo centro, sus tapas quedan en el mismo plano.
 * Este "empujoncito" hace que la más chica se vea por delante de la más grande.
 */
function actualizarProfundidad(o) {
  const medida = Math.max(o.grupo.scale.x, o.grupo.scale.y, o.grupo.scale.z);
  o.material.polygonOffset = true;
  o.material.polygonOffsetFactor = -1;
  o.material.polygonOffsetUnits = -Math.round(400 / Math.max(0.3, medida));
}

/** Crea una pieza a partir de sus datos (sirve para agregar y para restaurar). */
function crearObjeto(d) {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(d.color), roughness: 0.8, metalness: 0.05, side: THREE.DoubleSide
  });
  const grupo = new THREE.Group();
  grupo.userData.id = d.id;
  const o = {
    id: d.id, tipo: d.tipo, corte: d.corte || 0, color: d.color, textura: d.textura || 'lisa',
    etiqueta: d.etiqueta || '', ed: d.ed || 0, grupo, material, sprite: null, spriteClave: ''
  };
  grupo.position.fromArray(d.pos);
  grupo.rotation.set(d.rot[0], d.rot[1], d.rot[2]);
  grupo.scale.fromArray(d.esc);
  reconstruirGeometria(o);
  aplicarTextura(o);
  actualizarProfundidad(o);
  escena3d.add(grupo);
  estado.objetos.push(o);
  actualizarEtiqueta(o);
  return o;
}

function destruirObjeto(o) {
  escena3d.remove(o.grupo);
  o.grupo.children.forEach((h) => { if (h.geometry) h.geometry.dispose(); });
  o.material.dispose();
  quitarSprite(o);
  estado.objetos = estado.objetos.filter((x) => x !== o);
}

function vaciarEscena() {
  estado.objetos.slice().forEach(destruirObjeto);
  estado.seleccion = [];
}

/* ---- Etiquetas (carteles que flotan sobre la pieza) ---- */
function crearSpriteEtiqueta(texto, colorFondo) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const fuente = 'bold 42px "Trebuchet MS", Verdana, sans-serif';
  g.font = fuente;
  c.width = Math.max(150, Math.ceil(g.measureText(texto).width) + 56);
  c.height = 80;
  g.font = fuente;
  const r = 22, w = c.width - 6, h = c.height - 6;
  g.beginPath();
  g.moveTo(3 + r, 3); g.arcTo(3 + w, 3, 3 + w, 3 + h, r); g.arcTo(3 + w, 3 + h, 3, 3 + h, r);
  g.arcTo(3, 3 + h, 3, 3, r); g.arcTo(3, 3, 3 + w, 3, r); g.closePath();
  g.fillStyle = colorFondo; g.fill();
  g.lineWidth = 6; g.strokeStyle = '#1d2b4f'; g.stroke();
  const col = new THREE.Color(colorFondo);
  const brillo = 0.299 * col.r + 0.587 * col.g + 0.114 * col.b;
  g.fillStyle = brillo > 0.5 ? '#1d2b4f' : '#ffffff';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(texto, c.width / 2, c.height / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(c.width / 80 * 0.4, 0.4, 1);
  sprite.renderOrder = 999;
  return sprite;
}

function quitarSprite(o) {
  if (!o.sprite) return;
  grupoEtiquetas.remove(o.sprite);
  o.sprite.material.map.dispose();
  o.sprite.material.dispose();
  o.sprite = null; o.spriteClave = '';
}

/** Crea o mueve la etiqueta para que siga a su pieza. */
function actualizarEtiqueta(o) {
  if (!o.etiqueta) { quitarSprite(o); return; }
  const clave = o.etiqueta + '|' + o.color;
  if (!o.sprite || o.spriteClave !== clave) {
    quitarSprite(o);
    o.sprite = crearSpriteEtiqueta(o.etiqueta, o.color);
    o.spriteClave = clave;
    grupoEtiquetas.add(o.sprite);
  }
  const caja = new THREE.Box3().setFromObject(o.grupo);
  const centro = caja.getCenter(new THREE.Vector3());
  o.sprite.position.set(centro.x, caja.max.y + 0.35 + o.ed, centro.z);
}


/* =====================================================================
   7. SELECCIÓN Y EDICIÓN
   ===================================================================== */
const objetosSeleccionados = () => estado.seleccion.map(buscarObjeto).filter(Boolean);

function seleccionar(id, agregar) {
  if (agregar) {
    const i = estado.seleccion.indexOf(id);
    if (i >= 0) estado.seleccion.splice(i, 1); else estado.seleccion.push(id);
  } else {
    estado.seleccion = [id];
  }
  refrescarSeleccion();
}

function deseleccionarTodo() {
  if (!estado.seleccion.length) return;
  estado.seleccion = [];
  refrescarSeleccion();
}

/** Dibuja el recuadro naranja de las piezas elegidas y actualiza el panel derecho. */
function refrescarSeleccion() {
  ayudas.forEach((h) => { escena3d.remove(h); h.geometry.dispose(); h.material.dispose(); });
  ayudas = objetosSeleccionados().map((o) => {
    const h = new THREE.BoxHelper(o.grupo, CONFIG.COLOR_RESALTE);
    h.material.depthTest = false;
    h.renderOrder = 998;
    escena3d.add(h);
    return h;
  });
  actualizarPanelDerecho();
}

function actualizarPanelDerecho() {
  const sel = objetosSeleccionados();
  $('#panel-vacio').hidden = sel.length > 0;
  $('#panel-controles').hidden = sel.length === 0;
  if (!sel.length) return;

  $('#titulo-seleccion').textContent = sel.length === 1
    ? 'Elegiste: ' + (sel[0].etiqueta || buscarForma(sel[0].tipo).nombre)
    : `Elegiste ${sel.length} objetos`;

  const primero = sel[0];
  $$('.muestra').forEach((m) => m.setAttribute('aria-pressed', String(m.dataset.color === primero.color)));
  const enPaleta = CONFIG.PALETA.find((c) => c.valor === primero.color);
  $('#nombre-color').textContent = enPaleta ? enPaleta.nombre : 'Personalizado';
  $('#color-libre').value = primero.color;
  $$('.btn-textura').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.textura === primero.textura)));
  $('#entrada-etiqueta').value = sel.length === 1 ? primero.etiqueta : '';
}

/** Después de cambiar posición, tamaño o giro. */
function refrescarTransformacion(o) {
  actualizarProfundidad(o);
  actualizarEtiqueta(o);
}

/* ---- Agregar, copiar, borrar, cortar ---- */
function agregarForma(tipo) {
  const f = buscarForma(tipo);
  const n = estado.objetos.length;
  const datos = {
    id: estado.siguienteId++, tipo, corte: 0, color: f.color, textura: 'lisa', etiqueta: '', ed: 0,
    pos: [((n % 4) - 1.5) * 1.4, f.alto / 2, (Math.floor(n / 4) % 3 - 1) * 1.4],
    rot: [0, 0, 0], esc: [1, 1, 1]
  };
  const o = crearObjeto(datos);
  seleccionar(o.id, false);
  guardarPaso();
  mostrarAviso(`✔ ${f.nombre} agregada`);
}

function agregarEjemploTierra() {
  CONFIG.EJEMPLO_TIERRA.forEach((c) => {
    crearObjeto({
      id: estado.siguienteId++, tipo: 'esfera', corte: 1, color: c.color, textura: c.textura,
      etiqueta: c.etiqueta, ed: c.dy, pos: [0, 1.75, 0], rot: [0, 0, 0], esc: [c.diametro, c.diametro, c.diametro]
    });
  });
  deseleccionarTodo();
  guardarPaso();
  irAVista('libre');
  mostrarAviso('✔ Ejemplo agregado. ¡Tocá cada capa para cambiarla!');
}

function copiarSeleccion() {
  const sel = objetosSeleccionados();
  if (!sel.length) return;
  const nuevos = sel.map((o) => crearObjeto({
    id: estado.siguienteId++, tipo: o.tipo, corte: o.corte, color: o.color, textura: o.textura,
    etiqueta: o.etiqueta, ed: o.ed,
    pos: [o.grupo.position.x + 0.6, o.grupo.position.y, o.grupo.position.z + 0.6],
    rot: [o.grupo.rotation.x, o.grupo.rotation.y, o.grupo.rotation.z],
    esc: o.grupo.scale.toArray()
  }));
  estado.seleccion = nuevos.map((o) => o.id);
  refrescarSeleccion();
  guardarPaso();
  mostrarAviso(nuevos.length === 1 ? '✔ Objeto copiado' : `✔ ${nuevos.length} objetos copiados`);
}

function borrarSeleccion() {
  const sel = objetosSeleccionados();
  if (!sel.length) return;
  sel.forEach(destruirObjeto);
  estado.seleccion = [];
  refrescarSeleccion();
  guardarPaso();
  mostrarAviso('🗑 Objeto borrado');
}

function cortarSeleccion() {
  const esferas = objetosSeleccionados().filter((o) => o.tipo === 'esfera');
  if (!esferas.length) { mostrarAviso('✂ Cortar sirve para las esferas'); return; }
  esferas.forEach((o) => { o.corte = (o.corte + 1) % 3; reconstruirGeometria(o); refrescarTransformacion(o); });
  guardarPaso();
  mostrarAviso(['✔ Esfera entera', '✂ Sacamos un gajo', '✂ Cortada por la mitad'][esferas[0].corte]);
}

/* ---- Mover: "derecha" y "adelante" siguen la cámara ---- */
function ejeDominante(v) {
  return Math.abs(v.x) >= Math.abs(v.z)
    ? new THREE.Vector3(Math.sign(v.x) || 1, 0, 0)
    : new THREE.Vector3(0, 0, Math.sign(v.z) || 1);
}

function ejesDeCamara() {
  const der = new THREE.Vector3(), arr = new THREE.Vector3(), atras = new THREE.Vector3();
  camara.matrixWorld.extractBasis(der, arr, atras);
  const derecha = ejeDominante(der);
  const adelante = new THREE.Vector3(derecha.z, 0, -derecha.x);   // perpendicular a la derecha
  return { derecha, adelante };
}

function moverSeleccion(orden) {
  const { derecha, adelante } = ejeDeCamaraSeguro();
  const p = CONFIG.PASO_MOVER;
  const v = new THREE.Vector3();
  if (orden === 'derecha')   v.copy(derecha).multiplyScalar(p);
  if (orden === 'izquierda') v.copy(derecha).multiplyScalar(-p);
  if (orden === 'adelante')  v.copy(adelante).multiplyScalar(p);
  if (orden === 'atras')     v.copy(adelante).multiplyScalar(-p);
  if (orden === 'subir')     v.set(0, p, 0);
  if (orden === 'bajar')     v.set(0, -p, 0);
  objetosSeleccionados().forEach((o) => { o.grupo.position.add(v); refrescarTransformacion(o); });
}
const ejeDeCamaraSeguro = () => (camara ? ejesDeCamara() : { derecha: new THREE.Vector3(1, 0, 0), adelante: new THREE.Vector3(0, 0, -1) });

function cambiarTamano(factor, eje) {
  objetosSeleccionados().forEach((o) => {
    const s = o.grupo.scale.clone();
    if (eje) s[eje] *= factor; else s.multiplyScalar(factor);
    if ([s.x, s.y, s.z].every((v) => v >= CONFIG.TAMANO_MIN && v <= CONFIG.TAMANO_MAX)) {
      o.grupo.scale.copy(s);
      refrescarTransformacion(o);
    }
  });
}

function girarSeleccion(orden) {
  const ang = THREE.MathUtils.degToRad(CONFIG.PASO_ROTAR);
  const tabla = {
    'y-izq': [[0, 1, 0], ang],  'y-der': [[0, 1, 0], -ang],
    'x-atras': [[1, 0, 0], -ang], 'x-adelante': [[1, 0, 0], ang],
    'z-izq': [[0, 0, 1], ang],  'z-der': [[0, 0, 1], -ang]
  };
  const [eje, angulo] = tabla[orden];
  const ejeV = new THREE.Vector3().fromArray(eje);
  objetosSeleccionados().forEach((o) => { o.grupo.rotateOnWorldAxis(ejeV, angulo); refrescarTransformacion(o); });
}

function cambiarColor(hex) {
  objetosSeleccionados().forEach((o) => { o.color = hex; o.material.color.set(hex); actualizarEtiqueta(o); });
  actualizarPanelDerecho();
}

function cambiarTextura(id) {
  objetosSeleccionados().forEach((o) => { o.textura = id; aplicarTextura(o); });
  actualizarPanelDerecho();
}

function ponerEtiqueta(texto) {
  const limpio = texto.trim().slice(0, 24);
  objetosSeleccionados().forEach((o) => { o.etiqueta = limpio; actualizarEtiqueta(o); });
  actualizarPanelDerecho();
  guardarPaso();
  mostrarAviso(limpio ? '🏷 Etiqueta puesta' : '🏷 Etiqueta quitada');
}

/** Arma los botones que dependen de CONFIG (formas, colores, texturas, etiquetas). */
function construirPaneles() {
  const formas = $('#lista-formas');
  CONFIG.FORMAS.forEach((f) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn-forma';
    b.innerHTML = '<span class="ico-forma" aria-hidden="true"></span><span></span>';
    b.firstChild.textContent = f.icono;
    b.lastChild.textContent = f.nombre;
    b.setAttribute('aria-label', 'Agregar ' + f.nombre);
    b.addEventListener('click', () => agregarForma(f.id));
    formas.appendChild(b);
  });

  const paleta = $('#paleta');
  CONFIG.PALETA.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'muestra';
    b.style.background = c.valor; b.dataset.color = c.valor;
    b.title = c.nombre; b.setAttribute('aria-label', c.nombre); b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => { cambiarColor(c.valor); guardarPaso(); });
    paleta.appendChild(b);
  });
  const libre = $('#color-libre');
  libre.addEventListener('input', () => cambiarColor(libre.value));
  libre.addEventListener('change', () => guardarPaso());

  const texturas = $('#texturas');
  CONFIG.TEXTURAS.forEach((t) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn-textura'; b.dataset.textura = t.id; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<span class="ico-tex" aria-hidden="true"></span><span></span>';
    b.firstChild.textContent = t.icono;
    b.lastChild.textContent = t.nombre;
    b.addEventListener('click', () => { cambiarTextura(t.id); guardarPaso(); });
    texturas.appendChild(b);
  });

  const chips = $('#chips-etiquetas');
  CONFIG.ETIQUETAS_SUGERIDAS.forEach((texto) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = texto;
    b.addEventListener('click', () => { $('#entrada-etiqueta').value = texto; ponerEtiqueta(texto); });
    chips.appendChild(b);
  });
}

/**
 * Botón que se repite mientras se mantiene apretado.
 * El paso de historial se guarda una sola vez, al soltar.
 */
function conectarRepetir(boton, accion, alTerminar) {
  let espera = null, ritmo = null, activo = false;
  const parar = () => {
    if (!activo) return;
    activo = false; clearTimeout(espera); clearInterval(ritmo);
    if (alTerminar) alTerminar();
  };
  boton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    activo = true; accion();
    espera = setTimeout(() => { ritmo = setInterval(accion, 80); }, 350);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => boton.addEventListener(ev, parar));
  boton.addEventListener('keydown', (e) => {          // teclado: una acción por pulsación
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); accion(); if (alTerminar) alTerminar(); }
  });
}

function iniciarControlesObjeto() {
  construirPaneles();
  $$('[data-mover]').forEach((b) => conectarRepetir(b, () => moverSeleccion(b.dataset.mover), guardarPaso));
  $$('[data-tam]').forEach((b) => conectarRepetir(b,
    () => cambiarTamano(b.dataset.tam === 'mas' ? CONFIG.FACTOR_TAMANO : 1 / CONFIG.FACTOR_TAMANO), guardarPaso));
  $$('[data-eje]').forEach((b) => conectarRepetir(b,
    () => cambiarTamano(Number(b.dataset.signo) > 0 ? CONFIG.FACTOR_TAMANO : 1 / CONFIG.FACTOR_TAMANO, b.dataset.eje), guardarPaso));
  $$('[data-rot]').forEach((b) => conectarRepetir(b, () => girarSeleccion(b.dataset.rot), guardarPaso));

  $('#btn-copiar').addEventListener('click', copiarSeleccion);
  $('#btn-cortar').addEventListener('click', cortarSeleccion);
  $('#btn-borrar').addEventListener('click', borrarSeleccion);
  $('#btn-poner-etiqueta').addEventListener('click', () => ponerEtiqueta($('#entrada-etiqueta').value));
  $('#btn-quitar-etiqueta').addEventListener('click', () => { $('#entrada-etiqueta').value = ''; ponerEtiqueta(''); });
  $('#entrada-etiqueta').addEventListener('keydown', (e) => { if (e.key === 'Enter') ponerEtiqueta(e.target.value); });

  $('#btn-ejemplo').addEventListener('click', agregarEjemploTierra);
  $('#btn-multiple').addEventListener('click', () => {
    estado.multiple = !estado.multiple;
    $('#btn-multiple').setAttribute('aria-pressed', String(estado.multiple));
    mostrarAviso(estado.multiple ? '☑ Tocá varios objetos para elegirlos' : '☐ Elegís de a uno');
  });
  $('#btn-todo').addEventListener('click', () => {
    estado.seleccion = estado.objetos.map((o) => o.id);
    refrescarSeleccion();
    mostrarAviso(estado.objetos.length ? '✅ Elegiste todo' : 'Todavía no hay objetos');
  });

  // Pestañas de paneles (solo se ven en pantallas chicas)
  $$('.pestanas-taller [data-tab]').forEach((b) => b.addEventListener('click', () => cambiarPestana(b.dataset.tab)));
}

function cambiarPestana(tab) {
  $('#pantalla-taller').dataset.tab = tab;
  $$('.pestanas-taller [data-tab]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === tab)));
}


/* =====================================================================
   8. HISTORIAL (deshacer / rehacer) Y GUARDADO AUTOMÁTICO
   ===================================================================== */

/** Convierte la maqueta en un objeto simple (se puede guardar como JSON). */
function serializarEscena() {
  return {
    version: 1,
    objetos: estado.objetos.map((o) => ({
      id: o.id, tipo: o.tipo, corte: o.corte, color: o.color, textura: o.textura, etiqueta: o.etiqueta, ed: o.ed,
      pos: o.grupo.position.toArray().map(redondear),
      rot: [o.grupo.rotation.x, o.grupo.rotation.y, o.grupo.rotation.z].map(redondear),
      esc: o.grupo.scale.toArray().map(redondear)
    }))
  };
}

/** Revisa datos que vienen de afuera (archivo .json) y deja solo lo válido. */
function sanitizarEscena(datos) {
  if (!datos || !Array.isArray(datos.objetos)) return null;
  const num3 = (a, def) => (Array.isArray(a) && a.length === 3 && a.every(Number.isFinite) ? a.map((n) => limitar(n, -100, 100)) : def);
  const objetos = [];
  datos.objetos.slice(0, 300).forEach((d, i) => {
    if (!d || !CONFIG.FORMAS.some((f) => f.id === d.tipo)) return;
    objetos.push({
      id: Number.isInteger(d.id) ? d.id : i + 1,
      tipo: d.tipo,
      corte: d.tipo === 'esfera' && [0, 1, 2].includes(d.corte) ? d.corte : 0,
      color: /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : '#8d99ae',
      textura: CONFIG.TEXTURAS.some((t) => t.id === d.textura) ? d.textura : 'lisa',
      etiqueta: typeof d.etiqueta === 'string' ? d.etiqueta.slice(0, 24) : '',
      ed: Number.isFinite(d.ed) ? limitar(d.ed, -5, 5) : 0,
      pos: num3(d.pos, [0, 0.5, 0]),
      rot: num3(d.rot, [0, 0, 0]),
      esc: num3(d.esc, [1, 1, 1]).map((n) => limitar(n, CONFIG.TAMANO_MIN, CONFIG.TAMANO_MAX))
    });
  });
  return { version: 1, objetos };
}

/** Reemplaza la maqueta actual por la de los datos. No toca el historial. */
function cargarEscena(datos) {
  vaciarEscena();
  let mayor = 0;
  datos.objetos.forEach((d) => { crearObjeto(d); mayor = Math.max(mayor, d.id); });
  estado.siguienteId = mayor + 1;
  refrescarSeleccion();
}

function guardarPaso() {
  if (!escena3d) return;
  const foto = JSON.stringify(serializarEscena());
  if (estado.historial[estado.indice] === foto) return;
  estado.historial = estado.historial.slice(0, estado.indice + 1);
  estado.historial.push(foto);
  if (estado.historial.length > CONFIG.HISTORIAL_MAX) estado.historial.shift();
  estado.indice = estado.historial.length - 1;
  actualizarBotonesHistorial();
  autoguardar();
}

function reiniciarHistorial() {
  estado.historial = []; estado.indice = -1;
  guardarPaso();
  actualizarBotonesHistorial();
}

function restaurarPaso() {
  const antes = estado.seleccion.slice();
  cargarEscena(JSON.parse(estado.historial[estado.indice]));
  estado.seleccion = antes.filter(buscarObjeto);
  refrescarSeleccion();
  actualizarBotonesHistorial();
  autoguardar();
}

function deshacer() {
  if (estado.indice <= 0) { mostrarAviso('No hay nada para deshacer'); return; }
  estado.indice--; restaurarPaso(); mostrarAviso('↩ Deshecho');
}

function rehacer() {
  if (estado.indice >= estado.historial.length - 1) { mostrarAviso('No hay nada para rehacer'); return; }
  estado.indice++; restaurarPaso(); mostrarAviso('↪ Rehecho');
}

function actualizarBotonesHistorial() {
  $('#btn-deshacer').disabled = estado.indice <= 0;
  $('#btn-rehacer').disabled = estado.indice >= estado.historial.length - 1;
}

/* ---- Guardado en la computadora (localStorage) ---- */
function leerAlmacen(clave, defecto) {
  try { const t = localStorage.getItem(clave); return t ? JSON.parse(t) : defecto; } catch (e) { return defecto; }
}
function escribirAlmacen(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); return true; } catch (e) { return false; }
}

function autoguardar() {
  escribirAlmacen(CONFIG.ALMACEN_AUTO, {
    nombre: estado.nombre, alumno: estado.alumno, proyectoId: estado.proyectoId, escena: serializarEscena()
  });
}

/** Al entrar por primera vez, recupera lo último que se estaba haciendo. */
function restaurarAutoguardado() {
  if (estado.autoguardadoLeido) return;
  estado.autoguardadoLeido = true;
  const a = leerAlmacen(CONFIG.ALMACEN_AUTO, null);
  const escena = a && sanitizarEscena(a.escena);
  if (escena && escena.objetos.length) {
    estado.nombre = a.nombre || 'Mi maqueta';
    estado.alumno = a.alumno || '';
    estado.proyectoId = a.proyectoId || null;
    cargarEscena(escena);
  }
  reiniciarHistorial();
}


/* =====================================================================
   9. ENTRADA CON MOUSE Y PANTALLA TÁCTIL
   ===================================================================== */
const punteros = new Map();
let arrastre = null;     // { tipo: 'objeto' | 'camara', … }
let pellizco = null;     // separación de dos dedos

function coordenadas(e) {
  const r = $('#lienzo-3d').getBoundingClientRect();
  return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
}

function objetoBajoPuntero(e) {
  raycaster.obj.setFromCamera(coordenadas(e), camara);
  const golpes = raycaster.obj.intersectObjects(estado.objetos.map((o) => o.grupo), true);
  if (!golpes.length) return null;
  let n = golpes[0].object;
  while (n && n.userData.id === undefined) n = n.parent;
  return n ? buscarObjeto(n.userData.id) : null;
}

/** Plano por el que se arrastra una pieza, según la vista. */
function planoDeArrastre(punto) {
  const normal = estado.vista === 'frontal' ? new THREE.Vector3(0, 0, 1)
    : estado.vista === 'lateral' ? new THREE.Vector3(1, 0, 0)
    : new THREE.Vector3(0, 1, 0);
  return new THREE.Plane().setFromNormalAndCoplanarPoint(normal, punto);
}

function puntoEnPlano(e, plano) {
  raycaster.obj.setFromCamera(coordenadas(e), camara);
  const p = new THREE.Vector3();
  return raycaster.obj.ray.intersectPlane(plano, p) ? p : null;
}

function alPresionar(e) {
  if (!renderer) return;
  try { e.target.setPointerCapture(e.pointerId); } catch (err) { /* no pasa nada */ }
  punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
  camDestino = null;
  if (punteros.size === 2) {                       // dos dedos: acercar / alejar
    const [a, b] = Array.from(punteros.values());
    pellizco = Math.hypot(a.x - b.x, a.y - b.y);
    arrastre = null;
    return;
  }
  if (punteros.size > 2) return;

  const pieza = objetoBajoPuntero(e);
  const extra = estado.multiple || e.shiftKey || e.ctrlKey || e.metaKey;

  if (estado.modo === 'construir' && pieza && e.button !== 2) {
    if (extra) seleccionar(pieza.id, true);
    else if (!estado.seleccion.includes(pieza.id)) seleccionar(pieza.id, false);
    if (!estado.seleccion.includes(pieza.id)) return;   // se sacó de la selección
    const plano = planoDeArrastre(pieza.grupo.position);
    arrastre = { tipo: 'objeto', id: pieza.id, extra, plano, previo: puntoEnPlano(e, plano), distancia: 0, movido: false };
  } else {
    arrastre = { tipo: 'camara', pan: e.button === 2 || e.shiftKey, pieza, distancia: 0, movido: false };
  }
}

function alMover(e) {
  const p = punteros.get(e.pointerId);
  if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX; p.y = e.clientY;

  if (punteros.size === 2 && pellizco) {
    const [a, b] = Array.from(punteros.values());
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d > 0) cam.radio = limitar(cam.radio * (pellizco / d), 2, 40);
    pellizco = d;
    return;
  }
  if (!arrastre) return;
  arrastre.distancia += Math.hypot(dx, dy);
  if (arrastre.distancia > 5) arrastre.movido = true;
  if (!arrastre.movido) return;

  if (arrastre.tipo === 'objeto') {
    const ahora = puntoEnPlano(e, arrastre.plano);
    if (ahora && arrastre.previo) {
      const delta = ahora.clone().sub(arrastre.previo);
      if (delta.length() < 20) {
        objetosSeleccionados().forEach((o) => {
          o.grupo.position.add(delta);
          o.grupo.position.x = limitar(o.grupo.position.x, -40, 40);
          o.grupo.position.y = limitar(o.grupo.position.y, -5, 40);
          o.grupo.position.z = limitar(o.grupo.position.z, -40, 40);
          refrescarTransformacion(o);
        });
      }
      arrastre.previo = ahora;
    }
  } else if (arrastre.pan || estado.vista !== 'libre') {
    const k = 2 * Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)) * cam.radio / $('#lienzo-3d').clientHeight;
    panear(-dx * k, dy * k);
  } else {
    cam.theta -= dx * 0.008;
    cam.phi = limitar(cam.phi - dy * 0.008, 0.15, 1.5);
  }
}

function alSoltar(e) {
  if (!punteros.has(e.pointerId)) return;
  punteros.delete(e.pointerId);
  if (punteros.size < 2) pellizco = null;
  if (punteros.size > 0) return;
  const a = arrastre;
  arrastre = null;
  if (!a) return;

  if (a.tipo === 'objeto') {
    if (a.movido) guardarPaso();
    else if (!a.extra && estado.seleccion.length > 1) seleccionar(a.id, false);   // clic simple: quedarse con esa pieza
  } else if (!a.movido) {                                                        // toque en el vacío o en una pieza
    if (estado.modo === 'construir') { if (!estado.multiple) deseleccionarTodo(); }
    else if (a.pieza) mostrarInfo(a.pieza);
    else ocultarInfo();
  }
}

function alRueda(e) {
  e.preventDefault();
  camDestino = null;
  cam.radio = limitar(cam.radio * (1 + Math.sign(e.deltaY) * 0.1), 2, 40);
}

function iniciarEntradaLienzo() {
  const lienzo = $('#lienzo-3d');
  lienzo.addEventListener('pointerdown', alPresionar);
  lienzo.addEventListener('pointermove', alMover);
  lienzo.addEventListener('pointerup', alSoltar);
  lienzo.addEventListener('pointercancel', alSoltar);
  lienzo.addEventListener('wheel', alRueda, { passive: false });
  lienzo.addEventListener('contextmenu', (e) => e.preventDefault());
}

/** Atajos de teclado (solo en Construir y sin escribir en un cuadro de texto). */
function iniciarTeclado() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!$('#capa-dialogo').hidden) cerrarDialogo();
      else if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      return;
    }
    if (estado.pantalla !== 'taller' || estado.modo !== 'construir' || !$('#capa-dialogo').hidden) return;
    if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    const ctrl = e.ctrlKey || e.metaKey;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); borrarSeleccion(); }
    else if (ctrl && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? rehacer() : deshacer(); }
    else if (ctrl && e.key.toLowerCase() === 'y') { e.preventDefault(); rehacer(); }
  });
}


/* =====================================================================
   10. VISTAS, CÁMARA E IMÁGENES
   ===================================================================== */
const VISTAS = {
  libre:   { theta: 0.7,         phi: 1.05 },
  arriba:  { theta: 0,           phi: 0.0001 },
  frontal: { theta: 0,           phi: Math.PI / 2 },
  lateral: { theta: Math.PI / 2, phi: Math.PI / 2 }
};

/** Calcula dónde poner la cámara para ver toda la maqueta. */
function calcularEncuadre() {
  if (!estado.objetos.length) return { centro: new THREE.Vector3(0, 1, 0), radio: 11 };
  const caja = new THREE.Box3();
  estado.objetos.forEach((o) => { o.grupo.updateMatrixWorld(true); caja.expandByObject(o.grupo); });
  const esfera = caja.getBoundingSphere(new THREE.Sphere());
  let dist = esfera.radius / Math.sin(THREE.MathUtils.degToRad(camara.fov / 2)) * 1.2;
  if (camara.aspect < 1) dist /= camara.aspect;
  return { centro: esfera.center.clone(), radio: limitar(dist, 5, 40) };
}

function irAVista(nombre) {
  if (!asegurar3D()) return;
  estado.vista = nombre;
  const v = VISTAS[nombre], enc = calcularEncuadre();
  camDestino = { theta: v.theta, phi: v.phi, radio: enc.radio, objetivo: enc.centro };
  marcarVistas();
}

function marcarVistas() {
  $$('.btn-vista').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vista === estado.vista)));
  $('#btn-vista-arriba').setAttribute('aria-pressed', String(estado.vista === 'arriba'));
}

/** Acerca la cámara a su destino poco a poco. */
function animarCamara() {
  if (!camDestino) return;
  const k = 0.15, d = camDestino;
  let dt = d.theta - cam.theta;
  dt = Math.atan2(Math.sin(dt), Math.cos(dt));            // camino más corto
  cam.theta += dt * k;
  cam.phi += (d.phi - cam.phi) * k;
  cam.radio += (d.radio - cam.radio) * k;
  cam.objetivo.lerp(d.objetivo, k);
  if (Math.abs(dt) < 0.002 && Math.abs(d.phi - cam.phi) < 0.002 && Math.abs(d.radio - cam.radio) < 0.02 && cam.objetivo.distanceTo(d.objetivo) < 0.02) {
    cam.theta = d.theta; cam.phi = d.phi; cam.radio = d.radio; cam.objetivo.copy(d.objetivo);
    camDestino = null;
  }
}

function panear(dx, dy) {
  camDestino = null;
  const der = new THREE.Vector3(), arr = new THREE.Vector3(), atras = new THREE.Vector3();
  camara.matrixWorld.extractBasis(der, arr, atras);
  cam.objetivo.addScaledVector(der, dx).addScaledVector(arr, dy);
}

/** Botones de cámara: Girar, Acercar, Alejar, Arriba, Abajo, Izquierda, Derecha. */
function accionCamara(nombre) {
  if (!renderer) return;
  camDestino = null;
  const paso = cam.radio * 0.03;
  if (nombre === 'girar-izq') cam.theta -= 0.08;
  else if (nombre === 'girar-der') cam.theta += 0.08;
  else if (nombre === 'acercar') cam.radio = limitar(cam.radio * 0.93, 2, 40);
  else if (nombre === 'alejar') cam.radio = limitar(cam.radio * 1.07, 2, 40);
  else if (nombre === 'arriba') panear(0, paso);
  else if (nombre === 'abajo') panear(0, -paso);
  else if (nombre === 'izquierda') panear(-paso, 0);
  else if (nombre === 'derecha') panear(paso, 0);
  else if (nombre === 'centrar') irAVista(estado.vista);
}

function iniciarControlesVista() {
  $$('.btn-vista').forEach((b) => b.addEventListener('click', () => irAVista(b.dataset.vista)));
  $('#btn-vista-arriba').addEventListener('click', () => irAVista(estado.vista === 'arriba' ? 'libre' : 'arriba'));
  $$('.btn-cam').forEach((b) => conectarRepetir(b, () => accionCamara(b.dataset.cam), null));
  $('#btn-pad').addEventListener('click', () => {
    const cerrado = $('#pad-camara').classList.toggle('cerrado');
    $('#btn-pad').setAttribute('aria-expanded', String(!cerrado));
  });
  if (window.innerWidth < 900) { $('#pad-camara').classList.add('cerrado'); $('#btn-pad').setAttribute('aria-expanded', 'false'); }
}

/**
 * Dibuja la maqueta desde varias vistas y devuelve un canvas por vista.
 * Se usa para la imagen de 4 vistas y para la miniatura.
 */
function capturarVistas(nombres, ancho, alto) {
  if (!asegurar3D()) return [];
  const guardado = { theta: cam.theta, phi: cam.phi, radio: cam.radio, objetivo: cam.objetivo.clone() };
  const visibles = ayudas.map((h) => h.visible);
  ayudas.forEach((h) => { h.visible = false; });
  renderer.setPixelRatio(1);
  renderer.setSize(ancho, alto, false);
  camara.aspect = ancho / alto;
  camara.updateProjectionMatrix();
  const enc = calcularEncuadre();

  const lienzos = nombres.map((n) => {
    cam.theta = VISTAS[n].theta; cam.phi = VISTAS[n].phi; cam.radio = enc.radio; cam.objetivo.copy(enc.centro);
    aplicarCamara();
    renderer.render(escena3d, camara);
    const c = document.createElement('canvas');
    c.width = ancho; c.height = alto;
    c.getContext('2d').drawImage(renderer.domElement, 0, 0, ancho, alto);
    return c;
  });

  ayudas.forEach((h, i) => { h.visible = visibles[i]; });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  Object.assign(cam, { theta: guardado.theta, phi: guardado.phi, radio: guardado.radio });
  cam.objetivo.copy(guardado.objetivo);
  redimensionar();
  aplicarCamara();
  return lienzos;
}

/** Imagen PNG con las 4 vistas y el título de la maqueta. */
function crearImagenCuatroVistas() {
  const nombres = ['libre', 'arriba', 'frontal', 'lateral'];
  const titulos = ['Vista 3D', 'Desde arriba', 'De frente', 'De costado'];
  const W = 640, H = 480, BARRA = 100;
  const vistas = capturarVistas(nombres, W, H);
  if (!vistas.length) return null;
  const c = document.createElement('canvas');
  c.width = W * 2; c.height = H * 2 + BARRA;
  const g = c.getContext('2d');
  g.fillStyle = '#1d2b4f'; g.fillRect(0, 0, c.width, BARRA);
  g.fillStyle = '#ffffff'; g.textBaseline = 'middle';
  g.font = 'bold 44px "Trebuchet MS", Verdana, sans-serif';
  g.fillText(estado.nombre || 'Mi maqueta', 30, BARRA / 2 - 4);
  if (estado.alumno) {
    g.font = '26px "Trebuchet MS", Verdana, sans-serif';
    g.textAlign = 'right';
    g.fillText(estado.alumno, c.width - 30, BARRA / 2);
    g.textAlign = 'left';
  }
  vistas.forEach((v, i) => {
    const x = (i % 2) * W, y = BARRA + Math.floor(i / 2) * H;
    g.drawImage(v, x, y);
    g.fillStyle = '#1d2b4f'; g.fillRect(x + 12, y + 12, 220, 40);
    g.fillStyle = '#ffffff'; g.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
    g.fillText(titulos[i], x + 24, y + 33);
    g.strokeStyle = '#1d2b4f'; g.lineWidth = 3; g.strokeRect(x, y, W, H);
  });
  return c;
}

function descargar(url, nombre) {
  const a = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
}

function descargarImagen() {
  if (!estado.objetos.length) { mostrarAviso('Tu maqueta está vacía. ¡Agregá algo primero!'); return false; }
  const c = crearImagenCuatroVistas();
  if (!c) return false;
  descargar(c.toDataURL('image/png'), nombreArchivo(estado.nombre) + '_4_vistas.png');
  mostrarAviso('📷 Imagen descargada');
  return true;
}


/* =====================================================================
   11. GUARDAR: COMPUTADORA, ARCHIVO .JSON, DRIVE Y GALERÍA
   ===================================================================== */
function crearPaquete() {
  return { app: 'La Geosfera', version: 1, nombre: estado.nombre, alumno: estado.alumno, fecha: new Date().toISOString(), escena: serializarEscena() };
}

function leerCamposGuardar() {
  estado.nombre = $('#guardar-nombre').value.trim() || 'Mi maqueta';
  estado.alumno = $('#guardar-alumno').value.trim();
  autoguardar();
}

function decirEstado(texto, tipo) {
  const e = $('#estado-guardado');
  e.textContent = texto;
  e.className = 'estado-guardado' + (tipo ? ' ' + tipo : '');
}

function abrirDialogoGuardar() {
  $('#guardar-nombre').value = estado.nombre;
  $('#guardar-alumno').value = estado.alumno;
  decirEstado('', '');
  abrirDialogo('dlg-guardar');
}

function guardarEnComputadora() {
  leerCamposGuardar();
  if (!estado.objetos.length) { decirEstado('Tu maqueta está vacía. ¡Agregá algo primero!', 'mal'); return; }
  const miniatura = (capturarVistas(['libre'], 240, 180)[0] || document.createElement('canvas')).toDataURL('image/jpeg', 0.7);
  const lista = leerAlmacen(CONFIG.ALMACEN_MAQUETAS, []);
  const id = estado.proyectoId || 'm' + Date.now();
  const registro = { id, nombre: estado.nombre, alumno: estado.alumno, fecha: new Date().toISOString(), miniatura, escena: serializarEscena() };
  const i = lista.findIndex((m) => m.id === id);
  if (i >= 0) lista[i] = registro; else lista.unshift(registro);
  if (escribirAlmacen(CONFIG.ALMACEN_MAQUETAS, lista)) {
    estado.proyectoId = id;
    autoguardar();
    decirEstado('✔ Guardada. La vas a encontrar en “Ver maquetas”.', 'ok');
  } else {
    decirEstado('No hay lugar para guardar más. Borrá una maqueta vieja o descargá el archivo (.json).', 'mal');
  }
}

function descargarJson() {
  leerCamposGuardar();
  const blob = new Blob([JSON.stringify(crearPaquete(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  descargar(url, nombreArchivo(estado.nombre) + '.json');
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  decirEstado('✔ Archivo .json descargado.', 'ok');
}

function descargarPngDesdeDialogo() {
  leerCamposGuardar();
  if (descargarImagen()) decirEstado('✔ Imagen descargada.', 'ok');
  else decirEstado('Tu maqueta está vacía. ¡Agregá algo primero!', 'mal');
}

/** Envía el .json y la imagen a una carpeta de Drive usando Google Apps Script. */
async function enviarADrive() {
  leerCamposGuardar();
  if (!CONFIG.URL_APPS_SCRIPT) { decirEstado('Drive todavía no está conectado. Pedile ayuda a tu docente.', 'mal'); return; }
  if (!estado.objetos.length) { decirEstado('Tu maqueta está vacía. ¡Agregá algo primero!', 'mal'); return; }
  const imagen = crearImagenCuatroVistas();
  decirEstado('☁ Enviando…', '');
  $('#gu-drive').disabled = true;
  try {
    const respuesta = await fetch(CONFIG.URL_APPS_SCRIPT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // evita consultas previas (CORS)
      body: JSON.stringify({
        clave: CONFIG.CLAVE_DOCENTE, nombre: estado.nombre, alumno: estado.alumno,
        escena: crearPaquete(), imagen: imagen ? imagen.toDataURL('image/png').split(',')[1] : ''
      })
    });
    const datos = await respuesta.json();
    if (datos.ok) decirEstado('✔ ¡Enviada a la carpeta de Drive!', 'ok');
    else decirEstado('Drive no la aceptó: ' + (datos.error || 'error desconocido'), 'mal');
  } catch (e) {
    decirEstado('No se pudo enviar. Revisá internet. Tu maqueta sigue en esta computadora.', 'mal');
  } finally {
    $('#gu-drive').disabled = false;
  }
}

/** Abre un archivo .json que el alumno descargó antes. */
function abrirArchivo(archivo) {
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const datos = JSON.parse(lector.result);
      const escena = sanitizarEscena(datos.escena || datos);
      if (!escena) throw new Error('formato');
      cargarProyecto({ nombre: datos.nombre, alumno: datos.alumno, id: null, escena }, 'construir');
      mostrarAviso('📂 Maqueta abierta');
    } catch (e) {
      mostrarAviso('Ese archivo no es una maqueta válida');
      decirEstado('Ese archivo no es una maqueta válida.', 'mal');
    }
  };
  lector.readAsText(archivo);
}

/** Carga una maqueta (de la galería o de un archivo) y entra al taller. */
function cargarProyecto(p, modo) {
  entrarTaller(modo, true);
  estado.nombre = p.nombre || 'Mi maqueta';
  estado.alumno = p.alumno || '';
  estado.proyectoId = p.id || null;
  cargarEscena(sanitizarEscena(p.escena) || { objetos: [] });
  reiniciarHistorial();
  irAVista('libre');
  cerrarDialogo();
}

/* ---- Galería "Ver maquetas" ---- */
function dibujarGaleria() {
  const lista = leerAlmacen(CONFIG.ALMACEN_MAQUETAS, []);
  const caja = $('#lista-maquetas');
  caja.textContent = '';
  $('#vacio-maquetas').hidden = lista.length > 0;
  lista.forEach((m) => {
    const card = document.createElement('article');
    card.className = 'maqueta-card';
    const img = document.createElement('img');
    img.src = typeof m.miniatura === 'string' && m.miniatura.startsWith('data:image/') ? m.miniatura : '';
    img.alt = 'Vista de la maqueta ' + m.nombre;
    const titulo = document.createElement('h3');
    titulo.textContent = m.nombre || 'Mi maqueta';
    const info = document.createElement('p');
    const fecha = new Date(m.fecha);
    info.textContent = (m.alumno ? m.alumno + ' · ' : '') + (isNaN(fecha) ? '' : fecha.toLocaleDateString('es-AR'));
    const fila = document.createElement('div');
    fila.className = 'fila-botones';
    fila.append(
      crearBoton('🧭 Explorar', 'btn btn-azul btn-chico', () => cargarProyecto(m, 'explorar')),
      crearBoton('🛠 Editar', 'btn btn-naranja btn-chico', () => cargarProyecto(m, 'construir')),
      crearBoton('🗑 Borrar', 'btn btn-gris btn-chico', () => confirmar(`¿Borrar “${m.nombre}”?`, () => {
        escribirAlmacen(CONFIG.ALMACEN_MAQUETAS, leerAlmacen(CONFIG.ALMACEN_MAQUETAS, []).filter((x) => x.id !== m.id));
        if (estado.proyectoId === m.id) estado.proyectoId = null;
        dibujarGaleria();
        mostrarAviso('🗑 Maqueta borrada');
      }, 'Sí, borrar'))
    );
    card.append(img, titulo, info, fila);
    caja.appendChild(card);
  });
}


/* =====================================================================
   12. MODOS: CONSTRUIR Y EXPLORAR
   ===================================================================== */

/** Entra al taller 3D. Si "sinCargar" es true no recupera el autoguardado. */
function entrarTaller(modo, sinCargar) {
  irA('taller');
  if (!asegurar3D()) { establecerModo(modo); return; }
  if (sinCargar) estado.autoguardadoLeido = true; else restaurarAutoguardado();
  establecerModo(modo);
  irAVista(estado.vista);
}

function establecerModo(modo) {
  estado.modo = modo;
  $('#pantalla-taller').dataset.modo = modo;
  $('#etiqueta-modo').textContent = modo === 'explorar' ? '🧭 Explorar' : '🛠 Construir';
  if (modo !== 'construir') deseleccionarSiHay();
  ocultarInfo();
  estado.autoGirar = false;
  $('#btn-autogiro').setAttribute('aria-pressed', 'false');
  if (modo !== 'explorar' && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  setTimeout(redimensionar, 30);
}

function deseleccionarSiHay() { if (escena3d) deseleccionarTodo(); }

function iniciarModos() {
  $('#btn-explorar').addEventListener('click', () => {
    establecerModo('explorar');
    irAVista('libre');
    mostrarAviso(estado.objetos.length ? '🧭 Tocá una pieza para saber qué es' : 'Tu maqueta está vacía. ¡Volvé a construir!');
  });
  $('#btn-seguir').addEventListener('click', () => establecerModo('construir'));
  $('#btn-autogiro').addEventListener('click', () => {
    estado.autoGirar = !estado.autoGirar;
    if (estado.autoGirar) irAVista('libre');
    $('#btn-autogiro').setAttribute('aria-pressed', String(estado.autoGirar));
  });
  $('#btn-pantalla-completa').addEventListener('click', alternarPantallaCompleta);
  $('#btn-descargar').addEventListener('click', descargarImagen);
  $('#btn-deshacer').addEventListener('click', deshacer);
  $('#btn-rehacer').addEventListener('click', rehacer);
  $('#btn-guardar').addEventListener('click', abrirDialogoGuardar);
  $('#btn-nuevo').addEventListener('click', () => confirmar('¿Empezar una maqueta nueva? Se va a borrar la que estás armando.', nuevoProyecto, 'Sí, empezar'));
}

function nuevoProyecto() {
  vaciarEscena();
  estado.nombre = 'Mi maqueta'; estado.alumno = ''; estado.proyectoId = null;
  refrescarSeleccion();
  reiniciarHistorial();
  irAVista('libre');
  mostrarAviso('🆕 Maqueta nueva');
}

/* ---- Información al tocar una pieza (Explorar) ---- */
function mostrarInfo(o) {
  const caja = $('#info-objeto');
  const titulo = document.createElement('strong');
  titulo.textContent = o.etiqueta || buscarForma(o.tipo).nombre;
  const texto = document.createElement('span');
  texto.textContent = CONFIG.DEFINICIONES[normalizar(o.etiqueta)] || (o.etiqueta ? 'Esta pieza es parte de tu maqueta.' : 'Esta pieza no tiene etiqueta. En Construir podés ponerle una.');
  caja.textContent = '';
  caja.append(titulo, texto);
  caja.hidden = false;
}
function ocultarInfo() { $('#info-objeto').hidden = true; }

/* ---- Pantalla completa (disponible en el modo Explorar) ---- */
function alternarPantallaCompleta() {
  const zona = $('#pantalla-taller');
  if (!document.fullscreenElement) {
    (zona.requestFullscreen ? zona.requestFullscreen() : Promise.reject()).catch(() => mostrarAviso('Este navegador no permite pantalla completa'));
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function alCambiarPantallaCompleta() {
  const activa = !!document.fullscreenElement;
  $('#btn-pantalla-completa').setAttribute('aria-pressed', String(activa));
  setTimeout(redimensionar, 60);
}


/* =====================================================================
   13. DIÁLOGOS, AVISOS Y ARRANQUE
   ===================================================================== */
let accionConfirmar = null;
let temporizadorAviso = null;

function abrirDialogo(id) {
  $('#capa-dialogo').hidden = false;
  $$('.dialogo').forEach((d) => { d.hidden = d.id !== id; });
  const primero = $('input, button', $('#' + id));
  if (primero) primero.focus();
}

function cerrarDialogo() {
  $('#capa-dialogo').hidden = true;
  accionConfirmar = null;
}

function confirmar(mensaje, siAcepta, textoSi) {
  $('#dlg-confirmar-texto').textContent = mensaje;
  $('#dlg-si').textContent = textoSi || 'Sí';
  accionConfirmar = siAcepta;
  abrirDialogo('dlg-confirmar');
  $('#dlg-no').focus();
}

/** Mensaje corto que se ve unos segundos (confirma lo que se hizo). */
function mostrarAviso(texto) {
  const a = $('#aviso');
  a.textContent = texto;
  a.classList.add('visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => a.classList.remove('visible'), 2400);
}

function iniciarDialogos() {
  $('#dlg-si').addEventListener('click', () => { const f = accionConfirmar; cerrarDialogo(); if (f) f(); });
  $('#dlg-no').addEventListener('click', cerrarDialogo);
  $('#gu-cerrar').addEventListener('click', () => { leerCamposGuardar(); cerrarDialogo(); });
  $('#gu-local').addEventListener('click', guardarEnComputadora);
  $('#gu-png').addEventListener('click', descargarPngDesdeDialogo);
  $('#gu-json').addEventListener('click', descargarJson);
  $('#gu-drive').addEventListener('click', enviarADrive);
  $('#gu-abrir').addEventListener('click', () => $('#archivo-json').click());
  $('#btn-abrir-archivo-galeria').addEventListener('click', () => $('#archivo-json').click());
  $('#archivo-json').addEventListener('change', (e) => { abrirArchivo(e.target.files[0]); e.target.value = ''; });
  $('#capa-dialogo').addEventListener('click', (e) => { if (e.target.id === 'capa-dialogo') cerrarDialogo(); });
  document.addEventListener('fullscreenchange', alCambiarPantallaCompleta);
}

/** Arranque de la aplicación. */
function iniciar() {
  iniciarNavegacion();
  iniciarRepaso();
  iniciarDialogos();
  iniciarModos();
  iniciarControlesObjeto();
  iniciarControlesVista();
  iniciarEntradaLienzo();
  iniciarTeclado();
  actualizarBotonesHistorial();
  requestAnimationFrame(bucle);
}

document.addEventListener('DOMContentLoaded', iniciar);
