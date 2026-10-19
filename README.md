# Eventos Capioví (sobre Base44)

Sitio público + panel de administración para los eventos de la Municipalidad de Capioví, Misiones.
**Stack:** Vite + React + TypeScript + Tailwind · **Base44** como backend (entidades, usuarios, archivos) y hosting.

> La versión anterior (Next.js + Supabase + Vercel) quedó guardada en el tag `v0-supabase`.

Un mismo sitio administra **varios eventos** (Navidad, Pascuas, Fiesta Rural…). Cada evento vive en `/e/<slug>`.

## Funcionalidades
**Público:** landing, Nosotros, Historia (línea de tiempo), galería con visor, programación por día, gastronomía (puestos numerados + productos), comercios que publicitan (página + banners rotativos), contacto, chatbot, redes y WhatsApp, color por evento.
**Admin (`/admin`):** login → selector de evento → contenido, galería, grilla, gastronomía, publicidad, mensajes, bonos (tipos, canje por código, CSV) y QR imprimibles.
**Pendiente:** compra de bonos con Mercado Pago (se mostrará "Compra online: muy pronto").

## Modo demo (sin Base44)
Si `VITE_BASE44_APP_ID` está vacío, el sitio muestra 3 eventos de ejemplo y el panel muestra un aviso. `npm install && npm run dev` → http://localhost:3000

## Conectar con Base44

Requisitos: cuenta de Base44 (el *GitHub sync* de dos vías y las funciones de backend requieren un plan pago, ver abajo).

1. `npx base44 login`
2. Crear y enlazar la app (el proyecto ya tiene `base44/config.jsonc`):
   `npx base44 link --create --name aucityevents`
3. Subir las entidades y sus reglas de seguridad:
   `npx base44 entities push -y`
4. Copiar el **App ID** (texto entre `/apps/` y `/editor/` en la URL del editor) a `.env.local`:
   `VITE_BASE44_APP_ID=xxxxxxxx` y correr `npm run dev`.
5. Entrar a `/admin` con tu usuario de Base44 (debe tener rol `admin`). Con la base vacía aparece el botón **Cargar datos de ejemplo**.
6. Publicar: `npx base44 deploy --build -y` (o `npx base44 build && npx base44 site deploy -y`).

### Usuarios y roles
Se gestionan en Base44 (Dashboard → Users): invitar por email y asignar rol **admin** para que puedan usar el panel. Los usuarios con rol `user` no pueden modificar nada.

### Seguridad (reglas de las entidades, `base44/entities/*.jsonc`)
- Contenido público de solo lectura; **toda escritura requiere rol admin**.
- `Event`: el público solo ve los eventos con `is_published = true`.
- `ContactMessage`: cualquiera puede **crear** (formulario de contacto); solo admin lee, edita o borra.
- `BonoPurchase`: solo admin (las compras se crearán desde una función de backend con Mercado Pago).
- Formularios: validación, campo trampa anti-bots, texto siempre escapado (React), imágenes validadas por tipo, tamaño y firma del archivo.

### GitHub
El repo es `nicklaus0709/aucityevents` (rama `main`). Para enlazarlo a Base44: la app debe haberse creado con la CLI (paso 2), instalar la **Base44 GitHub App** en el repo con permiso de escritura y conectarlo desde *Overview*. Requiere plan Builder o superior; la conexión no se puede deshacer.

## Cosas a verificar la primera vez (no pude probarlas sin tu cuenta de Base44)
1. `entities push` acepta los archivos `base44/entities/*.jsonc` y el SDK expone `base44.entities.Event`, `GalleryImage`, etc. Si algún nombre difiere, se corrige en un solo lugar (`src/lib/api.ts`).
2. Un visitante **sin sesión** puede leer los eventos publicados y **crear** un mensaje de contacto.
3. El login con email/contraseña está habilitado para tu app (si usás Google, habilitá el login con contraseña en la configuración de autenticación).
4. El sitio publicado abre bien un enlace directo como `/e/navidad-capiovi/eventos` (necesario antes de imprimir los QR). Si da 404, avisame y pasamos a rutas con `#`.
5. La subida de imágenes del panel devuelve una URL pública.

## Mejoras pendientes
- Pago de bonos con Mercado Pago (función de backend + webhook firmado).
- Permisos por evento (que un usuario edite solo Navidad).
- Límite de envíos del formulario de contacto (hoy solo trampa anti-bots).
