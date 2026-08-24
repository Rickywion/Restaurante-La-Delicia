# La Delicia — Sitio web

Sitio estático (HTML + CSS + JavaScript, **sin dependencias ni build**) para
**La Delicia · Restaurante Cafetería**, Quito, Ecuador.

---

## 1. Datos del negocio

Todo lo editable vive en un solo archivo: **`assets/js/menu-data.js`**, arriba del todo,
en el bloque `window.LD_CONFIG`. Datos ya confirmados por el cliente (22/08/2026):

| Dato | Valor |
|---|---|
| **Dirección** | Av. Mariana de Jesús y Alemania, esquina · Quito |
| **Lunes a viernes** | 08:00 – 18:00 |
| **Sábado** | 08:00 – 16:30 |
| **Domingo** | 08:00 – 16:30 ⚠️ *cierre por confirmar* |
| **WhatsApp / teléfono** | 099 993 3826 |
| **Reseñas** | 5 reseñas reales de Google, texto literal |

De los horarios sale el aviso **“Abierto ahora”** del hero y el resaltado del día
de hoy en la sección Visítanos: si cambian, se cambian aquí y el resto se ajusta solo.

> ⚠️ **Único dato sin confirmar:** la **hora de cierre del domingo**. Está puesta
> igual que la del sábado (16:30) porque abren a las 8:00 los 7 días, pero nadie
> confirmó a qué hora cierran ese día. Corregirla en `LD_CONFIG.horarios`.

> **Pendiente fuera del sitio:** la ficha de Google Business todavía muestra
> *11:30 – 18:00* entre semana, *07:30* los sábados y **domingo cerrado**. Los tres
> datos están desactualizados y conviene corregirlos allá, porque es lo que ve quien
> busca “restaurantes cerca” en el mapa — y hoy le está diciendo a la gente que el
> domingo no abren.

El mapa y el botón “Cómo llegar” usan una **búsqueda por nombre y dirección**
(`mapsQuery` / `mapsEmbed`). Cuando tengas la ficha de Google Business verificada,
pega ahí el enlace exacto y quedará clavado en el punto preciso.

### Sobre las reseñas

Están en `window.LD_RESENAS`, al final del mismo archivo. Reglas para mantenerlas:

- `texto` debe ser **literal**, tal como lo escribió la persona. Nunca redactar una
  frase y ponerla entre comillas a nombre de un cliente real.
- Si alguien calificó sin escribir comentario, se deja `texto: ''` y el sitio muestra
  “Calificó con 5 estrellas, sin comentario” en lugar de inventar una cita.
- `datos` son los campos que Google muestra aparte (precio por persona, tiempo de
  espera, etc.). Se pintan como etiquetas, fuera de la cita.
- La reseña de *Revista Nuestro Hermoso Ecuador* está recortada a propósito: se le
  quitó la firma promocional del autor y la mención de precios de hace dos años.

---

## 2. Cómo publicarlo

No necesita servidor Node ni compilación: es una carpeta que se sube tal cual.

**Netlify / Vercel (gratis, lo más rápido)**
1. Entra a netlify.com → *Add new site* → *Deploy manually*.
2. Arrastra la carpeta `la-delicia-web` completa.
3. Listo. Después conectas el dominio propio desde *Domain settings*.

**Hosting tradicional (cPanel, Hostinger…)**
Sube todo el contenido de la carpeta a `public_html/` por FTP.

**Requisito único:** que se sirva por **HTTPS**. Sin HTTPS no funciona la
instalación en el celular (PWA) ni el modo sin conexión.

### Probarlo en tu computadora

```bash
python -m http.server 8123
```

Y abre `http://127.0.0.1:8123`. (Abrir el `index.html` con doble clic también
se ve bien, pero el service worker no se activa con `file://`.)

---

## 3. Cómo actualizar la carta

Todo está en `assets/js/menu-data.js`. No se toca ni el HTML ni el CSS.

