import type { Ad, BonoType, EventRow, FoodStall, GalleryImage, ScheduleItem } from '@/lib/types';

/** Modo demo: se activa solo cuando NO hay Supabase configurado. Datos de prueba, solo lectura. */
export const DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL;

const N = '/demo/navidad';
const A = '/demo/ads';

const HISTORY_NAVIDAD = `Navidad en Capioví se viene realizando de forma ininterrumpida desde hace más de 11 años, con el esfuerzo de personas que donan voluntariamente su tiempo y conocimientos. Todo nació de reutilizar botellas descartables para transformarlas en adornos navideños.

2009 – Los inicios

Nació como un proyecto de un grupo de Catequesis Familiar de la Parroquia San Luis Gonzaga, para decorar la Iglesia y sus alrededores. Tomaron como ejemplo actividades similares de Brasil, donde con botellas descartables se elaboran objetos navideños. Fue una manera de mostrar a los niños otra forma de contribuir al desarrollo de su comunidad y de cuidar el medio ambiente. Unas 50 personas voluntarias reutilizaron cerca de 3.000 botellas plásticas, con financiación de los propios vecinos.

2010 – Toda la avenida

Ante la excelente repercusión se sumaron más vecinos. Los adornos abarcaron toda la Avenida San Luis Gonzaga y se agregó un árbol navideño de unos 10 metros en la Plaza Los Pioneros. Se reutilizaron unas 9.000 botellas con unos 80 voluntarios.

2012 – El taller y los arbolitos auspiciados

El grupo empezó a trabajar en un lugar propio para confeccionar los adornos, cedido por el Instituto Nuestra Señora de Itatí. Comercios y familias auspiciaron 28 arbolitos de 3 metros sobre el boulevard. Se reutilizaron unas 14.000 botellas y el grupo llegó a 120 voluntarios.

2013 – El trineo con renos

Se decoraron las farolas de la RN 12 y los edificios públicos. El proyecto más importante fue un trineo con 5 renos a escala real, posible gracias al aporte de tres empresas y de la Municipalidad.

2014 – El tren navideño

Se armaron regalos a la vera de la RN 12, un tren con decoración alegórica, rosetones y esferas grandes. Se utilizaron unas 15.000 botellas.

2015 – El pesebre

Más de 60 auspiciantes ampliaron la iluminación. Se armó el pesebre con la Sagrada Familia y una oveja con más de 16.000 argollas abrochadas.

2016 – El gran árbol

Se construyó un nuevo árbol para la plaza, de unos 14 metros y 10.000 botellas en su follaje. Se realizó un Papá Noel de 4 metros. La decoración del boulevard se extendió a 5 cuadras.

2017 – La casita de Papá Noel

Se armaron 31 casitas de madera decoradas con 30.000 tapitas de gaseosa, con la colaboración de la Escuela N° 14.

2018 – Veladas navideñas

Se sumaron 32 cupcakes iluminados, coronas y una corona de adviento. Desde este año las Veladas Navideñas se realizan sábados y domingos junto a la feria de artesanos y el patio de gastronomía.`;

const HISTORY_PASCUAS = `Dada la gran aceptación de Navidad, en 2016 se decidió decorar el pueblo con motivos de Pascuas, reutilizando la decoración ya armada.

2016 – El primer conejo

Se armó un conejo de 4 metros de altura, huevos y canastos. Se incorporó por primera vez la Feria de Artesanos.

2017 – La Casa de los Conejos

Se confeccionó la coneja, se sumaron huevos de chocolate y más canastos, y se decoró la avenida San Luis Gonzaga con motivos pascuales.

2019 – Huevos gigantes

Se armaron 7 huevos de 2 metros de alto y coronas con huevos chicos para las farolas. Sumó actividades del grupo "Los amigos de las plantas", conejitos reales y el Vía Crucis organizado por la catequesis.`;

