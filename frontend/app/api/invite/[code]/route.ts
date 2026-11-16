import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sampleGuests } from '@/lib/dummy-data';
import { getEventSettings, getGallery } from '@/lib/event-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const event = getEventSettings();
    const gallery = getGallery();

    let guest = null;
    let recentWishes: { name: string; wish: string; date: string }[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: gData } = await supabase
          .from('guests')
          .select('*')
          .eq('invite_code', code)
          .single();
        if (gData) guest = gData;

        // Fetch recent wishes
        const { data: wData } = await supabase
          .from('guests')
          .select('name, wish_text, updated_at')
          .not('wish_text', 'is', null)
          .neq('wish_text', '')
          .order('updated_at', { ascending: false })
          .limit(6);
        if (wData) {
          recentWishes = wData.map((w: any) => ({
            name: w.name,
            wish: w.wish_text,
            date: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : 'Recently',
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed in /api/invite/[code]:', err);
      }
    }

    if (!guest) {
      guest = sampleGuests[code] || {
        id: `guest-${code}`,
        event_id: event.id,
        invite_code: code,
        name: 'Honored Guest & Family',
        max_seats: 2,
        rsvp_status: 'pending',
        attending_count: 0,
      };
    }

    if (recentWishes.length === 0) {
      recentWishes = Object.values(sampleGuests)
        .filter((g) => g.wish_text && g.wish_text.trim().length > 0)
        .map((g) => ({
          name: g.name,
          wish: g.wish_text!,
          date: 'Recently',
        }));
    }

    return NextResponse.json({
      event,
      guest,
      gallery,
      recentWishes,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
