import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sampleGuests, defaultEvent } from '@/lib/dummy-data';
import { Guest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const order = searchParams.get('order') || 'asc';
    const isAscending = order === 'asc';

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: guests, error } = await supabase
          .from('guests')
          .select('*')
          .order('created_at', { ascending: isAscending });

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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      invite_code,
      name,
      max_seats,
      phone_number,
      rsvp_status,
      attending_count,
      wish_text,
      dietary_note,
    } = body;

    if (!id && !invite_code) {
      return NextResponse.json({ error: 'Guest id or invite_code required' }, { status: 400 });
    }

    const updates: Partial<Guest> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (max_seats !== undefined) updates.max_seats = Number(max_seats);
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (rsvp_status !== undefined) updates.rsvp_status = rsvp_status;
    if (attending_count !== undefined) updates.attending_count = Number(attending_count);
    if (wish_text !== undefined) updates.wish_text = wish_text;
    if (dietary_note !== undefined) updates.dietary_note = dietary_note;

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('guests').update(updates);
        if (id) {
          query = query.eq('id', id);
        } else if (invite_code) {
          query = query.eq('invite_code', invite_code);
        }

        const { data, error } = await query.select().single();
        if (!error && data) {
          return NextResponse.json({ success: true, guest: data });
        }
        if (error) {
          console.warn('Supabase update error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase update failed:', err);
      }
    }

    // Fallback in-memory update
    const code = invite_code || Object.keys(sampleGuests).find((k) => sampleGuests[k].id === id);
    if (code && sampleGuests[code]) {
      sampleGuests[code] = {
        ...sampleGuests[code],
        ...updates,
      };
      return NextResponse.json({ success: true, guest: sampleGuests[code] });
    }

    return NextResponse.json({ success: true, guest: { id, invite_code, ...updates } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  return PUT(req);
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