> ### ⚠️ Después de editar hay que correr un comando
>
> ```bash
> node build.js
> ```
>
> **Por qué:** la carta está escrita dentro de `index.html`, no la genera el
> navegador. Así el menú lo ve Google y lo ve cualquiera aunque el JavaScript
> falle. `build.js` lee `menu-data.js` y reescribe esa parte del HTML.
> Si editas los datos y no corres el comando, la web seguirá mostrando la
> carta vieja.
>
> Necesitas Node instalado solo para esto (nodejs.org). El sitio publicado
> no necesita Node para nada.

**Cambiar un precio**

```js
{ id:'s2', cat:'secos', nombre:'Seco de pollo', desc:'Incluye arroz, ensalada y papa.',
  precio:3.99, img:'seco-pollo', destacado:true },
```

**Añadir un plato nuevo**

```js
{ id:'e6', cat:'especiales', nombre:'Mote con chicharrón',
  desc:'Mote, chicharrón, maduro y ensalada.', precio:4.50, img:null }
```

| Campo | Para qué sirve |
|---|---|
| `cat` | En qué pestaña aparece (`desayunos`, `antojitos`, `menestras`, `parrilla`, `especiales`, `secos`, `otros`, `porciones`, `bebidas`). |
| `precio` | Número. Si el plato tiene varios precios, pon `precio: null` y usa `variantes`. |
| `variantes` | `[{ etiqueta:'Con arroz moro', precio:5.75 }]` |
| `img` | Nombre del archivo en `assets/img/` **sin extensión**. `null` deja un mosaico de marca elegante. |
| `destacado: true` | Lo sube a la sección “Los favoritos” de la portada (usa máximo 6). |
| `tags` | Etiquetas pequeñas: `['combo']`, `['2 personas']`, `['fría']`. |

**Añadir una foto nueva:** guarda la imagen en `assets/img/` como `.webp`
(recomendado 760 px de ancho) y pon su nombre en `img`.

**Importante:** después de `node build.js`, cada vez que subas cambios sube también el número de versión en
`sw.js` (`const CACHE_VERSION = 'ld-v3'` → `'ld-v4'`, y así). Así el celular de los
clientes descarta la copia vieja y ve la carta nueva.

---

## 4. Qué trae el sitio

- **Portada** con el escudo de la marca sobre tres aros de platos difuminados que
  giran en sentido del reloj a distinta velocidad (profundidad), inclinados en
  perspectiva y con parallax suave al bajar. Los aros se detienen solos cuando la
  portada sale de pantalla o la pestaña queda en segundo plano.
- **Pedido rápido en la portada**: el visitante escribe lo que se le antoja y el
  botón abre WhatsApp con el mensaje ya redactado; la barra se transforma en una
  confirmación verde con confeti. Estado “Abierto ahora” calculado en vivo.
- **Los favoritos** — mosaico tipo bento con los 6 platos marcados como destacados.
- **La carta completa** — 57 platos y bebidas, 9 secciones (primero las de tono
  claro: desayunos, antojitos, porciones y bebidas; después las de brasa),
  buscador instantáneo y **cambio de piel automático**: fondo de brasa para
  carnes y parrilla, fondo claro de mañana para desayunos, porciones y bebidas.
  El cambio dura 900 ms con una curva suave. Entre secciones de distinto tono
  hay una banda de fundido de hasta 380 px con 19 paradas de color y una capa de
  ruido al 5 %: sin ese ruido, un degradado tan largo en 8 bits deja franjas
  visibles. Las secciones afectadas reservan ese alto arriba (`.sec--fundido`)
  para que el fundido termine antes del primer texto.
- **Cada plato tiene su botón de WhatsApp** con el mensaje ya escrito
  (“Quiero pedir para llevar: Costillas BBQ ($9.99)…”).
- **Visítanos** — galería del local, dirección, horarios con el día de hoy
  resaltado, mapa de Google que se carga solo al acercarse (ahorra ~600 KB).
- **Reseñas** + métricas del negocio.
- **Botón flotante de WhatsApp** que aparece al bajar.
- **PWA instalable**: se guarda en el escritorio del celular y la carta se
  puede ver sin datos.
- **La carta viene escrita en el HTML** (`node build.js`), no la monta el
  navegador. Google la indexa sin ejecutar JavaScript y la página sirve
  aunque el JS falle. El JavaScript toma el mando al filtrar o buscar.
