export type RsvpStatus = 'pending' | 'accepted' | 'declined';

export interface WeddingEvent {
  id: string;
  couple_names: string;
  couple_names_si?: string;
  date_iso: string;
  venue_name: string;
  venue_address: string;
  map_url: string;
  poruwa_time: string;
  reception_time: string;
  theme_id: 'terracotta' | 'navy' | 'burgundy' | 'midnight_blue' | 'crimson_black';
  music_url: string;

  // Customizable font & typography
  font_family?: string;
  font_size_scale?: 'normal' | 'large' | 'extra-large';

  // Customizable images
  hero_image_url?: string;
  groom_image_url?: string;
  bride_image_url?: string;
  couple_avatar_url?: string;

  // Parents
  beloved_son_of?: string;
  beloved_daughter_of?: string;

  // Customizable section titles & texts
  title_countdown?: string;
  title_calendar?: string;
  title_schedule?: string;
  title_venue?: string;
  title_note?: string;
  text_note?: string;
}

export interface Guest {
  id: string;
  event_id: string;
  invite_code: string;
  name: string;
  phone_number?: string;
  max_seats: number;
  rsvp_status: RsvpStatus;
  attending_count: number;
  dietary_note?: string;
  wish_text?: string;
  updated_at?: string;
}

export interface GalleryPhoto {
  id: string;
  event_id: string;
  image_url: string;
  caption: string;
  display_order: number;
}

export interface InvitationData {
  event: WeddingEvent;
  guest: Guest;
  gallery: GalleryPhoto[];
  recentWishes: { name: string; wish: string; date: string }[];
}
