import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sampleGuests, defaultEvent } from '@/lib/dummy-data';
import { Guest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: guests, error } = await supabase
          .from('guests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && guests) {
          return NextResponse.json({ guests });
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local memory store', err);
      }
    }

    // Fallback list
    const guestList = Object.values(sampleGuests);
    return NextResponse.json({ guests: guestList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, max_seats, phone_number } = body;

    if (!name) {
      return NextResponse.json({ error: 'Guest name is required' }, { status: 400 });
    }

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const invite_code = `GUEST-${randomSuffix}`;

    const newGuest: Guest = {
      id: `g-${Date.now()}`,
      event_id: defaultEvent.id,
      invite_code,
      name,
      phone_number: phone_number || '',
      max_seats: Number(max_seats) || 1,
      rsvp_status: 'pending',
      attending_count: 0,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('guests')
          .insert([
            {
              event_id: defaultEvent.id,
              invite_code,
              name,
              phone_number,
              max_seats: Number(max_seats) || 1,
              rsvp_status: 'pending',
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ guest: data });
        }
      } catch (err) {
        console.warn('Supabase insert failed, using memory store', err);
      }
    }

    sampleGuests[invite_code] = newGuest;
    return NextResponse.json({ guest: newGuest });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
