/* ===== La aventura de las divisiones — toda la lógica =====
   Módulos: 1 Datos · 2 Progreso · 3 Matemática · 4 Interfaz · 5 Tablas · 6 Aprende · 7 Practica · 8 Insignias/Ajustes */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const mezclar = a => [...a].sort(() => Math.random() - .5);
const SECC = [['inicio','🏠','Inicio'],['t1','✖️','Tablas de 1 cifra'],['t2','🔢','Tablas de 2 cifras'],
  ['aprende','📘','Aprende a dividir'],['practica','✏️','Practica divisiones'],['insignias','🏅','Mis insignias'],['config','⚙️','Ajustes']];

/* ---------- 1. INSIGNIAS (p = progreso [actual, meta]; se desbloquea cuando actual >= meta) ---------- */
const INS = [
 {id:'tablas',n:'Maestro de las tablas',i:'📚',d:'Acierta 8 o más preguntas en un desafío de 10 de tablas.',p:e=>[e.rondaTablas?1:0,1]},
 {id:'explorador',n:'Explorador de divisiones',i:'🧭',d:'Completa tu primer tutorial.',p:e=>[e.tutA||e.tutB?1:0,1]},
 {id:'restas',n:'Experto en restas',i:'➖',d:'Completa el tutorial de restas sucesivas.',p:e=>[e.tutA?1:0,1]},
 {id:'veloz',n:'Mente veloz',i:'⚡',d:'Resuelve 5 divisiones seguidas al primer intento y sin pistas.',p:e=>[Math.min(e.mejorRacha,5),5]},
 {id:'gran',n:'Gran divisor',i:'🪐',d:'Completa 10 divisiones de tres cifras.',p:e=>[Math.min(e.d3,10),10]},
 {id:'campeon',n:'Campeón de cuatro cifras',i:'🏆',d:'Completa 10 divisiones con dividendos de cuatro cifras.',p:e=>[Math.min(e.d4,10),10]},
 {id:'resto',n:'Rey del resto',i:'👑',d:'Resuelve 5 divisiones con resto.',p:e=>[Math.min(e.resto,5),5]},
 {id:'perseverancia',n:'Perseverancia',i:'💪',d:'Completa 20 ejercicios, sin importar los intentos.',p:e=>[Math.min(e.hechos,20),20]},
 {id:'coleccionista',n:'Coleccionista',i:'🎒',d:'Desbloquea 5 insignias.',p:e=>[Math.min(e.insignias.length,5),5]},
 {id:'genio',n:'Genio',i:'🌟',d:'Completa todas las demás insignias.',p:e=>[e.insignias.filter(x=>x!=='genio').length,9]}];

/* ---------- 2. PROGRESO (estado separado de la interfaz) ---------- */
const KEY = 'aventuraDivisiones_v1';
const BASE = {estrellas:0,insignias:[],hechos:0,aciertos:0,errores:0,racha:0,mejorRacha:0,tutA:false,tutB:false,
  mejor10:0,rondaTablas:false,d3:0,d4:0,resto:0,calmado:false};
let almacenOk = true;
try { localStorage.setItem(KEY+'_t','1'); localStorage.removeItem(KEY+'_t'); } catch (x) { almacenOk = false; }
function cargar() { // valida cada dato antes de usarlo
  const e = {...BASE, insignias:[]};
  try {
    const r = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (r && typeof r === 'object') for (const k in BASE) {
      if (k === 'insignias') { if (Array.isArray(r[k])) e[k] = r[k].filter(x => INS.some(i => i.id === x)); }
      else if (typeof BASE[k] === 'number') { if (Number.isInteger(r[k]) && r[k] >= 0) e[k] = r[k]; }
      else if (typeof r[k] === 'boolean') e[k] = r[k];
    }
  } catch (x) {}
  return e;
}
let E = cargar();
function guardar() { try { localStorage.setItem(KEY, JSON.stringify(E)); } catch (x) { almacenOk = false; } }
const progreso = () => Math.round((E.insignias.length/10*.5 + Math.min(E.hechos,50)/50*.5) * 100);
function revisarInsignias() { // desbloqueo automático, sin duplicados
  let nuevo = true;
  while (nuevo) { nuevo = false;
    for (const i of INS) if (!E.insignias.includes(i.id)) { const [p,m] = i.p(E);
      if (p >= m) { E.insignias.push(i.id); nuevo = true; aviso(`🎉 ¡Nueva insignia! ${i.i} <b>${i.n}</b>`); } } }
}
function persistir() { revisarInsignias(); guardar(); actualizarTop(); }

