import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sampleGuests } from '@/lib/dummy-data';
import { getEventSettings, getGallery } from '@/lib/event-store';
import { Guest, WeddingEvent } from '@/lib/types';
import InviteClientView from './InviteClientView';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ code: string }>;
}

async function getGuestData(code: string): Promise<{
  guest: Guest | null;
  event: WeddingEvent;
}> {
  const currentEvent = getEventSettings();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: guest, error } = await supabase
        .from('guests')
        .select('*')
        .eq('invite_code', code)
        .single();

      if (!error && guest) {
        return {
          guest,
          event: currentEvent,
        };
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using fallback data:', err);
    }
  }

  // Fallback to sample data
  const fallbackGuest = sampleGuests[code] || {
    id: `guest-${code}`,
    event_id: currentEvent.id,
    invite_code: code,
    name: 'Honored Guest & Family',
    max_seats: 2,
    rsvp_status: 'pending',
    attending_count: 0,
  };

  return {
    guest: fallbackGuest,
    event: currentEvent,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const { guest, event } = await getGuestData(code);

  const guestName = guest?.name || 'Honored Guest';
  const sinhalaName = event.couple_names_si ? ` (${event.couple_names_si})` : '';
  const title = `Wedding Invitation: ${event.couple_names}${sinhalaName}`;
  const description = `Dear ${guestName}, we cordially invite you to celebrate our wedding at ${event.venue_name}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${event.couple_names} Wedding Invitation for ${guestName}`,
      description,
      type: 'website',
      images: [
        {
          url: event.hero_image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
          width: 1200,
          height: 630,
          alt: `${event.couple_names} Wedding`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function InvitePage({ params }: PageProps) {
  const { code } = await params;
  const { guest, event } = await getGuestData(code);
  const gallery = getGallery();

  if (!guest) {
    notFound();
  }

  return (
    <InviteClientView
      initialGuest={guest}
      event={event}
      gallery={gallery}
    />
  );
}
