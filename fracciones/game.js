/* =========================================================
   CHEF DE FRACCIONES — lógica del juego
   ========================================================= */

/* ---------- Estado y persistencia ---------- */
const STORAGE_KEY = 'chefDeFracciones_v1';
const TOTAL_STEPS = 15; // 3 (mision1) + 6 (mision2) + 6 (mision3)
const POINTS_PER_STEP = 10;

function defaultState(){
  return {
    points: 0,
    m1: { done: 0, total: 3, answered: {} },
    m2: { done: 0, total: 6, solved: {} },
    m3: { done: 0, total: 6, answered: {} },
    badges: []
  };
}

let state = loadState();

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // fusiona con default por si agregamos campos nuevos en el futuro
    return Object.assign(defaultState(), parsed);
  }catch(e){
    return defaultState();
  }
}

function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch(e){ /* almacenamiento no disponible: seguimos igual en memoria */ }
}

function totalDone(){ return state.m1.done + state.m2.done + state.m3.done; }

/* ---------- Utilidades SVG: pizza en porciones ---------- */
function polarToCartesian(cx, cy, r, angleDeg){
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function sectorPath(cx, cy, r, startAngle, endAngle){
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = (endAngle - startAngle) <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
}

/**
 * Crea una pizza SVG dividida en n porciones.
 * filledSet: Set de índices (0-based) pintados con queso.
 * onSliceClick(index): callback opcional -> hace las porciones clickeables.
 */
function buildPizzaSVG(n, filledSet, onSliceClick){
  const size = 220, cx = size/2, cy = size/2, r = 96;
  const anglePer = 360 / n;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'pizza-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Pizza dividida en ${n} porciones, ${filledSet.size} pintadas`);

  for(let i=0; i<n; i++){
    const start = i * anglePer;
    const end = start + anglePer;
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', sectorPath(cx, cy, r, start, end));
    path.setAttribute('class', 'slice' + (filledSet.has(i) ? ' filled' : '') + (onSliceClick ? ' clickable' : ''));
    path.setAttribute('data-index', i);
    if(onSliceClick){
      path.addEventListener('click', () => onSliceClick(i));
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); onSliceClick(i); }
      });
    }
    svg.appendChild(path);

    // un par de "pepperonis" decorativos si la porción está pintada
    if(filledSet.has(i)){
      const mid = start + anglePer/2;
      [0.55, 0.75].forEach((frac, idx) => {
        const p = polarToCartesian(cx, cy, r*frac, mid + (idx===0 ? -6 : 6));
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', p.x.toFixed(2));
        dot.setAttribute('cy', p.y.toFixed(2));
        dot.setAttribute('r', 5);
        dot.setAttribute('class', 'pepperoni');
        dot.style.pointerEvents = 'none';
        svg.appendChild(dot);
      });
    }
  }

  const ring = document.createElementNS(ns, 'circle');
  ring.setAttribute('cx', cx); ring.setAttribute('cy', cy); ring.setAttribute('r', r);
  ring.setAttribute('class', 'crust-ring');
  ring.style.pointerEvents = 'none';
  svg.appendChild(ring);

  return svg;
}

/* ---------- Navegación entre secciones ---------- */
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

function showSection(id){
  sections.forEach(s => s.classList.toggle('active', s.id === 'sec-' + id));
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.section === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => showSection(btn.dataset.section));
});

document.getElementById('btnEmpezar').addEventListener('click', () => showSection('aprender'));
document.getElementById('btnIrMision1').addEventListener('click', () => showSection('mision1'));

/* ---------- Barra de progreso e insignias ---------- */
function updateProgressUI(){
  const percent = Math.round((totalDone() / TOTAL_STEPS) * 100);
  document.getElementById('progressPercent').textContent = percent + '%';
  document.getElementById('starsCount').textContent = state.points;
  const ring = document.getElementById('progressRing');
  ring.style.background = `conic-gradient(var(--cheese) ${percent * 3.6}deg, rgba(255,255,255,0.25) 0deg)`;
  document.getElementById('progressEmoji').textContent = percent >= 100 ? '🏆' : '🍕';
}