/* ---------- 3. MATEMÁTICA ---------- */
function genEj(nv, usados) { // genera división válida: divisor 10-99, dividendo ≤ 4 cifras, sin repetir
  const [a0, b0] = {1:[10,99],2:[100,999],3:[1000,9999],4:[10,9999]}[nv];
  for (let t = 0; t < 500; t++) {
    const d = rnd(10, 99), exacto = Math.random() < (nv === 4 ? .5 : .3); let n;
    if (exacto) { const a = Math.ceil(Math.max(a0, d)/d), b = Math.floor(b0/d); if (a > b) continue; n = d*rnd(a, b); }
    else { n = rnd(Math.max(a0, d), b0); if (n % d === 0) continue; }
    const k = n+'/'+d; if (usados.has(k)) continue; usados.add(k);
    return {n, d, q:Math.floor(n/d), r:n%d};
  }
  return {n:156, d:12, q:13, r:0};
}
// Dividendo con arco sobre las cifras usadas; si s.tap, la última cifra del arco queda "tapada"
function divHTML(n, s) {
  const t = String(n), g = Math.min(s.g, t.length), x = t.slice(0, g);
  return (g ? `<span class="arco">${s.tap ? x.slice(0, -1) + `<span class="cub">${x.slice(-1)}</span>` : x}</span>` : '') + t.slice(g);
}
// División tradicional paso a paso (según las láminas de referencia): arco, tapar la última cifra,
// comparar con la primera cifra del divisor, multiplicar, restar y bajar la cifra siguiente.
function pasosA(n, d) {
  const ds = String(n).split('').map(Number), c1 = Math.floor(d/10), S = []; let i = 0, cur = ds[0], q = '', l = [], rem;
  const add = (t, o = {}) => S.push({t, q, l:[...l], g:i+1, tap:false, aux:'', ...o});
  add(`Escribimos ${n} ÷ ${d} en la casita de la división.`, {g:0});
  while (cur < d && i < ds.length-1) { i++; cur = cur*10 + ds[i]; }
  add(`Separamos con un arco el primer número del dividendo que es mayor o igual que el divisor: ${cur}.`);
  for (;;) {
    if (cur < d) { add(`${cur} es menor que ${d}: no cabe. Escribimos 0 en el cociente.`); q += '0'; rem = cur; }
    else {
      const top = Math.floor(cur/10); let e = Math.min(9, Math.floor(top/c1));
      add(`Tapamos la última cifra (${cur%10}). Miramos ${top} y la primera cifra del divisor, ${c1}. ¿Qué número multiplicado por ${c1} se acerca a ${top}? Probamos con ${e}.`, {tap:true});
      while (d*e > cur) { add(`${d} × ${e} = ${d*e} se pasa de ${cur}. Probamos con ${e-1}.`, {tap:true}); e--; }
      l.push(`− ${d*e}`);
      add(`Multiplicamos: ${e} × ${d%10} = ${e*(d%10)} y ${e} × ${c1} decenas = ${e*c1*10}. En total ${d} × ${e} = ${d*e}.`, {aux:`${e} × ${d%10} = ${e*(d%10)}<br>${e} × ${c1}0 = ${e*c1*10}<br>———<br>${d} × ${e} = ${d*e}`});
      rem = cur - d*e; q += e; l.push(String(rem));
      add(`Restamos: ${cur} − ${d*e} = ${rem}. Anotamos ${e} en el cociente. ${rem} es menor que ${d}: ¡bien!`);
    }
    if (i >= ds.length-1) break;
    i++; cur = rem*10 + ds[i]; if (l.length) l[l.length-1] = String(cur);
    add(`Bajamos la cifra ${ds[i]}: ahora tenemos ${cur}.`);
  }
  const Q = Number(q); q = String(Q);
  add(`¡Terminamos! Cociente ${Q}, resto ${rem}. Comprobamos: ${d} × ${Q} + ${rem} = ${n}. Cerramos la división con un arco al revés.`, {g:ds.length});
  return S;
}

