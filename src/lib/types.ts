export interface EventRow {
  id: string; slug: string; name: string; tagline: string | null; description: string | null; history: string | null;
  location: string | null; start_date: string | null; end_date: string | null; hero_image: string | null;
  theme_color: string; accent_color: string; logo_url: string | null; phone: string | null; email: string | null; youtube_url: string | null; instagram_url: string | null; facebook_url: string | null; whatsapp: string | null;
  bonos_enabled: boolean; is_published: boolean;
}
export interface ScheduleItem { id: string; artist: string; stage: string | null; starts_at: string; ends_at: string | null; description: string | null; image_url: string | null }
export interface FoodStall { id: string; number: number; name: string; owner: string | null; products: string[]; image_url: string | null }
export interface Ad { id: string; business_name: string; image_url: string; link_url: string | null; description: string | null }
export interface GalleryImage { id: string; image_url: string; caption: string | null }
export interface BonoType { id: string; name: string; description: string | null; amount: number }
