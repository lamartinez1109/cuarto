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
function pasosA(n, d, mental = false) {
  const ds = String(n).split('').map(Number), c1 = Math.floor(d/10), S = []; let i = 0, cur = ds[0], q = '', l = [], rem;
  const ln = x => `<span style="padding-right:${ds.length - i - 1}ch">${x}</span>`; // alinea unidades con unidades
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
      if (!mental) l.push(ln(`<span class="sub">− ${d*e}</span>`)); // en resta mental no se escribe la resta
      add(`Multiplicamos: ${e} × ${d%10} = ${e*(d%10)} y ${e} × ${c1} decenas = ${e*c1*10}. En total ${d} × ${e} = ${d*e}.`, {aux:`${e} × ${d%10} = ${e*(d%10)}<br>${e} × ${c1}0 = ${e*c1*10}<br>———<br>${d} × ${e} = ${d*e}`});
      rem = cur - d*e; q += e; l.push(ln(String(rem).padStart(String(cur).length, '0')));
      add(`${mental ? `Restamos mentalmente ${cur} − ${d*e} y escribimos solo el resultado: ${rem}.` : `Restamos: ${cur} − ${d*e} = ${rem}.`} Anotamos ${e} en el cociente. ${rem} es menor que ${d}: ¡bien!`);
    }
    if (i >= ds.length-1) break;
    i++; cur = rem*10 + ds[i]; if (l.length) l[l.length-1] = ln(String(cur));
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
const EJA = [[347,26],[3728,25],[156,12],[1250,25]];
let A = {vista:'con', e:0, p:0, exp:false};
function vAprende() {
  decir('Avanza a tu ritmo. ¡Puedes volver atrás cuando quieras!');
  const tabs = [['con','🔤 Conceptos'],['a','➖ Paso a paso'],['b','🧠 Resta mental']];
  let z = '';
  if (A.vista === 'con') z = `<p><b class="t-n">Dividendo</b>: número que vamos a repartir.<br><b class="t-d">Divisor</b>: número por el que dividimos.<br>
    <b class="t-q">Cociente</b>: resultado de la división.<br><b class="t-r">Resto</b>: cantidad que sobra (siempre menor que el divisor).</p>
    ${tdiv('<span class="t-n">156</span>','<span class="t-d">12</span>','<span class="t-q">13</span>')}
    <p class="paso"><b class="t-n">Dividendo</b> = <b class="t-d">divisor</b> × <b class="t-q">cociente</b> + <b class="t-r">resto</b><br>156 = 12 × 13 + 0</p>`;
  else if (A.vista === 'a' || A.vista === 'b') { const mt = A.vista === 'b', fl = mt ? 'tutB' : 'tutA', [n,d] = EJA[A.e], S = pasosA(n,d,mt), s = S[A.p];
    if (A.p === S.length-1 && !E[fl]) { E[fl] = true; persistir(); }
    z = `<div class="juego exacto">${tdiv(divHTML(n, s), d, s.q, s.l)}${s.aux ? `<div class="aux">${s.aux}</div>` : ''}<div><p class="paso" aria-live="polite"><b>Paso ${A.p+1} de ${S.length}.</b> ${s.t}</p>
      ${A.exp ? `<p class="info">Tapamos la última cifra para comparar solo con la primera cifra del divisor. Si el producto se pasa, probamos con un número menor. Al restar, el resto debe ser menor que ${d}; entonces bajamos la cifra siguiente.</p>` : ''}</div></div>
      <div class="fila"><button data-a="aAnt" ${A.p===0?'disabled':''}>⬅️ Paso anterior</button><button data-a="aSig" ${A.p===S.length-1?'disabled':''}>Siguiente paso ➡️</button>
      <button class="sec" data-a="aExp">💡 Ver explicación</button><button class="sec" data-a="aIni">🔄 Volver a empezar</button><button class="sec" data-a="aOtro">🎲 Probar otro ejemplo</button></div>`; }
  else z = '';
  vista.innerHTML = `<section class="card"><h2>Aprende a dividir</h2><div class="fila">${tabs.map(t => `<button class="peq ${A.vista===t[0]?'sel':''}" aria-pressed="${A.vista===t[0]}" data-a="vA" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>${z}</section>`;
}
/* ---------- 7. PRACTICA ----------
   Todos los modos se resuelven paso a paso con la estructura de la división (cifra del cociente, producto, resta, bajar cifra).
   Método "con restas": se escribe el producto y la resta. Método "sin restas": solo el resultado de la resta. */
let P = {nivel:1, metodo:'con', modo:'ritmo', seg:60, usados:new Set(), i:0, ok:0}, G = null;
function vPractica() {
  clearInterval(timer);
  const nom = ['','2 cifras ÷ 2 cifras','3 cifras ÷ 2 cifras','4 cifras ÷ 2 cifras','Desafíos combinados (exactas y con resto)'];
  const grupo = (tit, lista, act, sel) => `<p>${tit}</p><div class="fila">${lista.map(m => `<button class="peq ${sel===m[0]?'sel':''}" aria-pressed="${sel===m[0]}" data-a="${act}" data-v="${m[0]}">${m[1]}</button>`).join('')}</div>`;
  vista.innerHTML = `<section class="card"><h2>Practica divisiones</h2>
  ${grupo('Nivel: ' + nom[P.nivel], [1,2,3,4].map(n => [n, n]), 'nivel', P.nivel)}
  ${grupo('Método:', [['con','➖ Con restas'],['sin','🧠 Sin restas']], 'metodoP', P.metodo)}
  ${grupo('Modo:', [['ritmo','🐢 Resuelve a tu ritmo'],['des','🎯 Desafío de 10'],['pistas','💡 División con pistas'],['reloj','⏱️ Contrarreloj (opcional)']], 'modoP', P.modo)}
  ${P.modo === 'reloj' ? `<label>Segundos por ejercicio <select id="seg">${[60,90,120,180].map(s => `<option ${s===P.seg?'selected':''}>${s}</option>`).join('')}</select></label>` : ''}
  <p><button class="grande" data-a="empezarP">¡Empezar!</button></p></section>`;
}
const ln = (g, x) => `<span style="padding-right:${String(g.n).length - g.i - 1}ch">${x}</span>`; // alinea la línea con la columna actual
function nuevoEj() {
  if (G && !G.fin && P.modo === 'des') return fb('En el desafío, termina este ejercicio (puedes pedir pista o solución).', 'info');
  clearInterval(timer); if (P.modo === 'des' && P.i >= 10) return resumenP();
  const e = genEj(P.nivel, P.usados), ds = String(e.n).split('').map(Number); let i = 0, cur = ds[0];
  while (cur < e.d && i < ds.length-1) { i++; cur = cur*10 + ds[i]; } // primer grupo de cifras >= divisor
  G = {...e, ds, i, cur, q:'', l:[], fase:'cifra', mental:P.metodo === 'sin', err:0, pistas:0, hp:0, sol:false, fin:false, k:0, rem:0, num:P.i+1, t:P.seg};
  pintarG();
  if (P.modo === 'reloj') timer = setInterval(() => { G.t--; const r = $('#reloj'); if (r) r.textContent = G.t > 0 ? `⏱️ ${G.t} s` : '';
    if (G.t <= 0) { clearInterval(timer); fb('⏰ ¡Se acabó el tiempo! No pasa nada: sigue a tu ritmo.', 'info'); } }, 1000);
}
function pintarG() {
  const g = G, ent = '<input id="gin" aria-label="Tu respuesta" inputmode="numeric" autocomplete="off">';
  const lin = [...g.l]; if (g.fase === 'resta') lin.push(ln(g, ent));
  const co = g.q + (g.fase === 'cifra' ? ent : '');
  const preg = {cifra:`¿Cuántas veces cabe ${g.d} en ${g.cur}? Escribe la cifra en el cociente.`, prod:`Multiplica ${g.d} × ${g.k} y escribe el producto en el cálculo auxiliar.`,
    resta:g.mental ? `Calcula en tu cabeza ${g.cur} − ${g.d} × ${g.k} y escribe solo el resultado.` : `Resta ${g.cur} − ${g.d*g.k} y escribe el resultado.`,
    bajar:'¡Bien! Ahora baja la cifra siguiente.'}[g.fase];
  const aux = !g.mental && !g.fin && ['prod','resta','bajar'].includes(g.fase) ? `<div class="aux">${g.d}<br>× ${g.k}<br>———<br>${g.fase === 'prod' ? ent : g.d*g.k}</div>` : '';
  vista.innerHTML = `<section class="card"><h2>${P.modo === 'des' ? `Ejercicio ${g.num} de 10` : 'Resuelve la división'} <small>${g.mental ? 'Sin restas' : 'Con restas'} · Nivel ${P.nivel}</small> <span id="reloj">${P.modo === 'reloj' && g.t > 0 && !g.fin ? `⏱️ ${g.t} s` : ''}</span></h2>
  <div class="juego exacto">${tdiv(divHTML(g.n, {g:g.i+1, tap:g.fase === 'cifra'}), g.d, co, lin)}${aux}
  <div><p class="paso" aria-live="polite">${g.fin ? `El resultado es ${+g.q} y el resto es ${g.rem}.` : preg}</p>
  ${g.fin ? '' : g.fase === 'bajar' ? `<button id="ok" data-a="gBajar">⬇️ Bajar la cifra ${g.ds[g.i+1]}</button>` : '<button id="ok" data-a="gOk">Comprobar</button>'}
  <p id="fb" role="status"></p><p id="hs"></p></div></div>
  <div class="fila"><button class="sec" data-a="gPista">💡 Necesito una pista</button><button class="sec" data-a="gSol">📖 Ver solución explicada</button>
  <button class="sec" data-a="nuevoEj">➡️ Nuevo ejercicio</button><button class="sec" data-a="ir" data-v="practica">Volver al menú</button></div><div id="sl" class="sol"></div></section>`;
  const x = $('#gin'); if (x) x.focus();
}
function contarHecho(e, limpio) { // suma estadísticas y rachas de un ejercicio resuelto (una sola vez)
  E.hechos++; E.aciertos++; if (e.n >= 1000) E.d4++; else if (e.n >= 100) E.d3++; if (e.r > 0) E.resto++;
  if (limpio) { E.racha++; E.mejorRacha = Math.max(E.mejorRacha, E.racha); } else E.racha = 0;
}
function gPista() {
  const g = G; if (g.fin) return; g.pistas++; g.hp++; const k = Math.floor(g.cur / g.d);
  const H = {cifra:[`Tapa la última cifra de ${g.cur}: queda ${Math.floor(g.cur/10)}. Compáralo con la primera cifra del divisor (${Math.floor(g.d/10)}).`,
      `La cifra está entre ${Math.max(0, k-1)} y ${k+1}. Si el producto se pasa de ${g.cur}, prueba con una menor.`, `Prueba con ${k}: ${g.d} × ${k} = ${g.d*k}, y no se pasa de ${g.cur}.`],
    prod:[`Multiplica ${g.k} × ${g.d%10} (unidades) y ${g.k} × ${Math.floor(g.d/10)} decenas, y suma.`, `${g.k} × ${g.d%10} = ${g.k*(g.d%10)}`, `${g.d} × ${g.k} = ${g.d*g.k}`],
    resta:[`Piensa en ${g.d} × ${g.k} y cuenta cuánto falta para llegar a ${g.cur}.`, `El resultado debe ser menor que ${g.d}.`, `${g.cur} − ${g.d*g.k} = ${g.cur - g.d*g.k}`],
    bajar:Array(3).fill('Baja la cifra siguiente del dividendo.')}[g.fase];
  $('#hs').textContent = '💡 ' + H[Math.min(g.hp, 3) - 1];
}
function gError(t) { G.err++; E.errores++; E.racha = 0; persistir(); fb(t, 'mal'); if (P.modo === 'pistas') gPista(); }
function gOk() {
  const g = G; if (g.fin || g.fase === 'bajar') return;
  const s = $('#gin').value.trim(); if (!/^\d+$/.test(s)) return fb('Escribe un número entero.', 'info');
  const v = +s;
  if (g.fase === 'cifra') {
    if (v !== Math.floor(g.cur / g.d)) return gError(v*g.d > g.cur ? `¡Casi! ${g.d} × ${v} = ${g.d*v} se pasa de ${g.cur}. Prueba con una cifra menor.` : '¡Buen intento! Todavía cabe más veces. Prueba con una cifra mayor.');
    g.k = v; g.q += v; g.fase = g.mental ? 'resta' : 'prod';
  } else if (g.fase === 'prod') {
    if (v !== g.d*g.k) return gError(`Revisa la multiplicación ${g.d} × ${g.k}: multiplica por las unidades y por las decenas.`);
    g.l.push(ln(g, `<span class="sub">− ${v}</span>`)); g.fase = 'resta';
  } else {
    const rem = g.cur - g.d*g.k;
    if (v !== rem) return gError(`¡Casi lo tienes! Revisa la resta. El resultado debe ser menor que ${g.d}.`);
    g.rem = rem; g.l.push(ln(g, String(rem).padStart(String(g.cur).length, '0'))); g.fase = 'bajar';
    if (g.i >= g.ds.length-1) { // terminó la división: recompensa una sola vez
      g.fin = true; clearInterval(timer); const limpio = !g.err && !g.pistas && !g.sol, est = g.sol ? 1 : limpio ? 3 : 2;
      E.estrellas += est; contarHecho(g, limpio); if (P.modo === 'des') { P.i++; if (limpio) P.ok++; } persistir(); pintarG();
      return fb(`¡Excelente! Tu división está correcta: ${g.d} × ${+g.q} + ${g.rem} = ${g.n}. Ganaste ${est} ⭐`, 'ok');
    }
  }
  g.hp = 0; pintarG(); fb('¡Muy bien!', 'ok');
}
function gBajar() {
  const g = G; if (g.fin || g.fase !== 'bajar') return;
  g.i++; g.cur = g.rem*10 + g.ds[g.i]; g.l[g.l.length-1] = ln(g, String(g.cur)); g.fase = 'cifra'; g.hp = 0; pintarG();
}
function gSol() {
  const g = G; g.sol = true;
  $('#sl').innerHTML = '<ol>' + pasosA(g.n, g.d, g.mental).map(s => `<li>${s.t}</li>`).join('') + `</ol><p><b>Comprobación:</b> ${g.d} × ${Math.floor(g.n/g.d)} + ${g.r} = ${g.n}.</p>`;
  if (!g.fin) fb('¡Buen intento! Vamos a resolverlo juntos. Sigue los pasos (ganarás 1 ⭐).', 'info');
}
function resumenP() {
  vista.innerHTML = `<section class="card"><h2>¡Desafío terminado! 🎉</h2><p class="preg">Resolviste ${P.ok} de 10 sin errores ni pistas.</p>
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
  vA:v => { A.vista = v; A.p = 0; vAprende(); },
  aAnt:() => { A.p = Math.max(0, A.p-1); vAprende(); }, aSig:() => { A.p++; vAprende(); },
  aExp:() => { A.exp = !A.exp; vAprende(); }, aIni:() => { A.p = 0; vAprende(); },
  aOtro:() => { A.e = (A.e+1) % EJA.length; A.p = 0; vAprende(); },
  nivel:v => { P.nivel = +v; vPractica(); }, modoP:v => { P.modo = v; vPractica(); }, metodoP:v => { P.metodo = v; vPractica(); },
  empezarP:() => { const s = $('#seg'); if (s) P.seg = +s.value; P.usados = new Set(); P.i = 0; P.ok = 0; G = null; nuevoEj(); },
  gOk, gBajar, gPista, gSol, nuevoEj,
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