const BADGES = [
  {
    id: 'aprendiz', name: 'Aprendiz Pizzero', icon: '🧑‍🍳',
    desc: 'Completaste la Misión 1 y ya sabés reconocer el numerador y el denominador.',
    condition: () => state.m1.done >= state.m1.total
  },
  {
    id: 'maestro', name: 'Maestro Pizzero', icon: '🍕',
    desc: 'Representaste todas las fracciones cortando y pintando pizzas en la Misión 2.',
    condition: () => state.m2.done >= state.m2.total
  },
  {
    id: 'resolvedor', name: 'Resolvedor Estrella', icon: '⭐',
    desc: 'Resolviste todos los pedidos de la Misión 3. ¡Gran trabajo con los problemas!',
    condition: () => state.m3.done >= state.m3.total
  },
  {
    id: 'campeon', name: 'Campeón de Fracciones', icon: '🏆',
    desc: 'Completaste todo el recetario de la pizzería. ¡Sos un verdadero campeón de las fracciones!',
    condition: () => totalDone() >= TOTAL_STEPS
  }
];

function renderBadgesGrid(){
  const grid = document.getElementById('badgesGrid');
  grid.innerHTML = '';
  BADGES.forEach(b => {
    const unlocked = state.badges.includes(b.id);
    const card = document.createElement('div');
    card.className = 'badge-card' + (unlocked ? '' : ' locked');
    card.innerHTML = `
      <span class="badge-icon">${b.icon}</span>
      <h3>${b.name}</h3>
      <p>${b.desc}</p>
      <span class="${unlocked ? 'badge-unlocked-tag' : 'badge-lock-tag'}">${unlocked ? 'Desbloqueada' : 'Bloqueada'}</span>
    `;
    grid.appendChild(card);
  });
}

function launchConfetti(){
  const layer = document.getElementById('confettiLayer');
  const colors = ['#E8483A', '#FFC145', '#4C9A5B', '#3C6E71'];
  for(let i=0; i<28; i++){
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random()*100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random()*colors.length)];
    piece.style.animationDuration = (2 + Math.random()*1.5) + 's';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 3800);
  }
}

function showBadgeModal(badge){
  document.getElementById('modalBadgeIcon').textContent = badge.icon;
  document.getElementById('modalBadgeTitle').textContent = badge.name;
  document.getElementById('modalBadgeDesc').textContent = badge.desc;
  document.getElementById('badgeModal').classList.remove('hidden');
  launchConfetti();
}
document.getElementById('modalCloseBtn').addEventListener('click', () => {
  document.getElementById('badgeModal').classList.add('hidden');
});

function checkBadges(){
  let unlockedNew = null;
  BADGES.forEach(b => {
    if(!state.badges.includes(b.id) && b.condition()){
      state.badges.push(b.id);
      unlockedNew = b;
    }
  });
  if(unlockedNew){
    saveState();
    showBadgeModal(unlockedNew);
  }
  renderBadgesGrid();
}

function addPoints(n){
  state.points += n;
  saveState();
  updateProgressUI();
}

/* =========================================================
   APRENDER — demo interactiva de numerador/denominador
   ========================================================= */
let learnDen = 6;
let learnNum = 0;

function renderLearnPizza(){
  const stage = document.getElementById('learnPizzaStage');
  stage.innerHTML = '';
  const filled = new Set();
  for(let i=0; i<learnNum; i++) filled.add(i);
  stage.appendChild(buildPizzaSVG(learnDen, filled, null));
}

function updateLearnUI(){
  document.getElementById('fracNumBig').textContent = learnNum;
  document.getElementById('fracDenBig').textContent = learnDen;
  document.getElementById('learnReadout').innerHTML =
    `Te comiste <strong>${learnNum}</strong> de <strong>${learnDen}</strong> porciones. Eso es la fracción <strong>${learnNum}/${learnDen}</strong> de la pizza.`;
  renderLearnPizza();
}

document.querySelectorAll('#denChooser .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#denChooser .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    learnDen = Number(chip.dataset.den);
    const slider = document.getElementById('numSlider');
    slider.max = learnDen;
    if(learnNum > learnDen) learnNum = learnDen;
    slider.value = learnNum;
    updateLearnUI();
  });
});

document.getElementById('numSlider').addEventListener('input', (e) => {
  learnNum = Number(e.target.value);
  updateLearnUI();
});

/* =========================================================
   MISIÓN 1 — reconocer numerador / denominador / fracción
   ========================================================= */