/* ---------- 4. INTERFAZ COMÚN ---------- */
const vista = $('#vista'); let sec = 'inicio', timer = null;
const decir = () => {}; // (el personaje guía se eliminó; se deja vacía para no tocar las llamadas)
function aviso(t) { const a = $('#aviso');
  if (a.hidden) a.innerHTML = '<button data-a="cerrarAviso">Entendido</button>';
  a.insertAdjacentHTML('afterbegin', `<p>${t}</p>`); a.hidden = false; }
function actualizarTop() {
  $('#estr').textContent = '⭐ ' + E.estrellas; $('#barra').style.width = progreso() + '%';
  $('#pct').textContent = progreso() + '%'; $('#pb').setAttribute('aria-valuenow', progreso());
  document.body.classList.toggle('calmado', E.calmado);
}
function pintarMenu() {
  $('#menu').innerHTML = SECC.map(s => `<button data-a="ir" data-v="${s[0]}" ${s[0]===sec?'aria-current="page"':''}>${s[1]} ${s[2]}</button>`).join('');
}
const tdiv = (n, d, co, l = []) => `<div class="tdiv"><div class="dd" aria-label="Dividendo">${n}</div><div class="dv" aria-label="Divisor">${d}</div>
  <div class="work">${l.map(x => `<div class="lin">${x}</div>`).join('')}</div><div class="co" aria-label="Cociente">${co}</div></div>`;
const fb = (t, c) => { const f = $('#fb'); if (f) { f.className = c; f.textContent = t; } };
function ir(s) { clearInterval(timer); sec = s; pintarMenu();
  ({inicio:vInicio, t1:()=>vTablas(1), t2:()=>vTablas(2), aprende:vAprende, practica:vPractica, insignias:vInsignias, config:vConfig})[s]();
  vista.scrollTop = 0; vista.focus({preventScroll:true}); }

function vInicio() {
  decir('¡Hola! Soy Numi, tu guía. ¡Empecemos la aventura!');
  vista.innerHTML = `<section class="card portada"><h2>¡Bienvenido a la aventura!</h2>
  <p class="sub">Aprende, practica y conviértete en un campeón de las divisiones</p>
  <button class="grande" data-a="ir" data-v="t1">¡Comenzar aventura!</button>
  <p>Progreso general: <b>${progreso()}%</b> · ⭐ <b>${E.estrellas}</b> estrellas · 🏅 <b>${E.insignias.length}/10</b> insignias</p>
  <p>${INS.map(i => `<span class="ins ${E.insignias.includes(i.id)?'':'off'}" role="img" aria-label="${i.n}: ${E.insignias.includes(i.id)?'conseguida':'bloqueada'}">${i.i}</span>`).join('')}</p></section>
  <div class="rejilla">${SECC.slice(1,6).map(s => `<button data-a="ir" data-v="${s[0]}">${s[1]} ${s[2]}</button>`).join('')}</div>`;
}

