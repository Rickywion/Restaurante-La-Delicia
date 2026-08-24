/* =====================================================================
   LA DELICIA — Restaurante · Cafetería  (Quito, Ecuador)
   Fuente de verdad del negocio + carta completa.
   Editar SOLO este archivo para actualizar precios, horarios o datos.
   ===================================================================== */

window.LD_CONFIG = {
  nombre: 'La Delicia',
  claim: 'Asados · Menestras · Parrilladas y algo más',
  ciudad: 'Quito, Ecuador',

  /* ---- Datos confirmados por el cliente (22/08/2026) ------------- */
  direccion: 'Av. Mariana de Jesús y Alemania',
  direccionLinea2: 'Esquina · Quito, Ecuador',
  mapsQuery: 'La Delicia Restaurante Cafeteria, Av. Mariana de Jesus y Alemania, Quito',
  mapsEmbed: 'https://www.google.com/maps?q=La+Delicia+Restaurante+Cafeteria,+Av.+Mariana+de+Jesus+y+Alemania,+Quito&output=embed',
  /* Apertura 08:00 los 7 días (dato del cliente; la ficha de Google todavía
     muestra 11:30 entre semana y domingo cerrado — hay que corregirla allá).
     OJO: la hora de cierre del domingo está puesta igual que la del sábado
     porque el cliente no la indicó. Confirmar antes de publicar. */
  horarios: [
    { dias: 'Lunes a viernes', horas: '08:00 – 18:00' },
    { dias: 'Sábado',          horas: '08:00 – 16:30' },
    { dias: 'Domingo',         horas: '08:00 – 16:30' }
  ],
  /* --------------------------------------------------------------- */

  telefono: '099 993 3826',
  whatsapp: 'https://api.whatsapp.com/send/?phone=%2B593999933826&text&type=phone_number&app_absent=0',
  whatsappBase: 'https://api.whatsapp.com/send/?phone=%2B593999933826&type=phone_number&app_absent=0&text=',
  redes: {
    instagram: { user: '@ladelicia_restaurant', url: 'https://www.instagram.com/ladelicia_restaurant/' },
    tiktok:    { user: '@ladelicia.restaurant', url: 'https://www.tiktok.com/@ladelicia.restaurant' }
    /* Facebook retirado: el perfil no está activo. Para reponerlo, añadir aquí
       facebook: { user: '…', url: '…' } y el <a id="red-fb"> en index.html */
  }
};

/* Categorías. `tono` define la piel de la sección:
   'brasa' = oscuro (carnes, parrilla)  ·  'dia' = claro (desayunos, bebidas) */
window.LD_CATEGORIAS = [
  /* Orden pedido por el cliente: primero las secciones de tono claro
     (desayunos, antojitos, porciones, bebidas) y después las de brasa. */
  { id: 'desayunos',  nombre: 'Desayunos',     tono: 'dia',   icono: 'sun',
    lema: 'Empieza el día como en casa',  desc: 'Tigrillos, bolones y tortillas de verde recién hechos, siempre con café.' },
  { id: 'antojitos',  nombre: 'Antojitos',     tono: 'dia',   icono: 'leaf',
    lema: 'Para el hambre de media mañana', desc: 'Empanadas, humitas, sánduches y frutas frescas del día.' },
  { id: 'porciones',  nombre: 'Porciones',     tono: 'dia',   icono: 'bowl',
    lema: 'Añade lo que te falte',        desc: 'Acompañados para completar tu plato como más te gusta.' },
  { id: 'bebidas',    nombre: 'Bebidas',       tono: 'dia',   icono: 'cup',
    lema: 'Frías y calientes',            desc: 'Jugos naturales, batidos, café, morocho y chocolate de Ambato.' },
  { id: 'menestras',  nombre: 'Menestras',     tono: 'brasa', icono: 'flame',
    lema: 'El almuerzo de toda la vida',  desc: 'Menestra de fréjol o lenteja, arroz moro o blanco, maduro y ensalada.' },
  { id: 'parrilla',   nombre: 'A la parrilla', tono: 'brasa', icono: 'flame',
    lema: 'Directo del carbón',           desc: 'Cortes a la parrilla con porción de papas, ensalada y salsas de la casa.' },
  { id: 'especiales', nombre: 'Especiales',    tono: 'brasa', icono: 'star',
    lema: 'Para compartir a lo grande',   desc: 'Alitas, costillas, parrilladas y la picadita para dos.' },
  { id: 'secos',      nombre: 'Secos',         tono: 'brasa', icono: 'pot',
    lema: 'Cocción lenta, sabor de olla', desc: 'Secos servidos con arroz, ensalada y su acompañado.' },
  { id: 'otros',      nombre: 'Platos fuertes',tono: 'brasa', icono: 'plate',
    lema: 'Clásicos que nunca fallan',    desc: 'Apanado, milanesa y churrasco en porción generosa.' },
];

