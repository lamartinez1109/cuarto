'use strict';

/* =========================================================
   DATOS DE CONTENIDO
   ========================================================= */

const PARTES_INFO = {
  volanta:  { nombre: 'Volanta',  texto: '📌 La volanta es una frase cortita que va ARRIBA del titular. Ubica la noticia o da un dato extra antes del título grande.' },
  titular:  { nombre: 'Titular',  texto: '📰 El titular es el título grande y llamativo. Cuenta de qué trata la noticia en pocas palabras.' },
  copete:   { nombre: 'Copete',   texto: '📝 El copete es un párrafo breve debajo del titular. Resume lo más importante: qué, quién, cuándo, dónde y por qué.' },
  cuerpo:   { nombre: 'Cuerpo de la noticia', texto: '📖 El cuerpo es la parte más larga. Cuenta todos los detalles de la noticia, con testimonios y datos.' },
  epigrafe: { nombre: 'Epígrafe', texto: '🖼️ El epígrafe es el textito que va debajo de una foto y explica qué se ve en la imagen.' }
};

const ETIQUETAS_TEXTO = {
  volanta: 'Volanta',
  titular: 'Titular',
  copete: 'Copete',
  cuerpo: 'Cuerpo de la noticia',
  epigrafe: 'Epígrafe'
};

const ORDEN_CORRECTO = ['volanta', 'titular', 'copete', 'cuerpo', 'epigrafe'];

const PUZZLE_RONDAS = [
  {
    titulo: 'El perro goloso',
    partes: {
      volanta:  'INCREÍBLE HISTORIA ESCOLAR',
      titular:  'UN PERRO SE COMIÓ LA TAREA DE TODO EL CURSO',
      copete:   'El perro Firulais entró al salón de 4° grado durante el recreo y devoró las carpetas de los 25 alumnos, dejando a la maestra sin tareas para corregir.',
      cuerpo:   'Según los alumnos, Firulais es la mascota de la escuela y suele pasear por los pasillos. Atraído por el olor de un sándwich escondido en una mochila, terminó comiéndose también varias hojas de tarea. La maestra Jorgelina decidió perdonar al curso "por esta única vez".',
      epigrafe: 'Firulais, el perro goloso, posando muy tranquilo después de su gran banquete de tareas.'
    }
  },
  {
    titulo: 'La abuela patinadora',
    partes: {
      volanta:  'DEPORTE EXTREMO EN EL BARRIO',
      titular:  'UNA ABUELA DE 80 AÑOS GANÓ LA CARRERA DE SKATE DEL PUEBLO',
      copete:   'Doña Rosa sorprendió a todos al subirse a una patineta por primera vez y cruzar la meta antes que los competidores más jóvenes.',
      cuerpo:   'Doña Rosa contó que aprendió a andar en patineta viendo videos con sus nietos. "Me subí sin pensarlo mucho, y cuando quise frenar, ya había cruzado la meta", explicó entre risas. Los organizadores la premiaron con un trofeo especial.',
      epigrafe: 'Doña Rosa levantando su patineta como trofeo, rodeada de chicos admirados.'
    }
  }
];

const TITULAR_RONDAS = [
  {
    copete: 'Un elefante escapó del circo y terminó bañándose en la fuente de la plaza principal, ante la sorpresa de los vecinos que paseaban esa tarde.',
    opciones: [
      { texto: 'EL ELEFANTE QUE SE DIO UN CHAPUZÓN EN LA PLAZA', correcta: true },
      { texto: 'LLUVIAS AFECTAN LA COSECHA DE MAÍZ', correcta: false },
      { texto: 'NUEVO SEMÁFORO EN LA AVENIDA PRINCIPAL', correcta: false }
    ]
  },
  {
    copete: 'Una gallina puso un huevo con forma de corazón y sus dueños aseguran que les trae buena suerte desde entonces.',
    opciones: [
      { texto: 'SE INAUGURÓ UNA NUEVA PLAZA DE JUEGOS', correcta: false },
      { texto: 'LA GALLINA QUE PUSO UN HUEVO CON FORMA DE CORAZÓN', correcta: true },
      { texto: 'EL CLIMA SERÁ SOLEADO ESTE FIN DE SEMANA', correcta: false }
    ]
  },
  {
    copete: 'Un grupo de chicos construyó un cohete de cartón tan grande que la maestra tuvo que pedir ayuda para sacarlo del aula.',
    opciones: [
      { texto: 'EL COHETE DE CARTÓN QUE NO ENTRABA POR LA PUERTA', correcta: true },
      { texto: 'SE SUSPENDIERON LAS CLASES POR LLUVIA', correcta: false },
      { texto: 'LOS ALUMNOS VISITARON UN MUSEO DE CIENCIAS', correcta: false }
    ]
  },
  {
    copete: 'Un perico aprendió a repetir la lista de compras del supermercado y ahora acompaña a su dueña a hacer las compras.',
    opciones: [
      { texto: 'ABREN NUEVA SUCURSAL DE SUPERMERCADO', correcta: false },
      { texto: 'CONCURSO DE MASCOTAS EN EL PARQUE', correcta: false },
      { texto: 'EL PERICO QUE SE SABE LA LISTA DEL SÚPER DE MEMORIA', correcta: true }
    ]
  }
];