/* ---------- 5. TABLAS ---------- */
let T = {n:0, modo:'ver', tabla:7, q:null, i:0, ok:0, hecho:false, fallos:0, sa:0, se:0};
const MT = [['ver','👀 Ver tabla'],['op','🔘 Elegir respuesta'],['esc','⌨️ Escribir'],['des','🎯 Desafío de 10'],['mul','🔍 Encuentra el múltiplo']];
function nuevaPreg() { // crea una pregunta de tablas o del minijuego
  const t = T.tabla; T.hecho = false; T.fallos = 0;
  if (T.modo === 'mul') { const q = rnd(2,10), n = t*q, ks = new Set([q]);
    while (ks.size < 4) ks.add(Math.max(1, q + rnd(-3,3)));
    T.q = {txt:`Para resolver ${n} ÷ ${t}, ¿qué multiplicación te sirve?`, opts:mezclar([...ks]).map(k => ({t:`${t} × ${k} = ${t*k}`, ok:k===q})),
      exp:`Porque ${t} × ${q} = ${n}, entonces ${n} ÷ ${t} = ${q}.`}; return; }
  const b = rnd(1,10), r = t*b, s = new Set([r]);
  while (s.size < 4) { const v = r + rnd(-3,3)*(rnd(0,1) ? 1 : t); if (v > 0) s.add(v); }
  T.q = {txt:`¿Cuánto es ${t} × ${b}?`, resp:r, opts:mezclar([...s]).map(v => ({t:String(v), ok:v===r})),
    exp:`${t} × ${b} = ${r}. Piensa en ${b} grupos de ${t}.`};
}
function vTablas(n) {
  if (T.n !== n) Object.assign(T, {n, modo:'ver', tabla:n===1?7:12, q:null, i:0, ok:0, sa:0, se:0});
  decir(n === 1 ? 'Repasa las tablas del 1 al 9.' : 'Las tablas del 10 al 99 te ayudan a dividir por 2 cifras.');
  const t = T.tabla; let z = '';
  if (T.modo === 'ver') z = '<div class="tabla">' + [1,2,3,4,5,6,7,8,9,10].map(k => `<div><b class="t-n">${t}</b> × ${k} = <b class="t-q">${t*k}</b></div>`).join('') + '</div>';
  else if (T.modo === 'des' && T.i >= 10) z = `<p class="preg">¡Terminaste! Acertaste ${T.ok} de 10 🎉</p><p>Tu mejor resultado: ${E.mejor10} de 10.
    ${T.ok >= 8 ? '¡Ganaste la insignia Maestro de las tablas!' : 'Con 8 aciertos ganas una insignia. ¡Puedes intentarlo otra vez!'}</p><button data-a="modoT" data-v="des">Jugar otra vez</button>`;
  else { if (!T.q) nuevaPreg(); const q = T.q, tot = T.sa + T.se;
    z = `<p class="preg">${T.modo==='des' ? `Pregunta ${T.i+1} de 10 · ` : ''}${q.txt}</p>` +
      (T.modo === 'esc' ? '<label>Tu respuesta <input id="in" inputmode="numeric" autocomplete="off"></label> <button id="ok" data-a="rT">Comprobar</button>'
        : '<div class="ops">' + q.opts.map((o,i) => `<button data-a="rT" data-v="${i}">${o.t}</button>`).join('') + '</div>') +
      `<p id="fb" role="status"></p><button data-a="sigT" id="sg" hidden>Siguiente ➜</button>
       <p class="est">✅ Aciertos: ${T.sa} · ❌ Errores: ${T.se} · Precisión: ${tot ? Math.round(T.sa/tot*100) : 0}%</p>`; }
  vista.innerHTML = `<section class="card"><h2>${n===1?'Tablas de multiplicar de 1 cifra':'Tablas de multiplicar de 2 cifras'}</h2>
    ${n === 1 ? `<div class="fila" role="group" aria-label="Elige una tabla">${[1,2,3,4,5,6,7,8,9].map(k => `<button class="peq ${k===t?'sel':''}" aria-pressed="${k===t}" data-a="tabla" data-v="${k}">${k}</button>`).join('')}</div>` : `<p><label>Tabla del <select id="selT">${Array.from({length:90}, (_, x) => `<option ${x+10===t?'selected':''}>${x+10}</option>`).join('')}</select></label></p>`}
    <div class="fila">${MT.map(m => `<button class="peq ${T.modo===m[0]?'sel':''}" aria-pressed="${T.modo===m[0]}" data-a="modoT" data-v="${m[0]}">${m[1]}</button>`).join('')}</div>
    <div>${z}</div></section>`;
  const inp = $('#in'); if (inp) inp.focus();
}
function respTabla(v) {
  const q = T.q; if (!q || T.hecho) return; let ok;
  if (T.modo === 'esc') { const s = $('#in').value.trim(); if (!/^\d+$/.test(s)) return fb('Escribe un número entero.', 'info'); ok = +s === q.resp; }
  else ok = q.opts[+v].ok;
  if (ok) { T.hecho = true; T.sa++; E.aciertos++; if (T.modo === 'des') T.ok++;
    if (T.fallos === 0) E.estrellas++; fb('¡Correcto! ' + q.exp + (T.fallos === 0 ? ' +1 ⭐' : ''), 'ok'); $('#sg').hidden = false; }
  else { T.se++; E.errores++; T.fallos++;
    if (T.modo === 'des' || T.fallos >= 2) { T.hecho = T.modo === 'des'; fb('¡Buen intento! ' + q.exp, 'mal'); if (T.hecho) $('#sg').hidden = false; }
    else fb('¡Casi! Puedes intentarlo otra vez.', 'mal'); }
  const tot = T.sa + T.se; $('.est').textContent = `✅ Aciertos: ${T.sa} · ❌ Errores: ${T.se} · Precisión: ${Math.round(T.sa/tot*100)}%`;
  persistir();
}
function sigT() {
  if (T.modo === 'des') { T.i++; if (T.i >= 10) { E.mejor10 = Math.max(E.mejor10, T.ok); if (T.ok >= 8) E.rondaTablas = true; persistir(); } }
  T.q = null; vTablas(T.n);
}

