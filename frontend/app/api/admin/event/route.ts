import { NextRequest, NextResponse } from 'next/server';
import { getEventSettings, updateEventSettings, getGallery, updateGallery } from '@/lib/event-store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let event = getEventSettings();
    let gallery = getGallery();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbEvent } = await supabase
          .from('events')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (dbEvent) {
          event = { ...event, ...dbEvent };
        }

        const { data: dbGallery } = await supabase
          .from('gallery_photos')
          .select('*')
          .order('display_order', { ascending: true });

        if (dbGallery && dbGallery.length > 0) {
          gallery = dbGallery;
        }
      } catch (err) {
        console.warn('Supabase fetch failed in /api/admin/event GET:', err);
      }
    }

    return NextResponse.json({ event, gallery });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch event settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event: eventUpdates, gallery: galleryUpdates } = body;

    let updatedEvent = getEventSettings();
    if (eventUpdates) {
      updatedEvent = updateEventSettings(eventUpdates);

      // Also sync to Supabase if available
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('events').upsert({
            id: updatedEvent.id,
            couple_names: updatedEvent.couple_names,
            couple_names_si: updatedEvent.couple_names_si || null,
            date_iso: updatedEvent.date_iso,
            venue_name: updatedEvent.venue_name,
            venue_address: updatedEvent.venue_address,
            map_url: updatedEvent.map_url,
            poruwa_time: updatedEvent.poruwa_time,
            reception_time: updatedEvent.reception_time,
            theme_id: updatedEvent.theme_id,
            music_url: updatedEvent.music_url,
            font_family: updatedEvent.font_family || 'Playfair Display',
            font_size_scale: updatedEvent.font_size_scale || 'normal',
            hero_image_url: updatedEvent.hero_image_url || null,
            groom_image_url: updatedEvent.groom_image_url || null,
            bride_image_url: updatedEvent.bride_image_url || null,
            couple_avatar_url: updatedEvent.couple_avatar_url || null,
            beloved_son_of: updatedEvent.beloved_son_of || null,
            beloved_daughter_of: updatedEvent.beloved_daughter_of || null,
            title_countdown: updatedEvent.title_countdown || null,
            title_calendar: updatedEvent.title_calendar || null,
            title_schedule: updatedEvent.title_schedule || null,
            title_venue: updatedEvent.title_venue || null,
            title_note: updatedEvent.title_note || null,
            text_note: updatedEvent.text_note || null,
          });
        } catch (sErr) {
          console.warn('Supabase sync warning:', sErr);
        }
      }
    }

    let updatedGallery = getGallery();
    if (galleryUpdates && Array.isArray(galleryUpdates)) {
      updatedGallery = updateGallery(galleryUpdates);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('gallery_photos').delete().eq('event_id', updatedEvent.id);
          if (updatedGallery.length > 0) {
            const photosToInsert = updatedGallery.map((p, idx) => ({
              event_id: updatedEvent.id,
              image_url: p.image_url,
              caption: p.caption || '',
              display_order: idx,
            }));
            await supabase.from('gallery_photos').insert(photosToInsert);
          }
        } catch (gErr) {
          console.warn('Supabase gallery sync warning:', gErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      gallery: updatedGallery,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update event settings' }, { status: 500 });
  }
}