const events: EventRow[] = [
  {
    id: 'demo-navidad', slug: 'navidad-capiovi', name: 'Navidad en Capioví', tagline: 'El pueblo de Papá Noel: toda la magia de la Navidad hecha con botellas recicladas',
    description: 'Navidad en Capioví es una propuesta comunitaria que comienza el primer domingo de Adviento y se extiende hasta fines de enero. Voluntarios de toda la localidad reciclan miles de botellas y materiales para convertirlos en árboles, ángeles, trineos y un pesebre que iluminan la avenida y la plaza.\n\nLos sábados y domingos hay veladas navideñas con espectáculos, feria de artesanos y patio gastronómico.',
    history: HISTORY_NAVIDAD, location: 'Plaza Los Pioneros y Av. San Luis Gonzaga, Capioví', start_date: '2026-11-29', end_date: '2027-01-31',
    hero_image: `${N}/hero.webp`, logo_url: `${N}/logo.webp`, theme_color: '#b91c1c', accent_color: '#166534',
    phone: '03743 493003', email: null, youtube_url: 'https://www.youtube.com/watch?v=4SuSRIReQLU', instagram_url: 'https://instagram.com', facebook_url: 'https://facebook.com',
    whatsapp: '5493743493003', bonos_enabled: true, is_published: true,
  },
  {
    id: 'demo-pascuas', slug: 'pascuas-capiovi', name: 'Pascuas en Capioví', tagline: 'La Casa de los Conejos, huevos gigantes y feria de artesanos',
    description: 'Con la misma decoración reciclada de Navidad, el pueblo se viste de Pascuas: conejos de 4 metros, huevos gigantes, canastos y la Casa de los Conejos. Hay feria de artesanos, actividades para los chicos y el Vía Crucis.',
    history: HISTORY_PASCUAS, location: 'Plaza Los Pioneros, Capioví', start_date: '2027-03-26', end_date: '2027-03-28', hero_image: '/demo/rural/pascuas.svg', logo_url: null,
    theme_color: '#7c3aed', accent_color: '#db2777', phone: '03743 493003', email: null, youtube_url: null, instagram_url: null, facebook_url: null,
    whatsapp: '5493743493003', bonos_enabled: false, is_published: true,
  },
  {
    id: 'demo-rural', slug: 'fiesta-rural', name: 'Fiesta Rural', tagline: 'El campo misionero en una sola fiesta',
    description: 'Exposición de productores, destreza criolla, gastronomía regional y shows folklóricos. Un fin de semana para celebrar el trabajo de la tierra y las tradiciones de la comunidad.',
    history: null, location: 'Predio Rural, Capioví', start_date: '2027-04-23', end_date: '2027-04-25', hero_image: '/demo/rural/hero.svg', logo_url: null,
    theme_color: '#b45309', accent_color: '#166534', phone: '03743 493003', email: null, youtube_url: null, instagram_url: null, facebook_url: null,
    whatsapp: '5493743493003', bonos_enabled: false, is_published: true,
  },
];

const sch = (id: string, artist: string, stage: string, start: string, end: string | null, description: string | null, image_url: string | null): ScheduleItem =>
  ({ id, artist, stage, starts_at: `${start}:00-03:00`, ends_at: end ? `${end}:00-03:00` : null, description, image_url });

const navidadSchedule: ScheduleItem[] = [
  sch('n1', 'Encendido del árbol y apertura', 'Plaza Los Pioneros', '2026-11-29T20:30', '2026-11-29T21:30', 'Primer domingo de Adviento: se enciende el gran árbol y comienza la Navidad en Capioví.', `${N}/calle-noche.webp`),
  sch('n2', 'Banda del Pueblo · Melodías navideñas', 'Escenario principal', '2026-11-29T21:30', '2026-11-29T22:30', null, null),
  sch('n3', 'Ballet Navideño', 'Escenario principal', '2026-12-05T21:00', '2026-12-05T22:00', 'Presentación de las academias de danza de la localidad.', `${N}/ballet.webp`),
  sch('n4', 'Coro de la Parroquia San Luis Gonzaga', 'Escenario principal', '2026-12-06T20:00', '2026-12-06T21:00', null, null),
  sch('n5', 'Pesebre viviente', 'Parroquia San Luis Gonzaga', '2026-12-12T21:00', '2026-12-12T22:00', 'Representación con niños y jóvenes de la comunidad.', `${N}/velas-ninos.webp`),
  sch('n6', 'Llegada de Papá Noel', 'Casita de Papá Noel', '2026-12-13T19:30', '2026-12-13T21:00', 'Fotos con Papá Noel y entrega de golosinas para los chicos.', `${N}/voluntarios.webp`),
  sch('n7', 'Show musical de cierre de año (a confirmar)', 'Escenario principal', '2026-12-19T22:00', null, null, null),
];
const pascuasSchedule: ScheduleItem[] = [
  sch('p1', 'Vía Crucis', 'Parroquia San Luis Gonzaga', '2027-03-26T20:00', '2027-03-26T21:30', 'Organizado por el grupo de catequesis.', null),
  sch('p2', 'Feria de Artesanos', 'Plaza Los Pioneros', '2027-03-27T16:00', '2027-03-27T22:00', null, null),
  sch('p3', 'Reparto de dulces en la Casa de los Conejos', 'Casa de los Conejos', '2027-03-28T17:00', '2027-03-28T19:00', 'Para los más chicos, con conejitos reales.', null),
];
const ruralSchedule: ScheduleItem[] = [
  sch('r1', 'Apertura y desfile de tropillas', 'Predio Rural', '2027-04-23T18:00', '2027-04-23T19:30', null, null),
  sch('r2', 'Los Hijos de la Tierra', 'Escenario principal', '2027-04-23T21:30', '2027-04-23T23:00', 'Chamamé y folklore misionero.', null),
  sch('r3', 'Jineteada y destreza criolla', 'Playón', '2027-04-24T15:00', '2027-04-24T19:00', null, null),
  sch('r4', 'Noche de peña', 'Escenario principal', '2027-04-24T22:00', null, null, null),
];