- **SEO**: datos estructurados `Restaurant` de schema.org (horarios, precios,
  menú, redes), Open Graph para que se vea bien al compartir por WhatsApp,
  `sitemap.xml` y `robots.txt`.

### Accesibilidad y rendimiento

Medido, no estimado (auditoría del 22/08/2026):

- **Contraste WCAG AA:** 18 de 18 pares de texto medidos pasan en **las dos
  pieles**, la mayoría entre 6:1 y 17:1.
- **Áreas táctiles:** todo control interactivo mide 44 px o más de alto.
- **Peso:** 36 KB de código comprimido + 170 KB de imágenes en la primera
  pantalla = **207 KB**. Cero librerías externas.
- Foco visible, navegación completa por teclado (incluye flechas ← → en las
  pestañas), trampa de foco en el menú móvil, enlace para saltar al contenido.
- `prefers-reduced-motion` respetado: si el usuario pide menos animación, se
  detienen los aros, el parallax, el confeti y el marquee.
- Imágenes en WebP con `width`/`height` declarados (sin saltos de maquetación),
  carga diferida abajo del pliegue. La carpeta completa pesa ~1,9 MB.
- Cero librerías externas: solo se pide fuera la tipografía de Google Fonts.

---

## 5. Estructura

```
la-delicia-web/
├── index.html                 página única · la carta va escrita aquí dentro
├── build.js                   escribe la carta en index.html (node build.js)
├── manifest.webmanifest       PWA
├── sw.js                      modo sin conexión (subir versión al publicar)
├── robots.txt · sitemap.xml   SEO
├── favicon.ico
└── assets/
    ├── css/styles.css         sistema de diseño (tokens + 2 pieles)
    ├── js/menu-data.js        ← DATOS: carta, horarios, contacto, reseñas
    ├── js/app.js              lógica e interacciones
    └── img/                   escudo, aros de la portada, 33 fotos de platos, fotos del local
```

Las fotos de los platos se recortaron una por una del PDF del menú y las del
local de las capturas de Google Maps. Los tres aros de la portada (`aro-1/2/3.webp`)
se generaron componiendo esas mismas fotos en círculo y difuminándolas de una vez,
para que el navegador no tenga que aplicar `blur` en tiempo real: pesan 117 KB entre
los tres y giran a 60 fps sin castigar la batería.

### El logo

Se usa **solo la marca**: sartén, humo, sombrero, “La Delicia” y el banderín
naranja. Sin el aro ni el texto curvo “RESTAURANTE / CAFETERÍA”.

| Archivo | Dónde se usa |
|---|---|
| `logo-marca-neg.webp` (720 px) | **Portada.** Versión en negativo: los trazos negros pasan a crema y **las contraformas de las letras y el interior del sombrero son transparentes**, no negras. Sobre el fondo oscuro el sartén negro original desaparecería. |
| `logo-marca-neg-nav.webp` (420 px) | **Barra superior.** Igual pero **sin el banderín**: a 34 px de alto, “RESTAURANT · CAFETERIA” es una mancha ilegible. Un logo bien resuelto tiene variante simplificada para tamaño reducido. |
| `logo-marca-neg-sm.webp` (300 px) | **Pie de página**, donde sí cabe el banderín. |

Los tres salen de `negativo.py` (en la carpeta de trabajo, fuera del sitio) a
partir del logo del menú en PDF. Si consigues el **archivo vectorial original**
(SVG o AI), pásalo: es mejor que cualquier recorte y se reemplaza sin tocar nada más. Cuando tengas fotos propias en alta
resolución, reemplaza los archivos de `assets/img/` conservando el mismo nombre
y el sitio las toma sin tocar nada más.

---

## 6. Tipografías

| Uso | Fuente |
|---|---|
| Títulos y precios | **Oswald** — condensada, igual que la pizarra del local |
| Frases sueltas y acentos | **Lobster Two** cursiva — el aire del logo y del menú impreso |
| Texto corrido | **Karla** |

Paleta tomada de la marca: naranja brasa `#FF6A00`, ámbar del logo `#F2A63B`,
carbón `#0C0A09` y crema `#FCF6EC`.
