import type { Ad, BonoType, EventRow, FoodStall, GalleryImage, ScheduleItem } from '@/lib/types';

/** Modo demo: se activa solo cuando NO hay Supabase configurado. Datos de prueba, solo lectura. */
export const DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL;

function svg(label: string, bg: string) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="${bg}"/><text x="400" y="265" font-family="sans-serif" font-size="46" font-weight="700" fill="#fff" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;
}

const events: EventRow[] = [
  {
    id: 'demo-navidad', slug: 'navidad-capiovi', name: 'Navidad en Capioví', tagline: 'Música, comida y tradición en la plaza central',
    description: 'Cada diciembre la comunidad de Capioví se reúne para celebrar la Navidad con shows en vivo, ferias y gastronomía local.\n\nEs una fiesta organizada por la Municipalidad junto a instituciones y vecinos.',
    history: 'Nació hace más de 20 años como una pequeña peña de vecinos y hoy convoca a miles de visitantes de toda la provincia.',
    location: 'Plaza Central, Capioví', start_date: '2026-12-20', end_date: '2026-12-21', hero_image: svg('Navidad en Capioví', '#9a3412'),
    theme_color: '#b91c1c', instagram_url: 'https://instagram.com', facebook_url: 'https://facebook.com', whatsapp: '5493743000000',
    bonos_enabled: true, is_published: true,
  },
  {
    id: 'demo-rural', slug: 'fiesta-rural', name: 'Fiesta Rural', tagline: 'El campo misionero en una sola fiesta',
    description: 'Exposición de productores, destreza criolla y shows folklóricos.', history: null, location: 'Predio Rural, Capioví',
    start_date: '2027-03-12', end_date: '2027-03-14', hero_image: svg('Fiesta Rural', '#166534'), theme_color: '#166534',
    instagram_url: null, facebook_url: null, whatsapp: '5493743000000', bonos_enabled: false, is_published: true,
  },
];

const schedule: ScheduleItem[] = [
  { id: 's1', artist: 'Los Hijos de la Tierra', stage: 'Escenario principal', starts_at: '2026-12-20T21:00:00-03:00', ends_at: '2026-12-20T22:30:00-03:00', description: 'Chamamé y folklore', image_url: null },
  { id: 's2', artist: 'Banda Municipal', stage: 'Escenario principal', starts_at: '2026-12-20T19:30:00-03:00', ends_at: '2026-12-20T20:30:00-03:00', description: 'Villancicos y temas clásicos', image_url: null },
  { id: 's3', artist: 'DJ Selva', stage: 'Escenario joven', starts_at: '2026-12-21T22:00:00-03:00', ends_at: null, description: null, image_url: null },
];

const stalls: FoodStall[] = [
  { id: 'f1', number: 1, name: 'La Parrilla de Don Carlos', owner: 'Carlos Benítez', products: ['Choripán $3500', 'Asado con cuero $9000', 'Bebidas $1500'], image_url: null },
  { id: 'f2', number: 2, name: 'Dulces del Monte', owner: 'Flia. Kraus', products: ['Strudel $3000', 'Tortas $2800', 'Café $1200'], image_url: null },
  { id: 'f3', number: 3, name: 'Mbeyú y Más', owner: null, products: ['Mbeyú $2000', 'Chipa guazú $2500', 'Mate cocido $1000'], image_url: null },
];

const ads: Ad[] = [
  { id: 'a1', business_name: 'Ferretería El Tornillo', image_url: svg('Ferretería El Tornillo', '#1d4ed8'), link_url: null, description: 'Todo para tu hogar' },
  { id: 'a2', business_name: 'Panadería La Espiga', image_url: svg('Panadería La Espiga', '#a16207'), link_url: null, description: 'Pan casero todos los días' },
];

const gallery: GalleryImage[] = [
  { id: 'g1', image_url: svg('Edición 2024', '#7c3aed'), caption: 'Edición 2024' },
  { id: 'g2', image_url: svg('Plaza iluminada', '#0e7490'), caption: 'La plaza iluminada' },
  { id: 'g3', image_url: svg('Desfile', '#be185d'), caption: 'Desfile de carrozas' },
  { id: 'g4', image_url: svg('Feria', '#15803d'), caption: 'Feria de artesanos' },
];

const bonos: BonoType[] = [
  { id: 'b1', name: 'Bono Colaboración', description: 'Aporte solidario al evento', amount: 5000 },
  { id: 'b2', name: 'Bono Familiar', description: 'Para toda la familia', amount: 15000 },
];

export const demo = {
  events,
  content: { gallery, schedule, stalls, ads, bonos },
};