const stall = (id: string, number: number, name: string, owner: string | null, products: string[]): FoodStall => ({ id, number, name, owner, products, image_url: null });
const navidadStalls = [
  stall('nf1', 1, 'La Parrilla de Don Carlos', 'Carlos Benítez', ['Choripán $3500', 'Hamburguesa completa $5000', 'Bebidas $1500']),
  stall('nf2', 2, 'Dulces del Monte', 'Flia. Kraus', ['Strudel $3000', 'Tortas $2800', 'Chocolate caliente $1800']),
  stall('nf3', 3, 'Mbeyú y Más', null, ['Mbeyú $2000', 'Chipa guazú $2500', 'Mate cocido $1000']),
  stall('nf4', 4, 'Pizzería La Plaza', 'Marcela Duarte', ['Pizza por porción $2500', 'Empanadas $1200', 'Gaseosa $1500']),
  stall('nf5', 5, 'Pan Dulce Casero', 'Grupo Adultos Mayores', ['Pan dulce $4500', 'Budín navideño $3000', 'Café $1200']),
];
const ruralStalls = [
  stall('rf1', 1, 'Asado al Asador', 'Club Rural', ['Costillar con ensalada $9000', 'Chorizo $3000']),
  stall('rf2', 2, 'Cocina Criolla', 'Mujeres Rurales', ['Locro $4500', 'Empanadas $1200', 'Sopa paraguaya $2000']),
];
const pascuasStalls = [
  stall('pf1', 1, 'Huevos de Pascua', 'Chocolatería Artesanal', ['Huevo chico $3500', 'Huevo grande $9000']),
  stall('pf2', 2, 'Rosca de Pascua', 'Panadería del Pueblo', ['Rosca $4000', 'Café $1200']),
];

const ad = (id: string, business_name: string, file: string, description: string): Ad => ({ id, business_name, image_url: `${A}/${file}.svg`, link_url: null, description });
const ads = {
  navidad: [
    ad('a1', 'Ferretería El Tornillo', 'ferreteria', 'Todo para tu hogar y tu obra'), ad('a2', 'Panadería La Espiga', 'panaderia', 'Pan casero y facturas todos los días'),
    ad('a3', 'Farmacia San Luis', 'farmacia', 'Atención de lunes a domingo'), ad('a4', 'Yerbatera Los Pioneros', 'yerbatera', 'Yerba mate misionera de calidad'),
    ad('a5', 'Heladería Dulce Selva', 'heladeria', 'Helados artesanales'), ad('a6', 'Corralón Misionero', 'corralon', 'Materiales de construcción'),
  ],
  rural: [ad('a7', 'Corralón Misionero', 'corralon', 'Materiales de construcción'), ad('a8', 'Veterinaria Del Campo', 'veterinaria', 'Cuidamos a tus animales'), ad('a9', 'Yerbatera Los Pioneros', 'yerbatera', 'Yerba mate misionera de calidad')],
};

const g = (id: string, file: string, caption: string): GalleryImage => ({ id, image_url: `${N}/${file}.webp`, caption });
const navidadGallery = [
  g('g1', 'angeles', 'Ángeles de botellas recicladas'), g('g2', 'calle-noche', 'La avenida iluminada'), g('g3', 'arbol-casitas', 'Árbol de las casitas'),
  g('g4', 'papa-noel', 'Papá Noel gigante'), g('g5', 'tren', 'El tren navideño'), g('g6', 'pesebre', 'El pesebre'),
  g('g7', 'regalos', 'Regalos y árbol de cupcakes'), g('g8', 'multitud', 'La plaza llena de gente'), g('g9', 'velas-ninos', 'Pesebre viviente'),
  g('g10', 'ballet', 'Ballet navideño'), g('g11', 'voluntarios', 'Papá Noel y voluntarios'),
];

const bonos: BonoType[] = [
  { id: 'b1', name: 'Bono Colaboración', description: 'Aporte solidario para sostener el evento', amount: 5000 },
  { id: 'b2', name: 'Bono Familiar', description: 'Para toda la familia', amount: 15000 },
];

const empty = { gallery: [], schedule: [], stalls: [], ads: [], bonos: [] as BonoType[] };

export const demo = {
  events,
  content: {
    'demo-navidad': { gallery: navidadGallery, schedule: navidadSchedule, stalls: navidadStalls, ads: ads.navidad, bonos },
    'demo-pascuas': { ...empty, schedule: pascuasSchedule, stalls: pascuasStalls, ads: ads.rural.slice(0, 2) },
    'demo-rural': { ...empty, schedule: ruralSchedule, stalls: ruralStalls, ads: ads.rural },
  } as Record<string, { gallery: GalleryImage[]; schedule: ScheduleItem[]; stalls: FoodStall[]; ads: Ad[]; bonos: BonoType[] }>,
};
