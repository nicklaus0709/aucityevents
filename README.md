# Eventos Capioví

Sistema web (sitio público + panel administrador) para los eventos de la Municipalidad de Capioví, Misiones.
**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind · Supabase (Postgres + Auth + Storage) · Mercado Pago · Vercel.

Un mismo despliegue administra **varios eventos** (Navidad, Pascuas, Fiesta Rural…). Cada evento es un sitio en `/e/<slug>`.

## Funcionalidades

**Sitio público** (`/` lista de eventos, `/e/<slug>`):
landing con Nosotros, Historia y Galería · grilla de artistas por día · gastronomía (puestos numerados y productos) · comercios que publicitan (página completa + banner rotativo en todas las páginas) · formulario de contacto (artistas / puestos / comercios) · compra de bonos con Mercado Pago (con código QR de comprobante) · Instagram, Facebook y WhatsApp · chatbot · color de marca por evento · 100 % responsivo.

**Panel admin** (`/admin`): login → selector de evento → Contenido, Galería, Grilla, Gastronomía, Publicidad, Mensajes, Bonos (ventas, canje por código, export CSV), QR imprimibles (grilla, gastronomía, sitio, bonos). Gestión de usuarios y permisos por evento (solo super admin).

## Puesta en marcha

1. **Supabase**: crear proyecto → SQL Editor → ejecutar [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql).
2. Crear tu usuario en *Authentication → Users* e ingresar este SQL para volverte super admin:
   `update public.profiles set role = 'super_admin' where email = 'tu@correo.com';`
3. `cp .env.example .env.local` y completar las variables (Supabase, `NEXT_PUBLIC_SITE_URL`, Mercado Pago).
4. `npm install && npm run dev` → http://localhost:3000/admin
5. **Mercado Pago**: crear aplicación → copiar el Access Token a `MP_ACCESS_TOKEN`; en *Webhooks* configurar `https://TU-DOMINIO/api/bonos/webhook` (evento *Pagos*) y copiar la clave secreta a `MP_WEBHOOK_SECRET`.
6. **Vercel**: importar el repo de GitHub y cargar las mismas variables de entorno. En Supabase *Auth → URL Configuration* poner el dominio de Vercel.

## Seguridad aplicada

- **RLS en todas las tablas**: el público solo lee contenido de eventos publicados; mensajes de contacto y compras solo los ve el equipo del evento. Las escrituras públicas pasan por el servidor con validación (zod), honeypot anti-bots y *rate limit* persistente en base de datos.
- Roles: `super_admin` y miembros por evento (`admin`/`editor`). Los usuarios no pueden cambiar su propio rol; los editores solo pueden modificar campos operativos de una compra (nunca monto, estado ni código).
- `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor (`server-only`), nunca llega al navegador.
- **Pagos**: el precio sale siempre de la base; el webhook verifica la firma HMAC de Mercado Pago, consulta el pago a su API (no confía en el body), valida monto y moneda, y es idempotente. El canje de bonos es atómico (sin doble canje).
- Login con mensajes genéricos + límite de intentos; contraseñas de mínimo 12 caracteres; sesión validada con `getUser()` en middleware.
- Subida de imágenes: lista blanca de tipos, 5 MB, verificación de firma del archivo, carpeta por evento protegida por policies de Storage.
- Cabeceras: CSP, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. `/admin` con `noindex` y sin caché. Export CSV protegido contra inyección de fórmulas. Todo texto del público se renderiza escapado.

## Chatbot

Sin configuración responde con reglas simples sobre grilla/gastronomía/bonos. Si definís `ANTHROPIC_API_KEY`, usa un modelo de Claude restringido a los datos del evento.

## Pendiente / ideas

- Activar MFA (TOTP) para usuarios del panel (Supabase Auth lo soporta).
- Captcha (Cloudflare Turnstile) en el formulario de contacto si aparece spam.
- Envío de email con el comprobante del bono (Resend) y rol "cajero" que solo canjea bonos.
- `npm audit` reporta un aviso de PostCSS dentro de Next 15 (solo en tiempo de build); se resuelve actualizando a Next 16.

## Probar el panel admin y publicar (sin Mercado Pago)

1. **Supabase** (gratis): crear proyecto → SQL Editor → ejecutar `supabase/migrations/0001_init.sql` y después `supabase/seed.sql` (carga los 3 eventos de ejemplo con sus fotos).
2. **Usuario admin**: Authentication → Users → *Add user* (email + contraseña, "Auto Confirm User") y en el SQL Editor:
   `update public.profiles set role = 'super_admin' where email = 'tu@correo.com';`
3. **Local**: crear `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `NEXT_PUBLIC_SITE_URL=http://localhost:3000` → `npm run dev` → http://localhost:3000/admin.
4. **Vercel**: importar el repo y cargar esas mismas 4 variables (con `NEXT_PUBLIC_SITE_URL` = la URL de Vercel). Sin `MP_ACCESS_TOKEN` la compra de bonos queda como "Muy pronto".
5. Supabase → Authentication → URL Configuration: Site URL = la URL de Vercel.

Para cambiar los comercios de ejemplo por reales: Panel → evento → Publicidad → subir la foto de cada comercio (JPG/PNG/WebP, máx. 5 MB) y borrar los banners de ejemplo.