const TITULARES_LOCOS = [
  'UN PULPO GANÓ EL CAMPEONATO DE AJEDREZ DEL BARRIO',
  'LLUEVEN CARAMELOS EN LA PLAZA CENTRAL',
  'UN ROBOT SE ANOTÓ EN LA ESCUELA PARA APRENDER A DIBUJAR',
  'EL SOL SE TOMÓ EL DÍA LIBRE Y SALIÓ LA LUNA A LA TARDE'
];

/* =========================================================
   ESTADO GENERAL
   ========================================================= */

const progreso = { mapa: false, rompecabezas: false, titular: false, copete: false };
let totalErrores = 0;

/* =========================================================
   UTILIDADES
   ========================================================= */

function $(selector, ctx) { return (ctx || document).querySelector(selector); }
function $all(selector, ctx) { return Array.from((ctx || document).querySelectorAll(selector)); }

function mezclar(array) {
  const copia = array.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function showScreen(nombre) {
  $all('.screen').forEach(s => s.classList.remove('activa'));
  const destino = document.getElementById('screen-' + nombre);
  if (destino) destino.classList.add('activa');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================================================
   PROGRESO / RECOMPENSAS
   ========================================================= */

function actualizarBarra() {
  const hechas = Object.values(progreso).filter(Boolean).length;
  const total = Object.keys(progreso).length;
  $('#barraFill').style.width = (hechas / total * 100) + '%';
  $('#barraProgreso').setAttribute('aria-valuenow', String(hechas));
  $('#carnetTexto').textContent = hechas + ' de ' + total + ' misiones cumplidas';
}

function completarMision(clave, tituloModal, textoModal, emoji) {
  if (progreso[clave]) return;
  progreso[clave] = true;
  actualizarBarra();
  const sello = document.querySelector('.sello[data-mision="' + clave + '"]');
  if (sello) sello.classList.add('conseguido');
  mostrarModalRecompensa(emoji, tituloModal, textoModal);
  lanzarConfeti();
}

function mostrarModalRecompensa(emoji, titulo, texto) {
  $('#modalSelloEmoji').textContent = emoji;
  $('#modalTitulo').textContent = titulo;
  $('#modalTexto').textContent = texto;
  const overlay = $('#modalRecompensa');
  overlay.hidden = false;
}

function cerrarModal() {
  $('#modalRecompensa').hidden = true;
  if (Object.values(progreso).every(Boolean)) {
    setTimeout(mostrarFinal, 250);
  }
}

function mostrarFinal() {
  let rango, mensaje;
  if (totalErrores === 0) {
    rango = '¡Reportero/a Estrella de Oro! 🌟';
    mensaje = 'Completaste las 4 misiones sin ningún error. ¡El Diario Curioso está orgulloso de vos!';
  } else if (totalErrores <= 6) {
    rango = '¡Reportero/a Estrella! ⭐';
    mensaje = 'Completaste las 4 misiones y ahora conocés todas las partes de una noticia.';
  } else {
    rango = '¡Reportero/a Graduado/a! 📰';
    mensaje = 'Completaste las 4 misiones. ¡Seguí practicando para ser un cronista experto!';
  }
  $('#certificadoRango').textContent = rango;
  $('#certificadoMensaje').textContent = mensaje;
  $('#certificadoSellos').textContent = '🗺️ 🧩 🎯 ✍️';
  showScreen('final');
}

/* =========================================================
   LEYENDA (pantalla de inicio)
   ========================================================= */

function initLeyenda() {
  $all('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const parte = chip.dataset.parte;
      $('#leyendaTexto').textContent = PARTES_INFO[parte].texto;
    });
  });
}

/* =========================================================
   NAVEGACIÓN GENERAL
   ========================================================= */