const M1_QUESTIONS = [
  {
    n: 6, filled: 4,
    question: '¿Cuántas porciones tiene la pizza en total?',
    options: ['4', '6', '8', '10'],
    correct: '6',
    explain: 'La pizza está cortada en 6 porciones: ese número es el denominador.'
  },
  {
    n: 8, filled: 3,
    question: '¿Cuántas porciones están cubiertas con queso (comidas)?',
    options: ['2', '3', '5', '8'],
    correct: '3',
    explain: 'Hay 3 porciones pintadas con queso: ese número es el numerador.'
  },
  {
    n: 5, filled: 2,
    question: 'Mirando la pizza, ¿qué fracción representa la parte pintada?',
    options: ['5/2', '3/5', '2/5', '2/3'],
    correct: '2/5',
    explain: 'Se pintaron 2 porciones de las 5 totales, por eso es 2/5.'
  }
];

function renderMission1(){
  renderMissionDots('m1Progress', state.m1.done, state.m1.total);
  const container = document.getElementById('m1Content');
  container.innerHTML = '';

  if(state.m1.done >= state.m1.total){
    container.appendChild(buildMissionCompleteCard(
      '🧑‍🍳', '¡Misión 1 completa!',
      'Ya sabés distinguir el numerador del denominador. ¡A representar fracciones en la Misión 2!',
      () => showSection('mision2')
    ));
    return;
  }

  const qIndex = state.m1.done; // siguiente pregunta pendiente
  const q = M1_QUESTIONS[qIndex];
  const block = document.createElement('div');
  block.className = 'question-block';

  const visual = document.createElement('div');
  visual.className = 'question-visual';
  const filledSet = new Set(Array.from({length: q.filled}, (_, i) => i));
  visual.appendChild(buildPizzaSVG(q.n, filledSet, null));
  block.appendChild(visual);

  const body = document.createElement('div');
  body.className = 'question-body';
  body.innerHTML = `<h3>Pedido ${qIndex+1} de ${M1_QUESTIONS.length}: ${q.question}</h3>`;

  const optionsGrid = document.createElement('div');
  optionsGrid.className = 'options-grid';
  const feedback = document.createElement('div');
  feedback.className = 'feedback';

  q.options.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'option-btn';
    b.textContent = opt;
    b.addEventListener('click', () => {
      const isCorrect = opt === q.correct;
      Array.from(optionsGrid.children).forEach(c => c.disabled = true);
      if(isCorrect){
        b.classList.add('correct');
        feedback.className = 'feedback correct show';
        feedback.textContent = '¡Correcto! ' + q.explain;
        if(!state.m1.answered[qIndex]){
          state.m1.answered[qIndex] = true;
          state.m1.done++;
          addPoints(POINTS_PER_STEP);
          checkBadges();
        }
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn-primary';
        nextBtn.style.marginTop = '10px';
        nextBtn.textContent = state.m1.done >= state.m1.total ? 'Ver resumen 🎉' : 'Siguiente pedido →';
        nextBtn.addEventListener('click', renderMission1);
        body.appendChild(nextBtn);
      } else {
        b.classList.add('wrong');
        feedback.className = 'feedback wrong show';
        feedback.textContent = 'No es esa. Volvé a mirar la pizza y probá de nuevo.';
        setTimeout(() => {
          Array.from(optionsGrid.children).forEach(c => { if(!c.classList.contains('correct')) c.disabled = false; });
          b.classList.remove('wrong');
        }, 900);
      }
    });
    optionsGrid.appendChild(b);
  });

  body.appendChild(optionsGrid);
  body.appendChild(feedback);
  block.appendChild(body);
  container.appendChild(block);
}

/* =========================================================
   MISIÓN 2 — representar fracciones pintando porciones
   ========================================================= */
const M2_ROUNDS = [
  { n: 4, num: 1 },
  { n: 4, num: 3 },
  { n: 6, num: 2 },
  { n: 6, num: 5 },
  { n: 8, num: 3 },
  { n: 5, num: 4 }
];

let m2Selection = new Set();

