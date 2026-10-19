// Seed de la base de Base44 (Postgres). Corre al inicio del servicio web.
//  1) Crea el super admin inicial (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD).
//  2) Carga eventos de ejemplo con los assets estáticos de /public/demo
//     (solo si la base está vacía, para que el preview no quede en blanco).
import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt as _scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt);
const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

const N = '/demo/navidad';
const A = '/demo/ads';

async function main() {
  // 1) Super admin inicial
  if ((await prisma.users.count()) === 0) {
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!password) {
      console.warn('[seed] SEED_ADMIN_PASSWORD no definida: no se creó el super admin. Configurala y reiniciá el servicio web.');
    } else {
      const email = (process.env.SEED_ADMIN_EMAIL || 'admin@capiovi.local').toLowerCase();
      await prisma.users.create({
        data: { email, password_hash: await hashPassword(password), full_name: 'Administrador', role: 'super_admin' },
      });
      console.log(`[seed] Super admin creado: ${email}`);
    }
  }

  // 2) Eventos de ejemplo
  if ((await prisma.events.count()) === 0) {
    const navidad = await prisma.events.create({
      data: {
        slug: 'navidad-capiovi', name: 'Navidad en Capioví',
        tagline: 'El pueblo de Papá Noel: toda la magia de la Navidad hecha con botellas recicladas',
        description: 'Navidad en Capioví es una propuesta comunitaria que comienza el primer domingo de Adviento y se extiende hasta fines de enero. Voluntarios de toda la localidad reciclan miles de botellas y materiales para convertirlos en árboles, ángeles, trineos y un pesebre que iluminan la avenida y la plaza.\n\nLos sábados y domingos hay veladas navideñas con espectáculos, feria de artesanos y patio gastronómico.',
        location: 'Plaza Los Pioneros y Av. San Luis Gonzaga, Capioví',
        start_date: '2026-11-29', end_date: '2027-01-31',
        hero_image: `${N}/hero.webp`, logo_url: `${N}/logo.webp`,
        theme_color: '#b91c1c', accent_color: '#166534',
        phone: '03743 493003', youtube_url: 'https://www.youtube.com/watch?v=4SuSRIReQLU',
        instagram_url: 'https://instagram.com', facebook_url: 'https://facebook.com',
        whatsapp: '5493743493003', bonos_enabled: true, is_published: true,
      },
    });
    await prisma.schedule_items.createMany({
      data: [
        ['Encendido del árbol y apertura', 'Plaza Los Pioneros', '2026-11-29T20:30:00-03:00', '2026-11-29T21:30:00-03:00', 'Primer domingo de Adviento: se enciende el gran árbol y comienza la Navidad en Capioví.', `${N}/calle-noche.webp`],
        ['Banda del Pueblo · Melodías navideñas', 'Escenario principal', '2026-11-29T21:30:00-03:00', '2026-11-29T22:30:00-03:00', null, null],
        ['Ballet Navideño', 'Escenario principal', '2026-12-05T21:00:00-03:00', '2026-12-05T22:00:00-03:00', 'Presentación de las academias de danza de la localidad.', `${N}/ballet.webp`],
        ['Coro de la Parroquia San Luis Gonzaga', 'Escenario principal', '2026-12-06T20:00:00-03:00', '2026-12-06T21:00:00-03:00', null, null],
        ['Pesebre viviente', 'Parroquia San Luis Gonzaga', '2026-12-12T21:00:00-03:00', '2026-12-12T22:00:00-03:00', 'Representación con niños y jóvenes de la comunidad.', `${N}/velas-ninos.webp`],
        ['Llegada de Papá Noel', 'Casita de Papá Noel', '2026-12-13T19:30:00-03:00', '2026-12-13T21:00:00-03:00', 'Fotos con Papá Noel y entrega de golosinas para los chicos.', `${N}/voluntarios.webp`],
        ['Show musical de cierre de año (a confirmar)', 'Escenario principal', '2026-12-19T22:00:00-03:00', null, null, null],
      ].map(([artist, stage, starts_at, ends_at, description, image_url], i) => ({
        event_id: navidad.id, artist, stage, starts_at, ends_at, description, image_url, sort_order: i,
      })).map(({ sort_order, ...s }) => s),
    });
    await prisma.food_stalls.createMany({
      data: [
        [1, 'La Parrilla de Don Carlos', 'Carlos Benítez', ['Choripán $3500', 'Hamburguesa completa $5000', 'Bebidas $1500']],
        [2, 'Dulces del Monte', 'Flia. Kraus', ['Strudel $3000', 'Tortas $2800', 'Chocolate caliente $1800']],
        [3, 'Mbeyú y Más', null, ['Mbeyú $2000', 'Chipa guazú $2500', 'Mate cocido $1000']],
        [4, 'Pizzería La Plaza', 'Marcela Duarte', ['Pizza por porción $2500', 'Empanadas $1200', 'Gaseosa $1500']],
        [5, 'Pan Dulce Casero', 'Grupo Adultos Mayores', ['Pan dulce $4500', 'Budín navideño $3000', 'Café $1200']],
      ].map(([number, name, owner, products]) => ({ event_id: navidad.id, number, name, owner, products })),
    });
    await prisma.gallery_images.createMany({
      data: [
        ['angeles', 'Ángeles de botellas recicladas'], ['calle-noche', 'La avenida iluminada'], ['arbol-casitas', 'Árbol de las casitas'],
        ['papa-noel', 'Papá Noel gigante'], ['tren', 'El tren navideño'], ['pesebre', 'El pesebre'],
        ['regalos', 'Regalos y árbol de cupcakes'], ['multitud', 'La plaza llena de gente'], ['velas-ninos', 'Pesebre viviente'],
        ['ballet', 'Ballet navideño'], ['voluntarios', 'Papá Noel y voluntarios'],
      ].map(([file, caption], i) => ({ event_id: navidad.id, image_url: `${N}/${file}.webp`, caption, sort_order: i })),
    });
    await prisma.ads.createMany({
      data: [
        ['Ferretería El Tornillo', 'ferreteria', 'Todo para tu hogar y tu obra'], ['Panadería La Espiga', 'panaderia', 'Pan casero y facturas todos los días'],
        ['Farmacia San Luis', 'farmacia', 'Atención de lunes a domingo'], ['Yerbatera Los Pioneros', 'yerbatera', 'Yerba mate misionera de calidad'],
        ['Heladería Dulce Selva', 'heladeria', 'Helados artesanales'], ['Corralón Misionero', 'corralon', 'Materiales de construcción'],
      ].map(([business_name, file, description], i) => ({ event_id: navidad.id, business_name, image_url: `${A}/${file}.svg`, description, sort_order: i })),
    });
    await prisma.bono_types.createMany({
      data: [
        { event_id: navidad.id, name: 'Bono Colaboración', description: 'Aporte solidario para sostener el evento', amount: 5000 },
        { event_id: navidad.id, name: 'Bono Familiar', description: 'Para toda la familia', amount: 15000 },
      ],
    });

    const pascuas = await prisma.events.create({
      data: {
        slug: 'pascuas-capiovi', name: 'Pascuas en Capioví',
        tagline: 'La Casa de los Conejos, huevos gigantes y feria de artesanos',
        description: 'Con la misma decoración reciclada de Navidad, el pueblo se viste de Pascuas: conejos de 4 metros, huevos gigantes, canastos y la Casa de los Conejos. Hay feria de artesanos, actividades para los chicos y el Vía Crucis.',
        location: 'Plaza Los Pioneros, Capioví',
        start_date: '2027-03-26', end_date: '2027-03-28', hero_image: '/demo/rural/pascuas.svg',
        theme_color: '#7c3aed', accent_color: '#db2777', phone: '03743 493003',
        whatsapp: '5493743493003', is_published: true,
      },
    });
    await prisma.schedule_items.createMany({
      data: [
        ['Vía Crucis', 'Parroquia San Luis Gonzaga', '2027-03-26T20:00:00-03:00', '2027-03-26T21:30:00-03:00', 'Organizado por el grupo de catequesis.'],
        ['Feria de Artesanos', 'Plaza Los Pioneros', '2027-03-27T16:00:00-03:00', '2027-03-27T22:00:00-03:00', null],
        ['Reparto de dulces en la Casa de los Conejos', 'Casa de los Conejos', '2027-03-28T17:00:00-03:00', '2027-03-28T19:00:00-03:00', 'Para los más chicos, con conejitos reales.'],
      ].map(([artist, stage, starts_at, ends_at, description]) => ({ event_id: pascuas.id, artist, stage, starts_at, ends_at, description })),
    });
    await prisma.food_stalls.createMany({
      data: [
        [1, 'Huevos de Pascua', 'Chocolatería Artesanal', ['Huevo chico $3500', 'Huevo grande $9000']],
        [2, 'Rosca de Pascua', 'Panadería del Pueblo', ['Rosca $4000', 'Café $1200']],
      ].map(([number, name, owner, products]) => ({ event_id: pascuas.id, number, name, owner, products })),
    });

    const rural = await prisma.events.create({
      data: {
        slug: 'fiesta-rural', name: 'Fiesta Rural',
        tagline: 'El campo misionero en una sola fiesta',
        description: 'Exposición de productores, destreza criolla, gastronomía regional y shows folklóricos. Un fin de semana para celebrar el trabajo de la tierra y las tradiciones de la comunidad.',
        location: 'Predio Rural, Capioví',
        start_date: '2027-04-23', end_date: '2027-04-25', hero_image: '/demo/rural/hero.svg',
        theme_color: '#b45309', accent_color: '#166534', phone: '03743 493003',
        whatsapp: '5493743493003', is_published: true,
      },
    });
    await prisma.schedule_items.createMany({
      data: [
        ['Apertura y desfile de tropillas', 'Predio Rural', '2027-04-23T18:00:00-03:00', '2027-04-23T19:30:00-03:00', null],
        ['Los Hijos de la Tierra', 'Escenario principal', '2027-04-23T21:30:00-03:00', '2027-04-23T23:00:00-03:00', 'Chamamé y folklore misionero.'],
        ['Jineteada y destreza criolla', 'Playón', '2027-04-24T15:00:00-03:00', '2027-04-24T19:00:00-03:00', null],
        ['Noche de peña', 'Escenario principal', '2027-04-24T22:00:00-03:00', null, null],
      ].map(([artist, stage, starts_at, ends_at, description]) => ({ event_id: rural.id, artist, stage, starts_at, ends_at, description })),
    });
    await prisma.food_stalls.createMany({
      data: [
        [1, 'Asado al Asador', 'Club Rural', ['Costillar con ensalada $9000', 'Chorizo $3000']],
        [2, 'Cocina Criolla', 'Mujeres Rurales', ['Locro $4500', 'Empanadas $1200', 'Sopa paraguaya $2000']],
      ].map(([number, name, owner, products]) => ({ event_id: rural.id, number, name, owner, products })),
    });
    await prisma.ads.createMany({
      data: [
        ['Corralón Misionero', 'corralon', 'Materiales de construcción'], ['Veterinaria Del Campo', 'veterinaria', 'Cuidamos a tus animales'], ['Yerbatera Los Pioneros', 'yerbatera', 'Yerba mate misionera de calidad'],
      ].map(([business_name, file, description], i) => ({ event_id: rural.id, business_name, image_url: `${A}/${file}.svg`, description, sort_order: i })),
    });

    console.log('[seed] Eventos de ejemplo creados (Navidad, Pascuas, Fiesta Rural)');
  }
}

main()
  .catch((e) => { console.error('[seed] Error:', e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