/* ---------- 6. APRENDE A DIVIDIR ---------- */
const EJA = [[347,26],[3728,25],[156,12],[1250,25]], EJB = [[468,12],[345,15],[1250,25],[9876,32]];
let A = {vista:'con', e:0, p:0, exp:false}, B = null, eb = 0;
function nuevoB() { const [n,d] = EJB[eb]; B = {n, d, rem:n, partes:[], l:[], msg:'Elige un múltiplo de ' + d + ' para restar.', fin:false}; }
function vAprende() {
  decir('Avanza a tu ritmo. ¡Puedes volver atrás cuando quieras!');
  const tabs = [['con','🔤 Conceptos'],['a','➖ Paso a paso'],['b','🧠 Resta mental'],['cmp','⚖️ Comparar']];
  let z = '';
  if (A.vista === 'con') z = `<p><b class="t-n">Dividendo</b>: número que vamos a repartir.<br><b class="t-d">Divisor</b>: número por el que dividimos.<br>
    <b class="t-q">Cociente</b>: resultado de la división.<br><b class="t-r">Resto</b>: cantidad que sobra (siempre menor que el divisor).</p>
    ${tdiv('<span class="t-n">156</span>','<span class="t-d">12</span>','<span class="t-q">13</span>')}
    <p class="paso"><b class="t-n">Dividendo</b> = <b class="t-d">divisor</b> × <b class="t-q">cociente</b> + <b class="t-r">resto</b><br>156 = 12 × 13 + 0</p>`;
  else if (A.vista === 'a') { const [n,d] = EJA[A.e], S = pasosA(n,d), s = S[A.p];
    if (A.p === S.length-1 && !E.tutA) { E.tutA = true; persistir(); }
    z = `<div class="juego exacto">${tdiv(divHTML(n, s), d, s.q, s.l.map(x => `<span style="padding-right:${String(n).length - s.g}ch">${x}</span>`))}${s.aux ? `<div class="aux">${s.aux}</div>` : ''}<div><p class="paso" aria-live="polite"><b>Paso ${A.p+1} de ${S.length}.</b> ${s.t}</p>
      ${A.exp ? `<p class="info">Tapamos la última cifra para comparar solo con la primera cifra del divisor. Si el producto se pasa, probamos con un número menor. Al restar, el resto debe ser menor que ${d}; entonces bajamos la cifra siguiente.</p>` : ''}</div></div>
      <div class="fila"><button data-a="aAnt" ${A.p===0?'disabled':''}>⬅️ Paso anterior</button><button data-a="aSig" ${A.p===S.length-1?'disabled':''}>Siguiente paso ➡️</button>
      <button class="sec" data-a="aExp">💡 Ver explicación</button><button class="sec" data-a="aIni">🔄 Volver a empezar</button><button class="sec" data-a="aOtro">🎲 Probar otro ejemplo</button></div>`; }
  else if (A.vista === 'b') { if (!B) nuevoB();
    const ks = [1,2,3,4,5,10,20,30,40,50,100,200].filter(k => k*B.d <= B.rem*2 || k === 1), acum = B.partes.reduce((a,b) => a+b, 0);
    z = `<p>Estrategia: busca múltiplos de ${B.d}, réstalos y suma las partes del cociente.</p>
      <div class="juego">${tdiv(B.n, B.d, acum || '', B.l)}<div><p class="paso" aria-live="polite">${B.msg}</p><p>Queda: <b class="t-r">${B.rem}</b> · Cociente: <b class="t-q">${B.partes.length ? B.partes.join(' + ') + ' = ' + acum : '0'}</b></p></div></div>
      <div class="barra" role="img" aria-label="Partes restadas">${B.partes.map(k => `<span style="width:${k*B.d/B.n*100}%">${k*B.d}</span>`).join('')}</div>
      ${B.fin ? '' : `<div class="ops">${ks.map(k => `<button class="peq" data-a="bElige" data-v="${k}">${B.d} × ${k} = ${B.d*k}</button>`).join('')}</div>`}
      <div class="fila"><button class="sec" data-a="bOtro">🎲 Probar otro ejemplo</button><button class="sec" data-a="bIni">🔄 Volver a empezar</button></div>`; }
  else z = `<div class="rejilla"><div class="card"><h3>➖ Restas sucesivas</h3><p>Permite ver cada resta y entender el algoritmo paso a paso.</p></div>
    <div class="card"><h3>🧠 Resta mental</h3><p>Usa múltiplos del divisor (×10, ×20…) para llegar más rápido.</p></div></div>
    <p>Los dos métodos resuelven la división. ¡Elige el que te resulte más cómodo!</p>`;
  vista.innerHTML = `<section class="card"><h2>Aprende a dividir</h2><div class="fila">${tabs.map(t => `<button class="peq ${A.vista===t[0]?'sel':''}" aria-pressed="${A.vista===t[0]}" data-a="vA" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>${z}</section>`;
}
function elegirB(k) {
  const prod = k*B.d; if (B.fin) return;
  if (prod > B.rem) { B.msg = `${B.d} × ${k} = ${prod} se pasa de ${B.rem}. Elige uno más chico.`; return vAprende(); }
  B.l.push(`${B.rem} − ${prod} = ${B.rem-prod}`); B.rem -= prod; B.partes.push(k);
  if (B.rem < B.d) { B.fin = true; const s = B.partes.reduce((a,b) => a+b, 0);
    B.msg = `¡Muy bien! Sumamos ${B.partes.join(' + ')} = ${s}. Entonces ${B.n} ÷ ${B.d} = ${s}, resto ${B.rem}.`; E.tutB = true; persistir(); }
  else B.msg = `Bien: ${B.d} × ${k} = ${prod}. Todavía podemos restar más.`;
  vAprende();
}

/* ---------- 7. PRACTICA ---------- */
let P = {nivel:1, modo:'ritmo', seg:60, ej:null, usados:new Set(), i:0, ok:0};
function vPractica() {
  clearInterval(timer); decir('Elige un nivel y un modo. ¡Tú decides el ritmo!');
  const nom = ['','2 cifras ÷ 2 cifras','3 cifras ÷ 2 cifras','4 cifras ÷ 2 cifras','Desafíos combinados (exactas y con resto)'];
  const modos = [['ritmo','🐢 Resuelve a tu ritmo'],['des','🎯 Desafío de 10'],['pistas','💡 División con pistas'],['reloj','⏱️ Contrarreloj (opcional)']];
  vista.innerHTML = `<section class="card"><h2>Practica divisiones</h2><p>Nivel:</p><div class="fila">${[1,2,3,4].map(n => `<button class="peq ${P.nivel===n?'sel':''}" aria-pressed="${P.nivel===n}" data-a="nivel" data-v="${n}">${n}</button>`).join('')} <span>${nom[P.nivel]}</span></div>
  <p>Modo:</p><div class="fila">${modos.map(m => `<button class="peq ${P.modo===m[0]?'sel':''}" aria-pressed="${P.modo===m[0]}" data-a="modoP" data-v="${m[0]}">${m[1]}</button>`).join('')}</div>
  ${P.modo === 'reloj' ? `<label>Segundos por ejercicio <select id="seg">${[30,60,90,120].map(s => `<option ${s===P.seg?'selected':''}>${s}</option>`).join('')}</select></label>` : ''}
  <p><button class="grande" data-a="empezarP">¡Empezar!</button></p></section>`;
}
function nuevoEj() {
  clearInterval(timer); if (P.modo === 'des' && P.i >= 10) return resumenP();
  P.ej = {...genEj(P.nivel, P.usados), tries:0, pistas:0, sol:false, hecho:false};
  const e = P.ej;
  vista.innerHTML = `<section class="card"><h2>${P.modo==='des' ? `Ejercicio ${P.i+1} de 10` : 'Resuelve la división'} <small>Nivel ${P.nivel}</small> <span id="reloj"></span></h2>
  <div class="juego">${tdiv(e.n, e.d, '<input id="q" aria-label="Cociente" inputmode="numeric" autocomplete="off">')}
  <label class="rs">Resto <input id="r" aria-label="Resto" inputmode="numeric" autocomplete="off"></label></div>
  <p id="fb" role="status"></p><p id="hs"></p>
  <div class="fila"><button id="ok" data-a="comprobar">Comprobar</button><button class="sec" data-a="pista">💡 Necesito una pista</button>
  <button class="sec" data-a="solucion">📖 Ver solución explicada</button><button class="sec" data-a="nuevoEj">➡️ Nuevo ejercicio</button>
  <button class="sec" data-a="ir" data-v="practica">Volver al menú</button></div><div id="sl" class="sol"></div></section>`;
  $('#q').focus();
  if (P.modo === 'reloj') { let s = P.seg; const r = $('#reloj'); r.textContent = `⏱️ ${s} s`;
    timer = setInterval(() => { s--; r.textContent = `⏱️ ${s} s`;
      if (s <= 0) { clearInterval(timer); r.textContent = ''; fb('⏰ ¡Se acabó el tiempo! No pasa nada: sigue a tu ritmo.', 'info'); } }, 1000); }
}
function comprobar() {
  const e = P.ej; if (!e || e.hecho) return;
  const qs = $('#q').value.trim(), rs = $('#r').value.trim();
  if (!/^\d+$/.test(qs) || !/^\d+$/.test(rs)) return fb('Escribe el cociente y el resto con números enteros. Si no sobra nada, el resto es 0.', 'info');
  const q = +qs, r = +rs;
  if (q === e.q && r === e.r && e.n === e.d*q + r && r < e.d) { // respuesta correcta
    e.hecho = true; const est = e.sol ? 1 : e.pistas ? 2 : e.tries === 0 ? 3 : 2; E.estrellas += est;
    E.hechos++; E.aciertos++; if (e.n >= 1000) E.d4++; else if (e.n >= 100) E.d3++; if (e.r > 0) E.resto++;
    if (e.tries === 0 && !e.pistas && !e.sol) { E.racha++; E.mejorRacha = Math.max(E.mejorRacha, E.racha); if (P.modo === 'des') P.ok++; } else E.racha = 0;
    if (P.modo === 'des') P.i++;
    clearInterval(timer); fb(`¡Excelente! Tu división está correcta. Ganaste ${est} ⭐ (${e.d} × ${q} + ${r} = ${e.n})`, 'ok'); persistir(); return; }
  e.tries++; E.errores++; E.racha = 0;
  fb(r >= e.d ? `El resto debe ser menor que el divisor (${e.d}). ¿Cabe una vez más?`
    : q === e.q ? '¡Casi lo tienes! El cociente está bien, revisa el resto.'
    : e.d*q > e.n ? `¡Buen intento! ${e.d} × ${q} se pasa de ${e.n}. Prueba con un cociente más chico.`
    : '¡Casi lo tienes! Revisa cuántas veces cabe el divisor. Si quieres, pide una pista.', 'mal'); persistir();
}
function pista() {
  const e = P.ej; if (!e || e.hecho) return; e.pistas++; const m = Math.floor(e.q/10)*10;
  const H = ['Pista: busca un múltiplo del divisor que se acerque al dividendo sin pasarse.', `El cociente está entre ${m} y ${m+10}.`,
    `Prueba: ${e.d} × ${e.q} = ${e.d*e.q}. ¿Cuánto falta para llegar a ${e.n}?`], n = Math.min(e.pistas, 3);
  $('#hs').innerHTML = '💡 ' + (P.modo === 'pistas' ? H.slice(0,n).join('<br>💡 ') : H[n-1]);
}
function solucion() {
  const e = P.ej; if (!e) return; e.sol = true;
  $('#sl').innerHTML = '<ol>' + pasosA(e.n, e.d).map(s => `<li>${s.t}</li>`).join('') + `</ol><p><b>Comprobación:</b> ${e.d} × ${e.q} + ${e.r} = ${e.n} y ${e.r} es menor que ${e.d}.</p>`;
  if (!e.hecho) fb('¡Buen intento! Vamos a resolverlo juntos. Ahora inténtalo tú (ganarás 1 ⭐).', 'info');
}
function resumenP() {
  vista.innerHTML = `<section class="card"><h2>¡Desafío terminado! 🎉</h2><p class="preg">Resolviste ${P.ok} de 10 al primer intento.</p>
  <div class="fila"><button data-a="empezarP">Otro desafío</button><button class="sec" data-a="ir" data-v="practica">Volver al menú</button></div></section>`;
}

/* ---------- 8. INSIGNIAS Y AJUSTES ---------- */
function vInsignias() {
  decir('Toca una insignia para ver cómo conseguirla.');
  vista.innerHTML = `<section class="card"><h2>Mi colección de insignias (${E.insignias.length}/10)</h2><div class="rejilla">
  ${INS.map(i => { const g = E.insignias.includes(i.id);
    return `<button class="insb ${g?'':'off'}" data-a="verIns" data-v="${i.id}" aria-label="${i.n}, ${g?'conseguida':'bloqueada'}"><span class="ico">${i.i}</span>${i.n}<small>${g?'✅ Conseguida':'🔒 Bloqueada'}</small></button>`; }).join('')}
  </div><p id="det" aria-live="polite">Toca una insignia para ver su descripción.</p></section>`;
}
function vConfig() {
  decir('Aquí puedes cambiar ajustes o empezar de nuevo.');
  vista.innerHTML = `<section class="card"><h2>Ajustes</h2>
  <p><label><input type="checkbox" id="cal" ${E.calmado?'checked':''} style="width:auto"> Reducir animaciones</label></p>
  <p>${almacenOk ? 'Tu progreso se guarda en este navegador.' : 'Aviso: en este navegador no se puede guardar el progreso. Podrás usar la app, pero se perderá al cerrar.'}</p>
  <button class="sec" data-a="reset">🗑️ Reiniciar progreso</button></section>`;
}

/* ---------- ACCIONES (un botón = una acción) ---------- */
const acc = {
  ir, cerrarAviso:() => { const a = $('#aviso'); a.hidden = true; a.innerHTML = ''; },
  tabla:v => { T.tabla = +v; T.q = null; vTablas(T.n); },
  modoT:v => { T.modo = v; T.q = null; T.i = 0; T.ok = 0; vTablas(T.n); },
  rT:respTabla, sigT,
  vA:v => { A.vista = v; if (v === 'b') B = null; vAprende(); },
  aAnt:() => { A.p = Math.max(0, A.p-1); vAprende(); }, aSig:() => { A.p++; vAprende(); },
  aExp:() => { A.exp = !A.exp; vAprende(); }, aIni:() => { A.p = 0; vAprende(); },
  aOtro:() => { A.e = (A.e+1) % EJA.length; A.p = 0; vAprende(); },
  bElige:v => elegirB(+v), bIni:() => { nuevoB(); vAprende(); }, bOtro:() => { eb = (eb+1) % EJB.length; nuevoB(); vAprende(); },
  nivel:v => { P.nivel = +v; vPractica(); }, modoP:v => { P.modo = v; vPractica(); },
  empezarP:() => { const s = $('#seg'); if (s) P.seg = +s.value; P.usados = new Set(); P.i = 0; P.ok = 0; nuevoEj(); },
  comprobar, pista, solucion,
  nuevoEj:() => { if (P.modo === 'des' && P.ej && !P.ej.hecho) fb('En el desafío, primero resuelve este ejercicio (puedes pedir pista o solución).', 'info'); else nuevoEj(); },
  verIns:id => { const i = INS.find(x => x.id === id), [p,m] = i.p(E);
    $('#det').innerHTML = `<b>${i.i} ${i.n}</b>: ${i.d} Progreso: ${p}/${m} <progress max="${m}" value="${p}"></progress>`; },
  reset:() => $('#dlg').showModal(), noReset:() => $('#dlg').close(),
  siReset:() => { E = {...BASE, insignias:[]}; try { localStorage.removeItem(KEY); } catch (x) {} $('#dlg').close(); actualizarTop(); ir('inicio'); }
};
document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && acc[b.dataset.a]) acc[b.dataset.a](b.dataset.v); });
document.addEventListener('change', e => { if (e.target.id === 'selT') { T.tabla = +e.target.value; T.q = null; vTablas(T.n); } if (e.target.id === 'cal') { E.calmado = e.target.checked; persistir(); } });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input[type=text],input:not([type])')) { const o = $('#ok'); if (o) o.click(); } });

/* ---------- INICIO ---------- */
actualizarTop(); ir('inicio');
if (!almacenOk) aviso('Aviso: no se puede guardar el progreso en este navegador. Puedes usar la app durante esta sesión.');
})();
