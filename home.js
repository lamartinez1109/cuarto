/* =========================================================
   Listado de materias del sitio.
   Para sumar una materia nueva más adelante (ej. Lengua),
   agregá un objeto a este array — no hace falta tocar el resto
   del código. Cuando la materia esté lista, poné available:true
   y cargá su href (ej. "lengua/index.html").
   ========================================================= */

const SUBJECTS = [
  {
    id: 'matematica',
    slug: 'subject-matematica',
    emoji: '🧮',
    tag: 'Actividades sobre fracciones',
    title: 'Actividades de Matemática',
    desc: 'Fracciones',
    href: 'fracciones/index.html',
    available: true,
  },
  {
    id: 'lengua',
    slug: 'subject-lengua',
    emoji: '📚',
    tag: 'Actividades sobre la noticia',
    title: 'Actividades de Lengua',
    desc: 'La noticia.',
    href: 'noticia/index.html',
    available: false,
  },
     {
    id: 'lengua',
    slug: 'subject-lengua',
    emoji: '📚',
    tag: 'Proximamente',
    title: 'Actividades de Lengua',
    desc: 'Proximamente',
    href: null,
    available: false,
  },
];

const shelf = document.getElementById('shelf');

SUBJECTS.forEach(subject => {
  const card = document.createElement(subject.available ? 'a' : 'div');
  card.className = `notebook-card ${subject.slug} ${subject.available ? 'is-available' : 'is-locked'}`;
  if (subject.available) card.href = subject.href;

  card.innerHTML = `
    <span class="card-emoji">${subject.emoji}</span>
    <span class="card-tag">${subject.tag}</span>
    <h2 class="card-title">${subject.title}</h2>
    <p class="card-desc">${subject.desc}</p>
    <span class="card-cta">${subject.available ? 'Entrar →' : '🔒 Próximamente'}</span>
  `;

  shelf.appendChild(card);
});