function initNavegacion() {
  $all('[data-ir]').forEach(btn => {
    btn.addEventListener('click', () => {
      const destino = btn.dataset.ir;
      showScreen(destino);
      if (destino === 'mapa') initMapa();
      if (destino === 'rompecabezas') initRompecabezas();
      if (destino === 'titular') initTitular();
      if (destino === 'copete') initCopete();
    });
  });
  $all('[data-volver]').forEach(btn => {
    btn.addEventListener('click', () => showScreen('inicio'));
  });
  $('#modalCerrar').addEventListener('click', cerrarModal);
  $('#reiniciarTodo').addEventListener('click', () => window.location.reload());
}

/* =========================================================
   MISIÓN 1 · MAPA INTERACTIVO
   ========================================================= */

let mapaSeleccion = null;
let mapaColocadas = 0;

function initMapa() {
  mapaSeleccion = null;
  mapaColocadas = 0;
  $('#mapaReintentar').hidden = true;
  $('#mapaEstado').textContent = 'Etiquetas colocadas: 0 / 5';

  const banco = $('#bancoEtiquetas');
  banco.innerHTML = '';
  mezclar(ORDEN_CORRECTO).forEach(parte => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'etiqueta';
    b.dataset.parte = parte;
    b.textContent = ETIQUETAS_TEXTO[parte];
    banco.appendChild(b);
  });

  $all('.zona-noticia', $('#periodicoMapa')).forEach(zona => {
    zona.classList.remove('correcta', 'incorrecta');
    $('.zona-noticia__resultado', zona).textContent = '';
  });
}

function onBancoClick(e) {
  const btn = e.target.closest('.etiqueta');
  if (!btn || btn.classList.contains('usada')) return;
  $all('.etiqueta', $('#bancoEtiquetas')).forEach(b => b.classList.remove('seleccionada'));
  btn.classList.add('seleccionada');
  mapaSeleccion = btn.dataset.parte;
}

function onZonaClick(e) {
  const zona = e.target.closest('.zona-noticia');
  if (!zona || zona.classList.contains('correcta') || !mapaSeleccion) return;

  if (zona.dataset.parte === mapaSeleccion) {
    zona.classList.add('correcta');
    $('.zona-noticia__resultado', zona).textContent = '✅';
    const etiquetaBtn = $('.etiqueta.seleccionada', $('#bancoEtiquetas'));
    if (etiquetaBtn) { etiquetaBtn.classList.add('usada'); etiquetaBtn.classList.remove('seleccionada'); }
    mapaSeleccion = null;
    mapaColocadas++;
    $('#mapaEstado').textContent = 'Etiquetas colocadas: ' + mapaColocadas + ' / 5';
    if (mapaColocadas === 5) {
      completarMision('mapa', '¡Mapa completado!', 'Reconociste las 5 partes de la noticia del gato astronauta.', '🗺️');
    }
  } else {
    totalErrores++;
    zona.classList.remove('incorrecta');
    void zona.offsetWidth;
    zona.classList.add('incorrecta');
    $('.zona-noticia__resultado', zona).textContent = '❌';
    setTimeout(() => { if (!zona.classList.contains('correcta')) $('.zona-noticia__resultado', zona).textContent = ''; }, 700);
  }
}

/* =========================================================
   MISIÓN 2 · ROMPECABEZAS
   ========================================================= */

let puzzleRondaActual = 0;
let puzzleSeleccionIndex = null;
let puzzleOrdenActual = [];

function initRompecabezas() {
  puzzleRondaActual = 0;
  $('#rondaPuzzleTotal').textContent = String(PUZZLE_RONDAS.length);
  $('#puzzleComprobar').hidden = false;
  initRondaPuzzle(0);
}

function initRondaPuzzle(indice) {
  puzzleRondaActual = indice;
  puzzleSeleccionIndex = null;
  $('#rondaPuzzleActual').textContent = String(indice + 1);
  $('#puzzleEstado').textContent = '';
  $('#puzzleSiguiente').hidden = true;
  $('#puzzleComprobar').hidden = false;
  $('#puzzleComprobar').disabled = false;

  const ronda = PUZZLE_RONDAS[indice];
  let ordenIndices = mezclar([0, 1, 2, 3, 4]);
  // evitar que ya empiece resuelto
  if (ordenIndices.every((v, i) => v === i)) {
    ordenIndices = [ordenIndices[4], ordenIndices[1], ordenIndices[2], ordenIndices[3], ordenIndices[0]];
  }
  puzzleOrdenActual = ordenIndices;

  const lista = $('#listaPuzzle');
  lista.innerHTML = '';
  ordenIndices.forEach(originalIndex => {
    const parteClave = ORDEN_CORRECTO[originalIndex];
    const li = document.createElement('li');
    li.className = 'pieza-puzzle';
    li.dataset.original = String(originalIndex);
    li.innerHTML =
      '<span class="etiqueta-mini etiqueta-mini--' + parteClave + '">' + ETIQUETAS_TEXTO[parteClave].toUpperCase() + '</span>' +
      '<p>' + ronda.partes[parteClave] + '</p>';
    lista.appendChild(li);
  });
}

