import { NextRequest, NextResponse } from 'next/server';
import { getEventSettings, updateEventSettings, getGallery, updateGallery } from '@/lib/event-store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const event = getEventSettings();
    const gallery = getGallery();
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
            date_iso: updatedEvent.date_iso,
            venue_name: updatedEvent.venue_name,
            venue_address: updatedEvent.venue_address,
            map_url: updatedEvent.map_url,
            poruwa_time: updatedEvent.poruwa_time,
            reception_time: updatedEvent.reception_time,
            theme_id: updatedEvent.theme_id,
            music_url: updatedEvent.music_url,
          });
        } catch (sErr) {
          console.warn('Supabase sync warning:', sErr);
        }
      }
    }

    let updatedGallery = getGallery();
    if (galleryUpdates && Array.isArray(galleryUpdates)) {
      updatedGallery = updateGallery(galleryUpdates);
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
