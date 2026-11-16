import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sampleGuests } from '@/lib/dummy-data';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, status, attendingCount, dietaryNote, wishText } = body;

    if (!code || !status) {
      return NextResponse.json({ error: 'Invite code and status are required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('guests')
          .update({
            rsvp_status: status,
            attending_count: attendingCount,
            dietary_note: dietaryNote,
            wish_text: wishText,
            updated_at: new Date().toISOString(),
          })
          .eq('invite_code', code)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, guest: data });
        }
      } catch (err) {
        console.warn('Supabase RSVP failed, updating in-memory store', err);
      }
    }

    // Fallback in-memory update for testing/demo without Supabase setup yet
    if (sampleGuests[code]) {
      sampleGuests[code] = {
        ...sampleGuests[code],
        rsvp_status: status,
        attending_count: attendingCount,
        dietary_note: dietaryNote,
        wish_text: wishText,
      };
      return NextResponse.json({ success: true, guest: sampleGuests[code] });
    }

    return NextResponse.json({ success: true, guest: { invite_code: code, status, attendingCount } });
  } catch (err: any) {
    console.error('RSVP API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