function renderMission2(){
  renderMissionDots('m2Progress', state.m2.done, state.m2.total);
  const container = document.getElementById('m2Content');
  container.innerHTML = '';

  if(state.m2.done >= state.m2.total){
    container.appendChild(buildMissionCompleteCard(
      '🍕', '¡Misión 2 completa!',
      'Sabés representar fracciones cortando y pintando pizzas. ¡Ahora a resolver pedidos en la Misión 3!',
      () => showSection('mision3')
    ));
    return;
  }

  const roundIndex = state.m2.done;
  const round = M2_ROUNDS[roundIndex];
  m2Selection = new Set();

  const block = document.createElement('div');
  block.className = 'question-block';

  const visual = document.createElement('div');
  visual.className = 'question-visual';
  let svgHost = document.createElement('div');
  visual.appendChild(svgHost);
  block.appendChild(visual);

  function redrawPizza(){
    svgHost.innerHTML = '';
    svgHost.appendChild(buildPizzaSVG(round.n, m2Selection, (i) => {
      if(m2Selection.has(i)) m2Selection.delete(i); else m2Selection.add(i);
      redrawPizza();
      updateCountReadout();
    }));
  }

  const body = document.createElement('div');
  body.className = 'question-body';

  const target = document.createElement('div');
  target.className = 'target-fraction';
  target.innerHTML = `<span>${round.num}</span><span class="frac-line"></span><span>${round.n}</span>`;

  const title = document.createElement('h3');
  title.textContent = `Pedido ${roundIndex+1} de ${M2_ROUNDS.length}: pintá ${round.num} de ${round.n} porciones para representar ${round.num}/${round.n}.`;

  const readout = document.createElement('p');
  readout.className = 'learn-readout';
  function updateCountReadout(){
    readout.innerHTML = `Pintaste <strong>${m2Selection.size}</strong> de ${round.n} porciones.`;
  }
  updateCountReadout();

  const feedback = document.createElement('div');
  feedback.className = 'feedback';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn-primary';
  confirmBtn.textContent = 'Confirmar porciones';
  confirmBtn.addEventListener('click', () => {
    if(m2Selection.size === round.num){
      feedback.className = 'feedback correct show';
      feedback.textContent = `¡Perfecto! Esa pizza representa la fracción ${round.num}/${round.n}.`;
      confirmBtn.disabled = true;
      if(!state.m2.solved[roundIndex]){
        state.m2.solved[roundIndex] = true;
        state.m2.done++;
        addPoints(POINTS_PER_STEP);
        checkBadges();
      }
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn-primary';
      nextBtn.style.marginLeft = '10px';
      nextBtn.textContent = state.m2.done >= state.m2.total ? 'Ver resumen 🎉' : 'Siguiente pedido →';
      nextBtn.addEventListener('click', renderMission2);
      body.appendChild(nextBtn);
    } else if(m2Selection.size < round.num){
      feedback.className = 'feedback wrong show';
      feedback.textContent = `Te faltan porciones: necesitás pintar ${round.num - m2Selection.size} más.`;
    } else {
      feedback.className = 'feedback wrong show';
      feedback.textContent = `Pintaste de más: sacá ${m2Selection.size - round.num} porción(es).`;
    }
  });

  body.appendChild(target);
  body.appendChild(title);
  body.appendChild(readout);
  body.appendChild(feedback);
  body.appendChild(confirmBtn);
  block.appendChild(body);
  container.appendChild(block);

  redrawPizza();
}

/* =========================================================
   MISIÓN 3 — problemas sencillos de fracciones
   ========================================================= */
const M3_PROBLEMS = [
  {
    text: 'Sofía comió 2/4 de una pizza y su hermano comió 1/4 de la misma pizza. ¿Qué fracción de la pizza comieron entre los dos?',
    options: ['2/8', '1/2', '3/4', '3/8'],
    correct: '3/4',
    explain: 'Como el denominador es el mismo, se suman los numeradores: 2/4 + 1/4 = 3/4.'
  },
  {
    text: 'Un chocolate se dividió en 8 partes iguales. Juan comió 3 partes. ¿Qué fracción del chocolate comió Juan?',
    options: ['8/3', '3/5', '3/8', '5/8'],
    correct: '3/8',
    explain: 'Comió 3 de las 8 partes totales, entonces la fracción es 3/8.'
  },
  {
    text: 'Hay 6 empanadas en una bandeja y 2 son de carne. ¿Qué fracción de las empanadas son de carne?',
    options: ['6/2', '4/6', '1/6', '2/6'],
    correct: '2/6',
    explain: 'Hay 2 empanadas de carne de un total de 6, por eso la fracción es 2/6.'
  },
  {
    text: 'Dos amigos comparten la misma pizza. ¿Cuál porción es mayor: 1/2 o 1/4 de esa pizza?',
    options: ['1/2', '1/4', 'Son iguales', 'No se puede saber'],
    correct: '1/2',
    explain: 'Si dividís una pizza en 2 partes, cada parte es más grande que si la dividís en 4.'
  },
  {
    text: 'En una fiesta hay 10 alfajores. Si repartís 3/10 entre los invitados, ¿cuántos alfajores repartiste?',
    options: ['3', '7', '10', '13'],
    correct: '3',
    explain: '3/10 de 10 alfajores significa tomar 3 de las 10 partes, o sea, 3 alfajores.'
  },
  {
    text: 'Marcos pintó 5 de las 6 porciones de una pizza. ¿Qué fracción de la pizza NO pintó?',
    options: ['5/6', '1/6', '1/5', '6/5'],
    correct: '1/6',
    explain: 'Si la pizza tiene 6 porciones y pintó 5, queda 1 porción sin pintar: 1/6.'
  }
];

