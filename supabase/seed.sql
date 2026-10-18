-- Datos de prueba (ejecutar DESPUÉS de 0001_init.sql). Se puede borrar luego desde el panel.
-- Las imágenes (publicidad/galería) se cargan desde el panel admin.

with ev as (
  insert into public.events (slug, name, tagline, description, history, location, start_date, end_date, theme_color, whatsapp, bonos_enabled, is_published)
  values ('navidad-capiovi', 'Navidad en Capioví', 'Música, comida y tradición en la plaza central',
    'Cada diciembre la comunidad de Capioví se reúne para celebrar la Navidad con shows en vivo, ferias y gastronomía local.',
    'Nació hace más de 20 años como una pequeña peña de vecinos y hoy convoca a miles de visitantes.',
    'Plaza Central, Capioví', '2026-12-20', '2026-12-21', '#b91c1c', '5493743000000', true, true)
  returning id
), sch as (
  insert into public.schedule_items (event_id, artist, stage, starts_at, ends_at, description)
  select id, a, s, st::timestamptz, en::timestamptz, d from ev, (values
    ('Banda Municipal', 'Escenario principal', '2026-12-20T19:30:00-03:00', '2026-12-20T20:30:00-03:00', 'Villancicos y temas clásicos'),
    ('Los Hijos de la Tierra', 'Escenario principal', '2026-12-20T21:00:00-03:00', '2026-12-20T22:30:00-03:00', 'Chamamé y folklore'),
    ('DJ Selva', 'Escenario joven', '2026-12-21T22:00:00-03:00', null, null)
  ) v(a, s, st, en, d)
), st as (
  insert into public.food_stalls (event_id, number, name, owner, products)
  select id, n, nm, ow, p from ev, (values
    (1, 'La Parrilla de Don Carlos', 'Carlos Benítez', array['Choripán $3500','Asado con cuero $9000','Bebidas $1500']),
    (2, 'Dulces del Monte', 'Flia. Kraus', array['Strudel $3000','Tortas $2800','Café $1200']),
    (3, 'Mbeyú y Más', null, array['Mbeyú $2000','Chipa guazú $2500','Mate cocido $1000'])
  ) v(n, nm, ow, p)
)
insert into public.bono_types (event_id, name, description, amount)
select id, nm, d, amt from ev, (values
  ('Bono Colaboración', 'Aporte solidario al evento', 5000),
  ('Bono Familiar', 'Para toda la familia', 15000)
) v(nm, d, amt);
