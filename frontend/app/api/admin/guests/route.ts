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
        if (error) {
          console.warn('Supabase fetch error, fallback to sample guests:', error.message);
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
              phone_number: phone_number || '',
              max_seats: Number(max_seats) || 1,
              rsvp_status: 'pending',
              attending_count: 0,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ guest: data });
        }
        if (error) {
          console.warn('Supabase insert error:', error.message);
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const code = searchParams.get('code');

    if (!id && !code) {
      return NextResponse.json({ error: 'Guest id or code required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('guests').delete();
        if (id) {
          query = query.eq('id', id);
        } else if (code) {
          query = query.eq('invite_code', code);
        }
        const { error } = await query;
        if (error) {
          console.warn('Supabase delete error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase delete failed:', err);
      }
    }

    if (code && sampleGuests[code]) {
      delete sampleGuests[code];
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