function renderMission3(){
  renderMissionDots('m3Progress', state.m3.done, state.m3.total);
  const container = document.getElementById('m3Content');
  container.innerHTML = '';

  if(state.m3.done >= state.m3.total){
    container.appendChild(buildMissionCompleteCard(
      '⭐', '¡Misión 3 completa!',
      'Resolviste todos los pedidos de la pizzería usando fracciones. ¡Revisá tus insignias!',
      () => showSection('insignias')
    ));
    return;
  }

  const pIndex = state.m3.done;
  const p = M3_PROBLEMS[pIndex];

  const body = document.createElement('div');
  body.className = 'question-body';
  body.innerHTML = `<h3>Pedido ${pIndex+1} de ${M3_PROBLEMS.length}: ${p.text}</h3>`;

  const optionsGrid = document.createElement('div');
  optionsGrid.className = 'options-grid';
  const feedback = document.createElement('div');
  feedback.className = 'feedback';

  p.options.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'option-btn';
    b.textContent = opt;
    b.addEventListener('click', () => {
      const isCorrect = opt === p.correct;
      Array.from(optionsGrid.children).forEach(c => c.disabled = true);
      if(isCorrect){
        b.classList.add('correct');
        feedback.className = 'feedback correct show';
        feedback.textContent = '¡Correcto! ' + p.explain;
        if(!state.m3.answered[pIndex]){
          state.m3.answered[pIndex] = true;
          state.m3.done++;
          addPoints(POINTS_PER_STEP);
          checkBadges();
        }
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn-primary';
        nextBtn.style.marginTop = '10px';
        nextBtn.textContent = state.m3.done >= state.m3.total ? 'Ver resumen 🎉' : 'Siguiente pedido →';
        nextBtn.addEventListener('click', renderMission3);
        body.appendChild(nextBtn);
      } else {
        b.classList.add('wrong');
        feedback.className = 'feedback wrong show';
        feedback.textContent = 'No es esa. Volvé a leer el pedido con atención.';
        setTimeout(() => {
          Array.from(optionsGrid.children).forEach(c => { if(!c.classList.contains('correct')) c.disabled = false; });
          b.classList.remove('wrong');
        }, 900);
      }
    });
    optionsGrid.appendChild(b);
  });

  body.appendChild(optionsGrid);
  body.appendChild(feedback);
  container.appendChild(body);
}

/* ---------- helpers compartidos entre misiones ---------- */
function renderMissionDots(containerId, done, total){
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  for(let i=0; i<total; i++){
    const dot = document.createElement('span');
    dot.className = 'dot' + (i < done ? ' done' : (i === done ? ' current' : ''));
    el.appendChild(dot);
  }
}

function buildMissionCompleteCard(emoji, title, text, onNext){
  const card = document.createElement('div');
  card.className = 'mission-complete';
  card.innerHTML = `
    <span class="big-emoji">${emoji}</span>
    <h3>${title}</h3>
    <p>${text}</p>
  `;
  const btn = document.createElement('button');
  btn.className = 'btn-primary';
  btn.textContent = 'Continuar →';
  btn.addEventListener('click', onNext);
  card.appendChild(btn);
  return card;
}

/* =========================================================
   Inicialización
   ========================================================= */
function init(){
  updateProgressUI();
  renderBadgesGrid();
  updateLearnUI();
  renderMission1();
  renderMission2();
  renderMission3();
}

init();