function onListaPuzzleClick(e) {
  const li = e.target.closest('.pieza-puzzle');
  if (!li || li.classList.contains('correcta')) return;
  const lista = $('#listaPuzzle');
  const items = $all('.pieza-puzzle', lista);
  const indexClic = items.indexOf(li);

  if (puzzleSeleccionIndex === null) {
    puzzleSeleccionIndex = indexClic;
    li.classList.add('seleccionada');
    return;
  }
  if (puzzleSeleccionIndex === indexClic) {
    li.classList.remove('seleccionada');
    puzzleSeleccionIndex = null;
    return;
  }
  const liSeleccionada = items[puzzleSeleccionIndex];
  liSeleccionada.classList.remove('seleccionada');

  // Intercambiar posiciones en el DOM
  const marcador = document.createComment('marcador');
  lista.insertBefore(marcador, li);
  lista.insertBefore(li, liSeleccionada);
  lista.insertBefore(liSeleccionada, marcador);
  lista.removeChild(marcador);

  puzzleSeleccionIndex = null;
}

function comprobarPuzzle() {
  const items = $all('.pieza-puzzle', $('#listaPuzzle'));
  let correctas = 0;
  items.forEach((li, posicion) => {
    const original = Number(li.dataset.original);
    if (original === posicion) {
      li.classList.add('correcta');
      li.classList.remove('seleccionada');
      correctas++;
    } else {
      li.classList.remove('correcta');
    }
  });

  if (correctas === items.length) {
    $('#puzzleEstado').textContent = '¡Perfecto! La noticia quedó en el orden correcto. 🎉';
    $('#puzzleComprobar').hidden = true;
    if (puzzleRondaActual < PUZZLE_RONDAS.length - 1) {
      $('#puzzleSiguiente').hidden = false;
    } else {
      completarMision('rompecabezas', '¡Rompecabezas resuelto!', 'Armaste las 2 noticias graciosas en el orden correcto.', '🧩');
    }
  } else {
    totalErrores++;
    $('#puzzleEstado').textContent = 'Ya tenés ' + correctas + ' de ' + items.length + ' piezas en su lugar (marcadas en verde). ¡Seguí intercambiando las demás!';
  }
}

function siguientePuzzle() {
  if (puzzleRondaActual < PUZZLE_RONDAS.length - 1) {
    initRondaPuzzle(puzzleRondaActual + 1);
  }
}

/* =========================================================
   MISIÓN 3 · CAZATÍTULOS
   ========================================================= */

let titularRondaActual = 0;

function initTitular() {
  titularRondaActual = 0;
  $('#rondaTitularTotal').textContent = String(TITULAR_RONDAS.length);
  initRondaTitular(0);
}

function initRondaTitular(indice) {
  titularRondaActual = indice;
  const ronda = TITULAR_RONDAS[indice];
  $('#rondaTitularActual').textContent = String(indice + 1);
  $('#copeteTexto').textContent = ronda.copete;
  $('#titularEstado').textContent = '';
  $('#titularSiguiente').hidden = true;

  const contenedor = $('#opcionesTitular');
  contenedor.innerHTML = '';
  mezclar(ronda.opciones).forEach(opcion => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'opcion-titular';
    b.textContent = opcion.texto;
    b.dataset.correcta = opcion.correcta ? '1' : '0';
    contenedor.appendChild(b);
  });
}

function onOpcionesTitularClick(e) {
  const btn = e.target.closest('.opcion-titular');
  if (!btn) return;
  const contenedor = $('#opcionesTitular');
  const botones = $all('.opcion-titular', contenedor);
  botones.forEach(b => (b.disabled = true));

  if (btn.dataset.correcta === '1') {
    btn.classList.add('correcta');
    $('#titularEstado').textContent = '¡Exacto! Ese titular resume perfecto la noticia. ✅';
  } else {
    totalErrores++;
    btn.classList.add('incorrecta');
    const correcto = botones.find(b => b.dataset.correcta === '1');
    if (correcto) correcto.classList.add('correcta');
    $('#titularEstado').textContent = 'Casi... ¡el titular correcto se marcó en verde!';
  }

  if (titularRondaActual < TITULAR_RONDAS.length - 1) {
    $('#titularSiguiente').hidden = false;
  } else {
    completarMision('titular', '¡Cazatítulos completado!', 'Elegiste titular para las 4 noticias. ¡Buen ojo periodístico!', '🎯');
  }
}