/* precio: número (USD) o null si tiene variantes.
   variantes: [{ etiqueta, precio }] · destacado: aparece en "Los favoritos" */
window.LD_PLATOS = [
  /* ---------------------------- DESAYUNOS ---------------------------- */
  { id:'d1', cat:'desayunos', nombre:'Tigrillo de queso', desc:'Tigrillo de queso + huevos + café.', precio:3.00, img:'combo-tigrillo', tags:['combo'] },
  { id:'d2', cat:'desayunos', nombre:'Tigrillo de chicharrón', desc:'Tigrillo de chicharrón + huevos + café.', precio:3.25, img:'combo-tigrillo-b', tags:['combo'] },
  { id:'d3', cat:'desayunos', nombre:'Tigrillo mixto', desc:'Tigrillo mixto + huevos + café.', precio:3.50, img:'combo-tigrillo-c', tags:['combo'], destacado:true },
  { id:'d4', cat:'desayunos', nombre:'Tortillas de verde', desc:'3 tortillas de verde + huevo + queso + café.', precio:2.75, img:'combo-tortillas', tags:['combo'] },
  { id:'d5', cat:'desayunos', nombre:'Bolón de queso', desc:'Bolón de queso + 2 huevos + café.', precio:3.00, img:'combo-bolon', tags:['combo'] },
  { id:'d6', cat:'desayunos', nombre:'Bolón de chicharrón', desc:'Bolón de chicharrón + 2 huevos + café.', precio:3.25, img:'combo-bolon-b', tags:['combo'] },
  { id:'d7', cat:'desayunos', nombre:'Bolón mixto', desc:'Bolón mixto + 2 huevos + café.', precio:3.50, img:'combo-bolon-c', tags:['combo'] },
  { id:'d8', cat:'desayunos', nombre:'Patacones con queso', desc:'Patacones + queso + huevo + café.', precio:2.75, img:'combo-patacones', tags:['combo'] },

  /* ---------------------------- ANTOJITOS ---------------------------- */
  { id:'a1', cat:'antojitos', nombre:'Empanadas', desc:'De queso, pollo, carne o hawaiana.', precio:1.25, img:'ant-empanadas', destacado:true },
  { id:'a2', cat:'antojitos', nombre:'Humitas', desc:'Humita de choclo tierno, recién sacada de la olla.', precio:1.00, img:null },
  { id:'a3', cat:'antojitos', nombre:'Bolones', desc:'Verde majado con relleno a elección.', precio:null, img:'combo-bolon',
    variantes:[{etiqueta:'De queso',precio:1.50},{etiqueta:'De chicharrón',precio:1.75},{etiqueta:'Mixto',precio:2.00}] },
  { id:'a4', cat:'antojitos', nombre:'Sánduche', desc:'Jamón, queso mozzarella, lechuga crespa, tomate y mayonesa de la casa.', precio:null, img:'ant-sanduche', destacado:true,
    variantes:[{etiqueta:'Solo',precio:2.25},{etiqueta:'Combo con jugo',precio:3.50},{etiqueta:'Combo con batido',precio:3.75}] },
  { id:'a5', cat:'antojitos', nombre:'Bowl de frutas', desc:'Fruta fresca picada del día.', precio:1.00, img:null },
  { id:'a6', cat:'antojitos', nombre:'Ensalada de frutas', desc:'Mezcla de frutas de temporada.', precio:2.50, img:null },
  { id:'a7', cat:'antojitos', nombre:'Frutas + yogurt y granola', desc:'Fruta fresca con yogurt natural y granola.', precio:null, img:null, nota:'Consultar precio del día' },

  /* ---------------------------- MENESTRAS ---------------------------- */
  { id:'m1', cat:'menestras', nombre:'Menestra con chuleta', desc:'Menestra (fréjol o lenteja), arroz moro o blanco, maduro y ensalada.', precio:null, img:'menestra-chuleta',
    variantes:[{etiqueta:'Con arroz blanco',precio:4.99},{etiqueta:'Con arroz moro',precio:5.75}] },
  { id:'m2', cat:'menestras', nombre:'Menestra con carne', desc:'Menestra (fréjol o lenteja), arroz moro o blanco, maduro y ensalada.', precio:null, img:'menestra-carne',
    variantes:[{etiqueta:'Con arroz blanco',precio:4.99},{etiqueta:'Con arroz moro',precio:5.75}] },
  { id:'m3', cat:'menestras', nombre:'Menestra con pollo', desc:'Menestra (fréjol o lenteja), arroz moro o blanco, maduro y ensalada.', precio:null, img:'menestra-pollo',
    variantes:[{etiqueta:'Con arroz blanco',precio:4.75},{etiqueta:'Con arroz moro',precio:5.50}] },
  { id:'m4', cat:'menestras', nombre:'Menestra mixta', desc:'Dos tipos de carne, menestra (fréjol o lenteja), arroz moro o blanco, maduro y ensalada.', precio:null, img:'menestra-mixta', destacado:true,
    variantes:[{etiqueta:'Con arroz blanco',precio:7.00},{etiqueta:'Con arroz moro',precio:7.75}] },

  /* ---------------------------- PARRILLA ----------------------------- */
  { id:'p1', cat:'parrilla', nombre:'Lomo a la parrilla', desc:'Porción de papas, ensalada y salsas.', precio:4.50, img:'parrilla-lomo' },
  { id:'p2', cat:'parrilla', nombre:'Filete de pollo a la parrilla', desc:'Porción de papas, ensalada y salsas.', precio:4.25, img:'parrilla-pollo' },
  { id:'p3', cat:'parrilla', nombre:'Chuleta a la parrilla', desc:'Porción de papas, ensalada y salsas.', precio:4.50, img:'parrilla-chuleta' },

  /* --------------------------- ESPECIALES ---------------------------- */
  { id:'e1', cat:'especiales', nombre:'Alitas', desc:'8 alitas, porción de papas, ensalada y una salsa a elección: BBQ, maracuyá o miel y mostaza.', precio:7.75, img:'esp-alitas', destacado:true },
  { id:'e2', cat:'especiales', nombre:'Costillas BBQ', desc:'600 g de costilla de cerdo, porción de papas, salsa BBQ y ensalada.', precio:9.99, img:'esp-costillas', destacado:true },
  { id:'e3', cat:'especiales', nombre:'Parrillada', desc:'Chuleta, filete de pollo, chorizo ahumado, chorizo parrillero, porción de papas, ensalada y salsas.', precio:8.00, img:'esp-parrillada' },
  { id:'e4', cat:'especiales', nombre:'Guatita', desc:'Guatita en salsa de maní con arroz, aguacate y ensalada.', precio:3.50, img:'esp-guatita' },
  { id:'e5', cat:'especiales', nombre:'Picadita parrillera para dos', desc:'Lomo de res, cerdo, pollo, chorizo paisa, chorizo parrillero, chorizo ahumado, porción de papas, deditos de verde y ensalada.', precio:13.99, img:'esp-picadita', destacado:true, tags:['2 personas'] },

  /* ------------------------------ SECOS ------------------------------ */
  { id:'s1', cat:'secos', nombre:'Seco de carne', desc:'Incluye arroz, ensalada y maduro.', precio:3.50, img:'seco-carne' },
  { id:'s2', cat:'secos', nombre:'Seco de pollo', desc:'Incluye arroz, ensalada y papa.', precio:3.99, img:'seco-pollo', destacado:true },
  { id:'s3', cat:'secos', nombre:'Seco de chivo', desc:'Incluye arroz, ensalada y papa.', precio:6.25, img:'seco-chivo' },
  { id:'s4', cat:'secos', nombre:'Seco de chancho', desc:'Incluye arroz, ensalada y maduro.', precio:3.75, img:'seco-chancho' },

  /* ------------------------------ OTROS ------------------------------ */
  { id:'o1', cat:'otros', nombre:'Apanado', desc:'Lomo de res, arroz, porción de papas, ensalada y salsas.', precio:5.99, img:'otro-apanado' },
  { id:'o2', cat:'otros', nombre:'Milanesa', desc:'Filete de pollo, arroz, porción de papas, ensalada y salsas.', precio:5.75, img:'otro-milanesa' },
  { id:'o3', cat:'otros', nombre:'Churrasco', desc:'Lomo de res, 2 huevos, porción de papas, arroz y ensalada.', precio:5.99, img:'otro-churrasco', destacado:true },

  /* ---------------------------- PORCIONES ---------------------------- */
  { id:'r1', cat:'porciones', nombre:'Choclo con queso', desc:'Choclo tierno con queso fresco.', precio:2.00, img:'por-choclo' },
  { id:'r2', cat:'porciones', nombre:'Maduro', desc:'Maduro frito al punto.', precio:2.00, img:null },
  { id:'r3', cat:'porciones', nombre:'Menestra', desc:'Fréjol o lenteja.', precio:1.75, img:null },
  { id:'r4', cat:'porciones', nombre:'Patacones', desc:'Verde aplastado y frito.', precio:2.00, img:null },
  { id:'r5', cat:'porciones', nombre:'Papas', desc:'Porción de papas fritas.', precio:2.00, img:null },
  { id:'r6', cat:'porciones', nombre:'Arroz', desc:'Porción de arroz blanco.', precio:1.50, img:'por-arroz' },
  { id:'r7', cat:'porciones', nombre:'Ensalada', desc:'Lechuga crespa, tomate, aros de cebolla, zanahoria y vinagreta.', precio:1.50, img:'por-ensalada' },

  /* ----------------------------- BEBIDAS ----------------------------- */
  { id:'b1',  cat:'bebidas', nombre:'Jugos naturales', desc:'Fruta de temporada, hechos al momento.', precio:1.50, img:'beb-jugo', tags:['fría'], destacado:true },
  { id:'b2',  cat:'bebidas', nombre:'Jugos especiales', desc:'Mezclas de la casa.', precio:1.75, img:null, tags:['fría'] },
  { id:'b3',  cat:'bebidas', nombre:'Batidos', desc:'Con leche y fruta natural.', precio:1.75, img:null, tags:['fría'] },
  { id:'b4',  cat:'bebidas', nombre:'Jarra de naranjada', desc:'Jarra para compartir.', precio:3.50, img:null, tags:['fría'] },
  { id:'b5',  cat:'bebidas', nombre:'Jarra de limonada', desc:'Jarra para compartir.', precio:3.50, img:null, tags:['fría'] },
  { id:'b6',  cat:'bebidas', nombre:'Agua', desc:'Botella personal.', precio:0.50, img:null, tags:['fría'] },
  { id:'b7',  cat:'bebidas', nombre:'Gaseosa', desc:'Personal.', precio:0.75, img:'beb-gaseosas', tags:['fría'] },
  { id:'b8',  cat:'bebidas', nombre:'Gaseosa 1.35 L', desc:'Para la mesa.', precio:2.00, img:null, tags:['fría'] },
  { id:'b9',  cat:'bebidas', nombre:'Fuze Tea', desc:'Té frío.', precio:null, img:null, tags:['fría'],
    variantes:[{etiqueta:'Pequeña',precio:1.00},{etiqueta:'Grande',precio:1.50}] },
  { id:'b10', cat:'bebidas', nombre:'Cerveza Club', desc:'Botella personal.', precio:3.00, img:null, tags:['fría'] },
  { id:'b11', cat:'bebidas', nombre:'Cerveza Pilsener litro', desc:'Litro.', precio:3.00, img:null, tags:['fría'] },
  { id:'b12', cat:'bebidas', nombre:'Café', desc:'Café pasado de la casa.', precio:0.75, img:'beb-cafe', tags:['caliente'] },
  { id:'b13', cat:'bebidas', nombre:'Aromática', desc:'Infusión de hierbas.', precio:0.75, img:'beb-aromatica', tags:['caliente'] },
  { id:'b14', cat:'bebidas', nombre:'Leche', desc:'Vaso de leche caliente.', precio:1.00, img:null, tags:['caliente'] },
  { id:'b15', cat:'bebidas', nombre:'Chocolate de Ambato', desc:'Chocolate espeso, receta tradicional.', precio:1.50, img:null, tags:['caliente'] },
  { id:'b16', cat:'bebidas', nombre:'Morocho', desc:'Morocho con leche, canela y pasas.', precio:null, img:'beb-morocho', tags:['caliente'], destacado:true,
    variantes:[{etiqueta:'Vaso',precio:1.50},{etiqueta:'Litro',precio:3.00}] }
];

