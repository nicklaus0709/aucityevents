import { formatDateTime } from '@/lib/utils';

export type FieldType = 'text' | 'textarea' | 'number' | 'datetime' | 'date' | 'checkbox' | 'image' | 'lines' | 'select' | 'url' | 'color' | 'tel';

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  max?: number;
  min?: number;
  integer?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  default?: string | number | boolean;
}

export interface TableConfig {
  fields: Field[];
  order: { column: string; ascending: boolean };
  title: (row: Record<string, any>) => string; // eslint-disable-line @typescript-eslint/no-explicit-any
  singular: string;
  /** La tabla tiene columna event_id (todas excepto events) */
  scoped: boolean;
}

/** Lista blanca de tablas editables desde el panel: las acciones del servidor NUNCA aceptan otras. */
export const TABLES: Record<string, TableConfig> = {
  Event: {
    scoped: false,
    singular: 'evento',
    order: { column: 'created_at', ascending: true },
    title: (r) => r.name,
    fields: [
      { name: 'name', label: 'Nombre del evento', type: 'text', required: true, max: 120 },
      { name: 'tagline', label: 'Frase corta', type: 'text', max: 200 },
      { name: 'description', label: 'Nosotros', type: 'textarea', max: 5000 },
      { name: 'history', label: 'Historia del evento', type: 'textarea', max: 10000 },
      { name: 'location', label: 'Lugar', type: 'text', max: 200 },
      { name: 'start_date', label: 'Fecha de inicio', type: 'date' },
      { name: 'end_date', label: 'Fecha de fin', type: 'date' },
      { name: 'hero_image', label: 'Imagen principal', type: 'image' },
      { name: 'logo_url', label: 'Logo del evento', type: 'image' },
      { name: 'theme_color', label: 'Color principal', type: 'color', default: '#b91c1c' },
      { name: 'accent_color', label: 'Color secundario', type: 'color', default: '#166534' },
      { name: 'phone', label: 'Teléfono de contacto', type: 'text', max: 40 },
      { name: 'email', label: 'Email de contacto', type: 'text', max: 150 },
      { name: 'youtube_url', label: 'YouTube (URL)', type: 'url' },
      { name: 'instagram_url', label: 'Instagram (URL)', type: 'url' },
      { name: 'facebook_url', label: 'Facebook (URL)', type: 'url' },
      { name: 'whatsapp', label: 'WhatsApp de la Municipalidad', type: 'tel', help: 'Con código de país, sin + ni espacios. Ej: 5493743123456' },
      { name: 'bonos_enabled', label: 'Habilitar venta de bonos de colaboración', type: 'checkbox' },
      { name: 'is_published', label: 'Sitio publicado (visible al público)', type: 'checkbox' },
    ],
  },
  GalleryImage: {
    scoped: true,
    singular: 'foto',
    order: { column: 'sort_order', ascending: true },
    title: (r) => r.caption || 'Foto',
    fields: [
      { name: 'image_url', label: 'Foto', type: 'image', required: true },
      { name: 'caption', label: 'Descripción', type: 'text', max: 200 },
      { name: 'sort_order', label: 'Orden', type: 'number', integer: true, default: 0 },
    ],
  },
  ScheduleItem: {
    scoped: true,
    singular: 'show',
    order: { column: 'starts_at', ascending: true },
    title: (r) => `${r.artist} · ${formatDateTime(r.starts_at)}`,
    fields: [
      { name: 'artist', label: 'Artista / Banda', type: 'text', required: true, max: 150 },
      { name: 'stage', label: 'Escenario', type: 'text', max: 100 },
      { name: 'starts_at', label: 'Inicio', type: 'datetime', required: true },
      { name: 'ends_at', label: 'Fin', type: 'datetime' },
      { name: 'description', label: 'Descripción', type: 'textarea', max: 1000 },
      { name: 'image_url', label: 'Foto', type: 'image' },
    ],
  },
  FoodStall: {
    scoped: true,
    singular: 'puesto',
    order: { column: 'number', ascending: true },
    title: (r) => `Puesto ${r.number} · ${r.name}`,
    fields: [
      { name: 'number', label: 'Número de puesto', type: 'number', integer: true, required: true, min: 1 },
      { name: 'name', label: 'Nombre del puesto', type: 'text', required: true, max: 120 },
      { name: 'owner', label: 'Responsable', type: 'text', max: 120 },
      { name: 'products', label: 'Productos (uno por línea)', type: 'lines', help: 'Ej: Choripán $3500' },
      { name: 'image_url', label: 'Foto', type: 'image' },
    ],
  },
  Ad: {
    scoped: true,
    singular: 'publicidad',
    order: { column: 'sort_order', ascending: true },
    title: (r) => `${r.business_name}${r.is_active ? '' : ' (inactiva)'}`,
    fields: [
      { name: 'business_name', label: 'Comercio', type: 'text', required: true, max: 120 },
      { name: 'image_url', label: 'Banner / imagen', type: 'image', required: true },
      { name: 'link_url', label: 'Link (web/Instagram del comercio)', type: 'url' },
      { name: 'description', label: 'Descripción corta', type: 'text', max: 300 },
      { name: 'starts_on', label: 'Visible desde', type: 'date' },
      { name: 'ends_on', label: 'Visible hasta', type: 'date' },
      { name: 'sort_order', label: 'Orden', type: 'number', integer: true, default: 0 },
      { name: 'is_active', label: 'Activa', type: 'checkbox', default: true },
    ],
  },
  BonoType: {
    scoped: true,
    singular: 'bono',
    order: { column: 'amount', ascending: true },
    title: (r) => `${r.name} · $${r.amount}${r.is_active ? '' : ' (inactivo)'}`,
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true, max: 100 },
      { name: 'description', label: 'Descripción', type: 'text', max: 300 },
      { name: 'amount', label: 'Precio (ARS)', type: 'number', required: true, min: 1 },
      { name: 'is_active', label: 'Disponible para la venta', type: 'checkbox', default: true },
    ],
  },
};
