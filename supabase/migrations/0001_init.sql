-- =====================================================================
-- Eventos Capioví - esquema inicial
-- Seguridad: RLS activado en TODAS las tablas. El público solo lee
-- contenido publicado; las escrituras públicas (contacto, compras) se
-- hacen únicamente desde el servidor con service_role.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Perfiles y roles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('super_admin','user')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin');
$$;

-- ---------- Eventos (cada evento = un sitio) ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  name text not null check (length(name) between 2 and 120),
  tagline text check (length(tagline) <= 200),
  description text check (length(description) <= 5000),   -- "Nosotros"
  history text check (length(history) <= 10000),          -- "Historia del evento"
  location text check (length(location) <= 200),
  start_date date,
  end_date date,
  hero_image text,
  theme_color text not null default '#c2410c' check (theme_color ~ '^#[0-9a-fA-F]{6}$'),
  instagram_url text,
  facebook_url text,
  whatsapp text check (whatsapp ~ '^[0-9]{8,15}$'),
  bonos_enabled boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.event_members (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin','editor')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create or replace function public.can_edit_event(eid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_super_admin()
      or exists (select 1 from public.event_members where event_id = eid and user_id = auth.uid());
$$;

-- ---------- Contenido ----------
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_url text not null,
  caption text check (length(caption) <= 200),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  artist text not null check (length(artist) between 1 and 150),
  stage text check (length(stage) <= 100),
  starts_at timestamptz not null,
  ends_at timestamptz,
  description text check (length(description) <= 1000),
  image_url text,
  created_at timestamptz not null default now()
);

create table public.food_stalls (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  number int not null check (number > 0),
  name text not null check (length(name) between 1 and 120),
  owner text check (length(owner) <= 120),
  products text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now(),
  unique (event_id, number)
);

create table public.ads (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  business_name text not null check (length(business_name) between 1 and 120),
  image_url text not null,
  link_url text,
  description text check (length(description) <= 300),
  is_active boolean not null default true,
  starts_on date,
  ends_on date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Contacto ----------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  type text not null check (type in ('artista','gastronomico','comercio','consulta','otro')),
  message text not null,
  status text not null default 'nuevo' check (status in ('nuevo','en_proceso','resuelto')),
  created_at timestamptz not null default now()
);

-- ---------- Bonos de colaboración ----------
create table public.bono_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null check (length(name) between 1 and 100),
  description text check (length(description) <= 300),
  amount numeric(12,2) not null check (amount > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.bono_purchases (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  bono_type_id uuid not null references public.bono_types(id),
  code text not null unique,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  quantity int not null check (quantity between 1 and 20),
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled','refunded')),
  mp_preference_id text,
  mp_payment_id text unique,
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users(id),
  notes text check (length(notes) <= 500),
  created_at timestamptz not null default now()
);
create index on public.bono_purchases (event_id, status);

-- ---------- Rate limit (anti abuso, usado desde el servidor) ----------
create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits int not null default 0
);

create or replace function public.check_rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare r public.rate_limits;
begin
  insert into public.rate_limits as t (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when t.window_start < now() - make_interval(secs => p_window_seconds) then now() else t.window_start end,
    hits = case when t.window_start < now() - make_interval(secs => p_window_seconds) then 1 else t.hits + 1 end
  returning * into r;
  return r.hits <= p_max;
end $$;

revoke all on function public.check_rate_limit(text,int,int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text,int,int) to service_role;

-- ---------- Row Level Security ----------
alter table public.profiles          enable row level security;
alter table public.events            enable row level security;
alter table public.event_members     enable row level security;
alter table public.gallery_images    enable row level security;
alter table public.schedule_items    enable row level security;
alter table public.food_stalls       enable row level security;
alter table public.ads               enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.bono_types        enable row level security;
alter table public.bono_purchases    enable row level security;
alter table public.rate_limits       enable row level security;  -- sin policies: solo service_role

-- profiles: cada uno ve el suyo; super_admin ve todos. Nadie modifica el rol desde el cliente.
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_super_admin());

-- events
create policy events_select on public.events for select
  using (is_published or public.can_edit_event(id));
create policy events_insert on public.events for insert with check (public.is_super_admin());
create policy events_update on public.events for update
  using (public.can_edit_event(id)) with check (public.can_edit_event(id));
create policy events_delete on public.events for delete using (public.is_super_admin());

-- event_members
create policy members_select on public.event_members for select
  using (user_id = auth.uid() or public.is_super_admin());
create policy members_write on public.event_members for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- Contenido público (lectura si el evento está publicado) + escritura por editores
do $$
declare t text;
begin
  foreach t in array array['gallery_images','schedule_items','food_stalls'] loop
    execute format($f$create policy %1$s_public_read on public.%1$s for select
      using (exists (select 1 from public.events e where e.id = event_id and e.is_published))$f$, t);
    execute format($f$create policy %1$s_editor_all on public.%1$s for all
      using (public.can_edit_event(event_id)) with check (public.can_edit_event(event_id))$f$, t);
  end loop;
end $$;

create policy ads_public_read on public.ads for select using (
  is_active
  and (starts_on is null or starts_on <= current_date)
  and (ends_on is null or ends_on >= current_date)
  and exists (select 1 from public.events e where e.id = event_id and e.is_published)
);
create policy ads_editor_all on public.ads for all
  using (public.can_edit_event(event_id)) with check (public.can_edit_event(event_id));

create policy bono_types_public_read on public.bono_types for select using (
  is_active and exists (select 1 from public.events e where e.id = event_id and e.is_published and e.bonos_enabled)
);
create policy bono_types_editor_all on public.bono_types for all
  using (public.can_edit_event(event_id)) with check (public.can_edit_event(event_id));

-- Datos sensibles: solo editores del evento. Los INSERT los hace el servidor (service_role).
create policy contact_editor_select on public.contact_messages for select using (public.can_edit_event(event_id));
create policy contact_editor_update on public.contact_messages for update
  using (public.can_edit_event(event_id)) with check (public.can_edit_event(event_id));
create policy contact_editor_delete on public.contact_messages for delete using (public.can_edit_event(event_id));

create policy purchases_editor_select on public.bono_purchases for select using (public.can_edit_event(event_id));
create policy purchases_editor_update on public.bono_purchases for update
  using (public.can_edit_event(event_id)) with check (public.can_edit_event(event_id));

-- Los editores solo pueden cambiar campos operativos de una compra (nunca monto/estado/código).
revoke update on public.bono_purchases from authenticated, anon;
grant update (redeemed_at, redeemed_by, notes) on public.bono_purchases to authenticated;
revoke update on public.contact_messages from authenticated, anon;
grant update (status) on public.contact_messages to authenticated;

-- ---------- Storage (imágenes) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-media', 'event-media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "event-media editores insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'event-media' and public.can_edit_event(((storage.foldername(name))[1])::uuid));
create policy "event-media editores update" on storage.objects for update to authenticated
  using (bucket_id = 'event-media' and public.can_edit_event(((storage.foldername(name))[1])::uuid));
create policy "event-media editores delete" on storage.objects for delete to authenticated
  using (bucket_id = 'event-media' and public.can_edit_event(((storage.foldername(name))[1])::uuid));
-- Lectura pública: el bucket es público (URLs directas), no se necesita policy de select.

-- Para convertir a tu usuario en super administrador (ejecutar UNA vez en el SQL editor):
--   update public.profiles set role = 'super_admin' where email = 'tu@correo.com';