/* Reseñas REALES publicadas en Google (recogidas el 22/08/2026).
   `texto` es literal, tal como lo escribió cada persona — no inventar ni
   reescribir frases y atribuírselas. `datos` son los campos que Google
   muestra aparte (precio, tiempo de espera…), no forman parte de la cita.
   La reseña de la revista está recortada: se le quitó la firma promocional
   del autor y la mención de precios de hace dos años, que ya cambiaron. */
window.LD_RESENAS = [
  { autor:'Haylen Cardona', estrellas:5, fuente:'Google',
    texto:'La humita y el tigrillo muy buenos. Toodoo muy ricoo y la atención 10/10.',
    datos:['Comida 5', 'Servicio 5', 'Ambiente 5'] },

  { autor:'Cristian Hernández', estrellas:5, fuente:'Google',
    texto:'Excelente lugar, mi nueva hueca, buena comida y buenos precios.',
    datos:['$5 – 10 por persona'] },

  { autor:'Revista Nuestro Hermoso Ecuador', estrellas:5, fuente:'Google · Local Guide',
    texto:'Es un comedor amplio y grande, con un servicio rápido. Ofrecen 2 opciones de sopa y de segundo a diario.',
    datos:['180 opiniones'] },

  { autor:'Victoria Quezada Cruz', estrellas:5, fuente:'Google',
    texto:'¡Muy bueno todo!',
    datos:['$1 – 5 por persona', 'Sin espera', 'Grupo de 5 a 8'] },

  { autor:'Cristian Gualan', estrellas:5, fuente:'Google',
    texto:'', /* calificó con 5 estrellas, sin dejar comentario escrito */
    datos:['Comida 5', 'Ambiente 5', 'Espera: hasta 10 min'] }
];
