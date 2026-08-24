/* =====================================================================
   LA DELICIA — app.js
   Sin dependencias. Todo el movimiento respeta prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';

  var CFG   = window.LD_CONFIG;
  var CATS  = window.LD_CATEGORIAS;
  var DISHES= window.LD_PLATOS;
  var REVS  = window.LD_RESENAS;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  };
  var money = function (n) { return '$' + n.toFixed(2); };

  /* build.js ya dejó el contenido escrito en el HTML. Si está, no se
     vuelve a pintar al cargar: solo se enganchan los eventos. El JS toma
     el mando en cuanto el visitante filtra o busca. */
  var yaPintado = function (el) { return !!(el && el.children.length); };

  /* ---------------------------------------------------------------
     1. Precio mostrado + enlace de WhatsApp
  --------------------------------------------------------------- */
  function priceLabel(p) {
    if (typeof p.precio === 'number') return money(p.precio);
    if (p.variantes && p.variantes.length) {
      var min = Math.min.apply(null, p.variantes.map(function (v) { return v.precio; }));
      return 'desde ' + money(min);
    }
    return '—';
  }

  function waLink(text) { return CFG.whatsappBase + encodeURIComponent(text); }

  function waGeneral() {
    return waLink('¡Hola ' + CFG.nombre + '! 👋 Quiero hacer un pedido para llevar. ¿Me ayudan?');
  }

  function waDish(p) {
    var precio = typeof p.precio === 'number' ? ' (' + money(p.precio) + ')' : '';
    return waLink('¡Hola ' + CFG.nombre + '! 👋 Quiero pedir para llevar: ' + p.nombre + precio +
      '. ¿A qué hora lo tienen listo?');
  }

  /* ---------------------------------------------------------------
     2. Datos del negocio en el HTML
  --------------------------------------------------------------- */
  function hydrateConfig() {
    $$('[data-cfg]').forEach(function (el) {
      var v = CFG[el.getAttribute('data-cfg')];
      if (v) el.textContent = v;
    });
    $$('[data-wa]').forEach(function (a) { a.href = waGeneral(); });

    var year = $('#anio'); if (year) year.textContent = new Date().getFullYear();

    var ig = $('#red-ig'), tt = $('#red-tt');
    if (ig) { ig.href = CFG.redes.instagram.url; ig.title = CFG.redes.instagram.user; }
    if (tt) { tt.href = CFG.redes.tiktok.url;    tt.title = CFG.redes.tiktok.user; }

    var como = $('#comollegar');
    if (como) como.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(CFG.mapsQuery);

    var mapa = $('#mapa');
    if (mapa) {
      // El iframe se carga solo cuando la sección se acerca (ahorra ~600 KB en la primera carga)
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { mapa.src = CFG.mapsEmbed; io.disconnect(); }
        });
      }, { rootMargin: '400px' });
      io.observe(mapa);
    }

    renderHorarios();
    renderFooterCats();
  }

  /* --- Horarios: marca el día de hoy y calcula abierto / cerrado --- */
  function renderHorarios() {
    var ul = $('#horas'); if (!ul) return;
    var d = new Date().getDay();                 // 0 domingo … 6 sábado
    var idx = d === 0 ? 2 : (d === 6 ? 1 : 0);   // mapea a CFG.horarios

    if (!yaPintado(ul)) {
      ul.innerHTML = CFG.horarios.map(function (h) {
        return '<li><span>' + esc(h.dias) + '</span><span>' + esc(h.horas) + '</span></li>';
      }).join('');
    }
    /* El día de hoy se marca siempre en el cliente: el HTML es estático
       pero "hoy" cambia cada día. */
    $$('li', ul).forEach(function (li, i) { li.classList.toggle('hoy', i === idx); });

    var estado = $('#estado-hoy'); if (!estado) return;
    var hoy = CFG.horarios[idx];
    var m = /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/.exec(hoy.horas);
    if (!m) { estado.textContent = hoy.dias + ': ' + hoy.horas; return; }

    var now = new Date(), mins = now.getHours() * 60 + now.getMinutes();
    var abre = +m[1] * 60 + +m[2], cierra = +m[3] * 60 + +m[4];
    estado.textContent = (mins >= abre && mins < cierra)
      ? 'Abierto ahora · hasta ' + m[3] + ':' + m[4]
      : 'Hoy ' + hoy.horas;
  }

  function renderFooterCats() {
    var ul = $('#footer-cats'); if (!ul) return;
    if (!yaPintado(ul)) {
      ul.innerHTML = CATS.map(function (c) {
        return '<li><a href="#carta" data-goto="' + c.id + '">' + esc(c.nombre) + '</a></li>';
      }).join('');
    }
    ul.addEventListener('click', function (e) {
      var a = e.target.closest('[data-goto]'); if (!a) return;
      setCat(a.getAttribute('data-goto'));
    });
  }

  /* ---------------------------------------------------------------
     3. Marquee
  --------------------------------------------------------------- */
  function renderMarquee() {
    var el = $('#marquee'); if (!el || yaPintado(el)) return;
    var frases = ['Asados', 'Menestras', 'Parrilladas', 'Desayunos desde $2.75',
      'Almuerzos del día', 'Secos de olla', 'Jugos naturales', 'Pedidos para llevar'];
    var bloque = frases.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('');
    el.innerHTML = bloque + bloque;   // duplicado para el bucle infinito
  }

  /* ---------------------------------------------------------------
     4. Favoritos
  --------------------------------------------------------------- */
  function renderFavs() {
    var wrap = $('#favs'); if (!wrap || yaPintado(wrap)) return;
    var favs = DISHES.filter(function (p) { return p.destacado && p.img; }).slice(0, 6);

    wrap.innerHTML = favs.map(function (p, i) {
      return '<a class="fav" href="' + waDish(p) + '" target="_blank" rel="noopener" data-rv="wipe" style="--d:' + (i * 70) + 'ms">' +
        '<img src="assets/img/' + p.img + '.webp" alt="' + esc(p.nombre) + '" loading="lazy" decoding="async" width="760" height="570">' +
        '<span class="fav__price tabular">' + esc(priceLabel(p)) + '</span>' +
        '<span class="fav__body">' +
          '<span class="fav__name">' + esc(p.nombre) + '</span>' +
          '<span class="fav__desc">' + esc(p.desc) + '</span>' +
        '</span></a>';
    }).join('');
  }

  /* ---------------------------------------------------------------
     5. Carta: pestañas, búsqueda, render y cambio de piel
  --------------------------------------------------------------- */
  var estado = { cat: 'todos', q: '' };
  var carta = $('#carta'), grid = $('#platos'), tabs = $('#tabs'), intro = $('#cat-intro'), conteo = $('#conteo');

  function renderTabs() {
    if (!tabs) return;
    if (!yaPintado(tabs)) {
      var items = [{ id: 'todos', nombre: 'Todo' }].concat(CATS);
      tabs.innerHTML = items.map(function (c) {
        return '<button class="tab" type="button" role="tab" id="tab-' + c.id + '" data-cat="' + c.id + '" ' +
               'aria-selected="' + (c.id === estado.cat) + '" aria-controls="platos">' + esc(c.nombre) + '</button>';
      }).join('');
    }

    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('.tab'); if (b) setCat(b.dataset.cat);
    });
    tabs.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var all = $$('.tab', tabs), i = all.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var n = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
      n.focus(); setCat(n.dataset.cat);
    });
  }

  function setCat(id, opts) {
    estado.cat = id;
    if (grid) grid.setAttribute('aria-labelledby', 'tab-' + id);
    $$('.tab', tabs).forEach(function (t) {
      var on = t.dataset.cat === id;
      t.setAttribute('aria-selected', String(on));
      if (on) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce.matches ? 'auto' : 'smooth' });
    });
    render();
    if (!opts || opts.scroll !== false) {
      var top = carta.getBoundingClientRect().top + window.scrollY - 70;
      if (window.scrollY < top - 40 || window.scrollY > top + carta.offsetHeight)
        window.scrollTo({ top: top, behavior: reduce.matches ? 'auto' : 'smooth' });
    }
  }

  function filtrar() {
    var q = estado.q.trim().toLowerCase();
    return DISHES.filter(function (p) {
      if (estado.cat !== 'todos' && p.cat !== estado.cat) return false;
      if (!q) return true;
      var hay = (p.nombre + ' ' + p.desc + ' ' + (p.tags || []).join(' ') + ' ' +
                 (p.variantes || []).map(function (v) { return v.etiqueta; }).join(' ')).toLowerCase();
      return hay.indexOf(q) > -1;
    });
  }

  function tonoActual() {
    if (estado.cat === 'todos') return 'brasa';
    var c = CATS.filter(function (x) { return x.id === estado.cat; })[0];
    return c ? c.tono : 'brasa';
  }

  function cardHTML(p, i) {
    var media = p.img
      ? '<div class="plato__media"><img src="assets/img/' + p.img + '.webp" alt="' + esc(p.nombre) +
        '" loading="lazy" decoding="async" width="760" height="570"></div>'
      : '<div class="plato__media plato__media--empty" aria-hidden="true"><span>' + esc(p.nombre.charAt(0)) + '</span></div>';

    var precio = typeof p.precio === 'number'
      ? '<span class="plato__price tabular">' + money(p.precio) + '</span>' : '';

    var vars = (p.variantes || []).map(function (v) {
      return '<span class="plato__var"><b>' + esc(v.etiqueta) + '</b><i aria-hidden="true"></i>' +
             '<span class="tabular">' + money(v.precio) + '</span></span>';
    }).join('');

    var tags = (p.tags || []).map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('');
    if (p.nota) tags += '<span class="chip">' + esc(p.nota) + '</span>';

    return '<article class="plato" data-rv="card" style="--d:' + Math.min(i, 7) * 60 + 'ms">' + media +
      '<div class="plato__body">' +
        '<div class="plato__top"><h4 class="plato__name">' + esc(p.nombre) + '</h4>' + precio + '</div>' +
        '<p class="plato__desc">' + esc(p.desc) + '</p>' +
        (vars ? '<div class="plato__vars">' + vars + '</div>' : '') +
        (tags ? '<div class="plato__tags">' + tags + '</div>' : '') +
        '<a class="plato__wa" href="' + waDish(p) + '" target="_blank" rel="noopener">' +
          '<svg aria-hidden="true"><use href="#i-wa"></use></svg>' +
          '<span class="plato__wa-txt">Pedir para llevar</span>' +
          '<span class="sr-only"> ' + esc(p.nombre) + '</span></a>' +
      '</div></article>';
  }

  var primeraPasada = true;
  function render() {
    if (!grid) return;

    if (primeraPasada) {
      primeraPasada = false;
      /* El HTML de build.js ya es exactamente esta vista */
      if (yaPintado(grid) && estado.cat === 'todos' && !estado.q.trim()) {
        conteo.textContent = DISHES.length + ' platos, agrupados por sección.';
        observeReveals(grid);
        return;
      }
    }

    var lista = filtrar();
    var tono = tonoActual();
    if (carta.getAttribute('data-tone') !== tono) carta.setAttribute('data-tone', tono);

    /* Encabezado de la sección elegida */
    var c = CATS.filter(function (x) { return x.id === estado.cat; })[0];
    intro.innerHTML = c
      ? '<p class="script">' + esc(c.lema) + '</p><h3>' + esc(c.nombre) + '</h3><p class="muted">' + esc(c.desc) + '</p>'
      : '<p class="script">Todo lo que servimos</p><h3>La carta completa</h3>' +
        '<p class="muted">' + DISHES.length + ' platos y bebidas, de los desayunos a la parrillada.</p>';

    /* En "Todo" se agrupa por categoría: 57 tarjetas seguidas son el
       "muro plano de contenido" que hay que evitar. */
    if (estado.cat === 'todos' && !estado.q.trim()) {
      grid.className = 'platos-grupos';
      grid.innerHTML = CATS.map(function (c) {
        var dela = lista.filter(function (p) { return p.cat === c.id; });
        if (!dela.length) return '';
        return '<section class="grupo" data-grupo="' + c.id + '">' +
          '<header class="grupo__cab">' +
            '<span class="grupo__lema script">' + esc(c.lema) + '</span>' +
            '<h4 class="grupo__nombre">' + esc(c.nombre) + '</h4>' +
            '<span class="grupo__linea" aria-hidden="true"></span>' +
            '<span class="grupo__n tabular">' + dela.length + '</span>' +
          '</header>' +
          '<div class="platos">' + dela.map(cardHTML).join('') + '</div>' +
        '</section>';
      }).join('');
      conteo.textContent = lista.length + ' platos, agrupados por sección.';
      observeReveals(grid);
      return;
    }
    grid.className = 'platos';

    if (!lista.length) {
      grid.innerHTML = '<div class="vacio" style="grid-column:1/-1">' +
        '<svg aria-hidden="true"><use href="#i-search"></use></svg>' +
        '<p>No encontramos <b>' + esc(estado.q) + '</b> en esta sección.</p>' +
        '<button class="btn btn--ghost btn--sm" type="button" id="ver-todo">Ver toda la carta</button></div>';
      var vt = $('#ver-todo');
      if (vt) vt.addEventListener('click', function () {
        estado.q = ''; var qi = $('#q'); if (qi) qi.value = '';
        $('#limpiar').hidden = true; setCat('todos', { scroll: false });
      });
    } else {
      grid.innerHTML = lista.map(cardHTML).join('');
    }

    conteo.textContent = lista.length + ' platos en pantalla.';
    observeReveals(grid);
  }

  function initSearch() {
    var input = $('#q'), clear = $('#limpiar'); if (!input) return;
    var t;
    input.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        estado.q = input.value;
        clear.hidden = !input.value;
        render();
      }, 160);
    });
    clear.addEventListener('click', function () {
      input.value = ''; estado.q = ''; clear.hidden = true; render(); input.focus();
    });
  }

  /* ---------------------------------------------------------------
     6. Reseñas
  --------------------------------------------------------------- */
  function renderResenas() {
    var wrap = $('#resenas-grid'); if (!wrap || yaPintado(wrap)) return;
    wrap.innerHTML = REVS.map(function (r, i) {
      var stars = '';
      for (var s = 0; s < r.estrellas; s++) stars += '<svg aria-hidden="true"><use href="#i-star"></use></svg>';

      /* Sin comentario escrito no se inventa una cita: se muestra la
         calificación tal cual la dejó la persona. */
      var cuerpo = r.texto
        ? '<blockquote>“' + esc(r.texto) + '”</blockquote>'
        : '<p class="resena__solo">Calificó con ' + r.estrellas + ' estrellas, sin comentario.</p>';

      var datos = (r.datos || []).map(function (d) {
        return '<span class="chip">' + esc(d) + '</span>';
      }).join('');

      return '<figure class="resena" data-rv="card" style="--d:' + (i * 70) + 'ms">' +
        '<div class="estrellas" role="img" aria-label="' + r.estrellas + ' de 5 estrellas">' + stars + '</div>' +
        cuerpo +
        (datos ? '<div class="plato__tags">' + datos + '</div>' : '') +
        '<figcaption><span class="resena__av" aria-hidden="true">' + esc(r.autor.charAt(0)) + '</span>' +
        '<span>' + esc(r.autor) + ' · ' + esc(r.fuente) + '</span></figcaption></figure>';
    }).join('');
  }

  /* ---------------------------------------------------------------
     7. Reveal al hacer scroll
  --------------------------------------------------------------- */
  var revealIO = null;
  function observeReveals(scope) {
    var nodes = $$('[data-rv], [data-rv-mask]', scope || document).filter(function (n) { return !n.classList.contains('is-in'); });
    if (reduce.matches) { nodes.forEach(function (n) { n.classList.add('is-in'); }); return; }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    nodes.forEach(function (n) { revealIO.observe(n); });
  }

  /* ---------------------------------------------------------------
     8. Navegación: sticky, progreso, scrollspy, drawer
  --------------------------------------------------------------- */
  function initNav() {
    var nav = $('#nav'), prog = $('#progress'), fab = $('#fab');
    var links = $$('.nav__link');
    var secciones = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        nav.classList.toggle('is-stuck', y > 40);
        if (fab) fab.classList.toggle('is-on', y > window.innerHeight * 0.6);

        var h = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.setProperty('--p', h > 0 ? Math.min(y / h, 1) : 0);

        var mid = y + window.innerHeight * 0.35, activo = -1;
        secciones.forEach(function (s, i) { if (s && s.offsetTop <= mid) activo = i; });
        links.forEach(function (a, i) {
          if (i === activo) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Drawer móvil */
    var burger = $('#burger'), drawer = $('#drawer'), last = null;
    function toggle(open) {
      burger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('data-open', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      if (open) { last = document.activeElement; var f = drawer.querySelector('a'); if (f) f.focus(); }
      else if (last) last.focus();
    }
    burger.addEventListener('click', function () { toggle(burger.getAttribute('aria-expanded') !== 'true'); });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) toggle(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.getAttribute('data-open') === 'true') toggle(false);
    });
    /* Trampa de foco sencilla mientras el drawer está abierto */
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('a, button', drawer);
      if (!f.length) return;
      var first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------------------------------------------------------------
     9. Hero: entrada, parallax de los aros y pedido rápido
  --------------------------------------------------------------- */
  function initHero() {
    var hero = $('#inicio'); if (!hero) return;
    requestAnimationFrame(function () { hero.classList.add('is-ready'); });

    /* Los aros se hunden un poco al bajar: da profundidad sin marear */
    var stage = $('.hero__stage'), tick = false;
    if (stage && !reduce.matches) {
      window.addEventListener('scroll', function () {
        if (tick || window.scrollY > window.innerHeight * 1.2) return;
        tick = true;
        requestAnimationFrame(function () {
          stage.style.setProperty('--par', (window.scrollY * 0.14) + 'px');
          tick = false;
        });
      }, { passive: true });
    }

    /* Los aros solo giran mientras el hero está a la vista */
    var spins = $$('.hero__spin');
    if (spins.length) {
      new IntersectionObserver(function (e) {
        var on = e[0].isIntersecting;
        spins.forEach(function (el) { el.style.animationPlayState = on ? 'running' : 'paused'; });
      }, { threshold: 0.01 }).observe(hero);
      document.addEventListener('visibilitychange', function () {
        spins.forEach(function (el) {
          el.style.animationPlayState = document.hidden ? 'paused' : 'running';
        });
      });
    }

    initPedido();
  }

  /* --- Pedido rápido: escribe el antojo y se abre WhatsApp --------- */
  function initPedido() {
    var caja = $('.pedido'), form = $('#pedido-form'), input = $('#pedido-input');
    if (!caja || !form || !input) return;
    var volver = null;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var texto = input.value.trim();
      if (!texto) { input.focus(); return; }

      var url = waLink('¡Hola ' + CFG.nombre + '! 👋 Quiero pedir para llevar: ' + texto +
        '. ¿A qué hora lo tengo listo?');

      /* Se abre dentro del gesto del usuario para que no lo frene el
         bloqueador de ventanas emergentes. */
      var w = window.open(url, '_blank', 'noopener');
      if (!w) { window.location.href = url; return; }

      caja.classList.add('is-ok');
      confeti();
      input.value = '';

      clearTimeout(volver);
      volver = setTimeout(function () { caja.classList.remove('is-ok'); }, 6000);
    });
  }

  /* --- Confeti de confirmación (canvas, sin librerías) ------------- */
  function confeti() {
    var cv = $('#confeti');
    if (!cv || reduce.matches) return;

    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = cv.offsetWidth, h = cv.offsetHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var tonos = ['#FF6A00', '#F2A63B', '#25D366', '#FFD79A', '#FFFFFF'];
    var trozos = [];
    for (var i = 0; i < 64; i++) {
      trozos.push({
        x: w / 2, y: h / 2,
        vx: (Math.random() - 0.5) * 13,
        vy: (Math.random() - 1.9) * 9,
        vida: 100,
        color: tonos[Math.floor(Math.random() * tonos.length)],
        r: Math.random() * 3.4 + 1.6,
        giro: Math.random() * 6.28
      });
    }

    (function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = trozos.length - 1; i >= 0; i--) {
        var p = trozos[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.42; p.vida -= 1.9; p.giro += 0.15;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.vida / 100);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.giro);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
        ctx.restore();
        if (p.vida <= 0) trozos.splice(i, 1);
      }
      if (trozos.length) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, w, h);
    })();
  }

  /* --------------------------------------------------------------
     10. Brillo que sigue al cursor en los botones (solo con ratón)
  -------------------------------------------------------------- */
  function initBotones() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || reduce.matches) return;
    document.addEventListener('pointermove', function (e) {
      var b = e.target.closest('.btn'); if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      b.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     11. PWA: service worker + invitación a instalar
  --------------------------------------------------------------- */
  function initPWA() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () { /* silencioso */ });
      });
    }

    var box = $('#instalar'), si = $('#instalar-si'), no = $('#instalar-no'), prompt = null;
    if (!box) return;
    if (localStorage.getItem('ld-instalar-no') === '1') return;

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); prompt = e;
      setTimeout(function () { box.setAttribute('data-show', 'true'); }, 7000);
    });
    si.addEventListener('click', function () {
      box.setAttribute('data-show', 'false');
      if (prompt) { prompt.prompt(); prompt = null; }
    });
    no.addEventListener('click', function () {
      box.setAttribute('data-show', 'false');
      try { localStorage.setItem('ld-instalar-no', '1'); } catch (err) { /* modo privado */ }
    });
    window.addEventListener('appinstalled', function () { box.setAttribute('data-show', 'false'); });
  }

  /* ---------------------------------------------------------------
     12. Arranque
  --------------------------------------------------------------- */
  function init() {
    hydrateConfig();
    renderMarquee();
    renderFavs();
    renderTabs();
    render();
    initSearch();
    renderResenas();
    initNav();
    initHero();
    initBotones();
    initPWA();
    observeReveals(document);

    /* Enlace directo a una sección de la carta: index.html#carta=parrilla */
    var m = /[#&]carta=([a-z]+)/.exec(location.hash);
    if (m && CATS.some(function (c) { return c.id === m[1]; })) setCat(m[1]);

    reduce.addEventListener('change', function () { if (reduce.matches) observeReveals(document); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