function siguienteTitular() {
  if (titularRondaActual < TITULAR_RONDAS.length - 1) {
    initRondaTitular(titularRondaActual + 1);
  }
}

/* =========================================================
   MISIÓN 4 · REDACTORES LOCOS
   ========================================================= */

function initCopete() {
  const cont = $('#titularesLocos');
  cont.innerHTML = '';
  TITULARES_LOCOS.forEach(texto => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'titular-loco';
    b.textContent = texto;
    cont.appendChild(b);
  });
  $('#zonaEscritura').hidden = true;
  $('#copeteInput').value = '';
  $('#copeteInput').disabled = false;
  $('#contadorCopete').textContent = '0 caracteres';
  $all('.check-copete').forEach(c => { c.checked = false; c.disabled = false; });
  $('#publicarCopete').disabled = true;
  $('#publicarCopete').textContent = 'Publicar mi noticia';
  $('#copeteEstado').textContent = '';
}

function onTitularesLocosClick(e) {
  const btn = e.target.closest('.titular-loco');
  if (!btn) return;
  $all('.titular-loco', $('#titularesLocos')).forEach(b => b.classList.remove('elegido'));
  btn.classList.add('elegido');
  $('#tituloElegidoTexto').textContent = btn.textContent;
  $('#zonaEscritura').hidden = false;
  $('#copeteInput').focus();
}

function actualizarEstadoPublicar() {
  const largo = $('#copeteInput').value.trim().length;
  $('#contadorCopete').textContent = largo + ' caracteres';
  const todosMarcados = $all('.check-copete').every(c => c.checked);
  $('#publicarCopete').disabled = !(largo >= 25 && todosMarcados);
}

function publicarCopete() {
  $('#copeteInput').disabled = true;
  $all('.check-copete').forEach(c => (c.disabled = true));
  $('#publicarCopete').disabled = true;
  $('#publicarCopete').textContent = '¡Publicada! 🎉';
  $('#copeteEstado').textContent = 'Tu noticia salió publicada en El Diario Curioso.';
  completarMision('copete', '¡Copete publicado!', 'Redactaste el copete de una noticia disparatada. ¡Gran trabajo, redactor/a!', '✍️');
}

/* =========================================================
   CONFETI
   ========================================================= */

function lanzarConfeti() {
  const canvas = $('#canvasConfeti');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colores = ['#ffc93c', '#e4572e', '#7b61ff', '#4caf87', '#2ec4b6'];
  const particulas = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.3,
    r: 4 + Math.random() * 5,
    color: colores[Math.floor(Math.random() * colores.length)],
    vy: 2 + Math.random() * 3,
    vx: -2 + Math.random() * 4,
    rot: Math.random() * Math.PI,
    vrot: -0.2 + Math.random() * 0.4
  }));

  const inicio = performance.now();
  const duracion = 2200;

  function frame(t) {
    const transcurrido = t - inicio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particulas.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    });
    if (transcurrido < duracion) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(frame);
}

window.addEventListener('resize', () => {
  const canvas = $('#canvasConfeti');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

/* =========================================================
   INICIALIZACIÓN GENERAL
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initLeyenda();
  initNavegacion();
  actualizarBarra();

  $('#bancoEtiquetas').addEventListener('click', onBancoClick);
  $('#periodicoMapa').addEventListener('click', onZonaClick);
  $('#mapaReintentar').addEventListener('click', initMapa);

  $('#listaPuzzle').addEventListener('click', onListaPuzzleClick);
  $('#puzzleComprobar').addEventListener('click', comprobarPuzzle);
  $('#puzzleSiguiente').addEventListener('click', siguientePuzzle);

  $('#opcionesTitular').addEventListener('click', onOpcionesTitularClick);
  $('#titularSiguiente').addEventListener('click', siguienteTitular);

  $('#titularesLocos').addEventListener('click', onTitularesLocosClick);
  $('#copeteInput').addEventListener('input', actualizarEstadoPublicar);
  $all('.check-copete').forEach(c => c.addEventListener('change', actualizarEstadoPublicar));
  $('#publicarCopete').addEventListener('click', publicarCopete);
});
