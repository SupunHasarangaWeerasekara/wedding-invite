import { NextRequest, NextResponse } from 'next/server';
import { getEventSettings } from '@/lib/event-store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  let currentEvent = getEventSettings();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: dbEvent } = await supabase
        .from('events')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (dbEvent) currentEvent = { ...currentEvent, ...dbEvent };
    } catch {}
  }

  const eventDate = new Date(currentEvent.date_iso);
  const startYear = eventDate.getUTCFullYear();
  const startMonth = String(eventDate.getUTCMonth() + 1).padStart(2, '0');
  const startDay = String(eventDate.getUTCDate()).padStart(2, '0');
  const startHours = String(eventDate.getUTCHours()).padStart(2, '0');
  const startMinutes = String(eventDate.getUTCMinutes()).padStart(2, '0');

  const endDate = new Date(eventDate.getTime() + 5 * 60 * 60 * 1000); // 5 hours
  const endYear = endDate.getUTCFullYear();
  const endMonth = String(endDate.getUTCMonth() + 1).padStart(2, '0');
  const endDay = String(endDate.getUTCDate()).padStart(2, '0');
  const endHours = String(endDate.getUTCHours()).padStart(2, '0');
  const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0');

  const dtStart = `${startYear}${startMonth}${startDay}T${startHours}${startMinutes}00Z`;
  const dtEnd = `${endYear}${endMonth}${endDay}T${endHours}${endMinutes}00Z`;
  const now = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '');

  const hasPoruwa = Boolean(
    currentEvent.poruwa_time &&
    currentEvent.poruwa_time.trim() !== '' &&
    currentEvent.poruwa_time !== '-'
  );

  const description = hasPoruwa
    ? `We are delighted to celebrate our wedding with you!\\nPoruwa Ceremony: ${currentEvent.poruwa_time}\\nReception: ${currentEvent.reception_time}`
    : `We are delighted to celebrate our wedding with you!\\nReception: ${currentEvent.reception_time}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Digital Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${code}-${currentEvent.id}@weddingapp.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Wedding of ${currentEvent.couple_names}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${currentEvent.venue_name}, ${currentEvent.venue_address || ''}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="wedding-${currentEvent.couple_names.replace(/\s+/g, '-')}.ics"`,
    },
  });
}
