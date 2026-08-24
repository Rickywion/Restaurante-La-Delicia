/* =====================================================================
   build.js — deja la carta escrita en el HTML
   ---------------------------------------------------------------------
   Antes, los 57 platos, los favoritos, las reseñas y los horarios se
   inyectaban con JavaScript en divs vacíos. Eso significa que el HTML que
   recibe Google (y cualquiera con el JS bloqueado o fallido) no contenía
   el menú: justo lo único que la gente viene a ver.

   Este script lee assets/js/menu-data.js y escribe ese mismo HTML dentro
   de index.html, entre marcas <!-- LD:zona --> … <!-- /LD:zona -->.
   El JavaScript sigue mandando en cuanto el visitante toca algo.

   Uso:  node build.js        (hay que correrlo tras editar menu-data.js)
   ===================================================================== */

const fs = require('fs');
const path = require('path');

global.window = {};
require('./assets/js/menu-data.js');
const { LD_CONFIG: CFG, LD_CATEGORIAS: CATS, LD_PLATOS: PLATOS, LD_RESENAS: REVS } = global.window;

const esc = (s) => String(s).replace(/[&<>"']/g, (m) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const money = (n) => '$' + n.toFixed(2);

const waLink = (t) => CFG.whatsappBase + encodeURIComponent(t);
const waDish = (p) => waLink('¡Hola ' + CFG.nombre + '! 👋 Quiero pedir para llevar: ' + p.nombre +
  (typeof p.precio === 'number' ? ' (' + money(p.precio) + ')' : '') + '. ¿A qué hora lo tienen listo?');

function precioTexto(p) {
  if (typeof p.precio === 'number') return money(p.precio);
  if (p.variantes && p.variantes.length) return 'desde ' + money(Math.min(...p.variantes.map(v => v.precio)));
  return '—';
}

/* Medidas reales de cada imagen, para reservar el hueco exacto y no
   provocar saltos de maquetación (CLS). */
const dims = {};
try {
  const dir = path.join(__dirname, 'assets', 'img');
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.webp')) continue;
    const b = fs.readFileSync(path.join(dir, f));
    let w = 0, h = 0;
    if (b.slice(12, 16).toString() === 'VP8X') { // extendido
      w = 1 + b.readUIntLE(24, 3); h = 1 + b.readUIntLE(27, 3);
    } else if (b.slice(12, 16).toString() === 'VP8L') { // sin pérdida
      const bits = b.readUInt32LE(21);
      w = (bits & 0x3FFF) + 1; h = ((bits >> 14) & 0x3FFF) + 1;
    } else if (b.slice(12, 16).toString() === 'VP8 ') { // con pérdida
      w = b.readUInt16LE(26) & 0x3FFF; h = b.readUInt16LE(28) & 0x3FFF;
    }
    if (w && h) dims[f.replace('.webp', '')] = { w, h };
  }
} catch (e) { /* si falla, se omiten los atributos */ }

const medida = (n) => dims[n] ? ` width="${dims[n].w}" height="${dims[n].h}"` : '';

/* ------------------------- generadores ------------------------------ */

function tarjetaPlato(p, i) {
  const media = p.img
    ? `<div class="plato__media"><img src="assets/img/${p.img}.webp" alt="${esc(p.nombre)}"${medida(p.img)} loading="lazy" decoding="async"></div>`
    : `<div class="plato__media plato__media--empty" aria-hidden="true"><span>${esc(p.nombre.charAt(0))}</span></div>`;

  const precio = typeof p.precio === 'number'
    ? `<span class="plato__price tabular">${money(p.precio)}</span>` : '';

  const vars = (p.variantes || []).map(v =>
    `<span class="plato__var"><b>${esc(v.etiqueta)}</b><i aria-hidden="true"></i>` +
    `<span class="tabular">${money(v.precio)}</span></span>`).join('');

  let tags = (p.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('');
  if (p.nota) tags += `<span class="chip">${esc(p.nota)}</span>`;

  return `<article class="plato" data-rv="card" style="--d:${Math.min(i, 7) * 60}ms">${media}` +
    `<div class="plato__body">` +
      `<div class="plato__top"><h4 class="plato__name">${esc(p.nombre)}</h4>${precio}</div>` +
      `<p class="plato__desc">${esc(p.desc)}</p>` +
      (vars ? `<div class="plato__vars">${vars}</div>` : '') +
      (tags ? `<div class="plato__tags">${tags}</div>` : '') +
      `<a class="plato__wa" href="${waDish(p)}" target="_blank" rel="noopener">` +
        `<svg aria-hidden="true"><use href="#i-wa"></use></svg>` +
        `<span class="plato__wa-txt">Pedir para llevar</span>` +
        `<span class="sr-only"> ${esc(p.nombre)}</span></a>` +
    `</div></article>`;
}

const zonas = {

  marquee: () => {
    const frases = ['Asados', 'Menestras', 'Parrilladas', 'Desayunos desde $2.75',
      'Almuerzos del día', 'Secos de olla', 'Jugos naturales', 'Pedidos para llevar'];
    const b = frases.map(f => `<span>${esc(f)}</span>`).join('');
    return b + b;
  },

  favs: () => PLATOS.filter(p => p.destacado && p.img).slice(0, 6).map((p, i) =>
    `<a class="fav" href="${waDish(p)}" target="_blank" rel="noopener" data-rv="wipe" style="--d:${i * 70}ms">` +
    `<img src="assets/img/${p.img}.webp" alt="${esc(p.nombre)}"${medida(p.img)} loading="lazy" decoding="async">` +
    `<span class="fav__price tabular">${esc(precioTexto(p))}</span>` +
    `<span class="fav__body"><span class="fav__name">${esc(p.nombre)}</span>` +
    `<span class="fav__desc">${esc(p.desc)}</span></span></a>`).join(''),

  tabs: () => [{ id: 'todos', nombre: 'Todo' }].concat(CATS).map(c =>
    `<button class="tab" type="button" role="tab" id="tab-${c.id}" data-cat="${c.id}" ` +
    `aria-selected="${c.id === 'todos'}" aria-controls="platos">${esc(c.nombre)}</button>`).join(''),

  'cat-intro': () => `<p class="script">Todo lo que servimos</p><h3>La carta completa</h3>` +
    `<p class="muted">${PLATOS.length} platos y bebidas, de los desayunos a la parrillada.</p>`,

  /* Vista inicial: "Todo", agrupada por sección */
  platos: () => CATS.map(c => {
    const dela = PLATOS.filter(p => p.cat === c.id);
    if (!dela.length) return '';
    return `<section class="grupo" data-grupo="${c.id}">` +
      `<header class="grupo__cab">` +
        `<span class="grupo__lema script">${esc(c.lema)}</span>` +
        `<h4 class="grupo__nombre">${esc(c.nombre)}</h4>` +
        `<span class="grupo__linea" aria-hidden="true"></span>` +
        `<span class="grupo__n tabular">${dela.length}</span>` +
      `</header>` +
      `<div class="platos">${dela.map(tarjetaPlato).join('')}</div>` +
    `</section>`;
  }).join(''),

  horas: () => CFG.horarios.map(h =>
    `<li><span>${esc(h.dias)}</span><span>${esc(h.horas)}</span></li>`).join(''),

  'footer-cats': () => CATS.map(c =>
    `<li><a href="#carta" data-goto="${c.id}">${esc(c.nombre)}</a></li>`).join(''),

  'resenas-grid': () => REVS.map((r, i) => {
    const estrellas = '<svg aria-hidden="true"><use href="#i-star"></use></svg>'.repeat(r.estrellas);
    const cuerpo = r.texto
      ? `<blockquote>“${esc(r.texto)}”</blockquote>`
      : `<p class="resena__solo">Calificó con ${r.estrellas} estrellas, sin comentario.</p>`;
    const datos = (r.datos || []).map(d => `<span class="chip">${esc(d)}</span>`).join('');
    return `<figure class="resena" data-rv="card" style="--d:${i * 70}ms">` +
      `<div class="estrellas" role="img" aria-label="${r.estrellas} de 5 estrellas">${estrellas}</div>` +
      cuerpo + (datos ? `<div class="plato__tags">${datos}</div>` : '') +
      `<figcaption><span class="resena__av" aria-hidden="true">${esc(r.autor.charAt(0))}</span>` +
      `<span>${esc(r.autor)} · ${esc(r.fuente)}</span></figcaption></figure>`;
  }).join('')
};

/* --------------------------- escritura ------------------------------ */

const archivo = path.join(__dirname, 'index.html');
let html = fs.readFileSync(archivo, 'utf8');
let escritas = 0;

for (const [zona, generar] of Object.entries(zonas)) {
  const re = new RegExp(`(<!-- LD:${zona} -->)([\\s\\S]*?)(<!-- /LD:${zona} -->)`);
  if (!re.test(html)) { console.warn(`  ! falta la marca LD:${zona} en index.html`); continue; }
  html = html.replace(re, (_, a, __, b) => a + generar() + b);
  escritas++;
}

/* La clase de la grilla depende de la vista inicial (agrupada) */
html = html.replace(/<div class="platos(?:-grupos)?" id="platos"/, '<div class="platos-grupos" id="platos"');

fs.writeFileSync(archivo, html);

const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log(`${escritas}/${Object.keys(zonas).length} zonas escritas en index.html`);
console.log(`index.html: ${kb(Buffer.byteLength(html))}  ·  ${PLATOS.length} platos ahora en el HTML`);
