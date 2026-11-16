import { NextRequest, NextResponse } from 'next/server';
import { defaultEvent } from '@/lib/dummy-data';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const eventDate = new Date(defaultEvent.date_iso);
  const startYear = eventDate.getUTCFullYear();
  const startMonth = String(eventDate.getUTCMonth() + 1).padStart(2, '0');
  const startDay = String(eventDate.getUTCDate()).padStart(2, '0');
  const startHours = String(eventDate.getUTCHours()).padStart(2, '0');
  const startMinutes = String(eventDate.getUTCMinutes()).padStart(2, '0');

  const endDate = new Date(eventDate.getTime() + 6 * 60 * 60 * 1000); // 6 hours
  const endYear = endDate.getUTCFullYear();
  const endMonth = String(endDate.getUTCMonth() + 1).padStart(2, '0');
  const endDay = String(endDate.getUTCDate()).padStart(2, '0');
  const endHours = String(endDate.getUTCHours()).padStart(2, '0');
  const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0');

  const dtStart = `${startYear}${startMonth}${startDay}T${startHours}${startMinutes}00Z`;
  const dtEnd = `${endYear}${endMonth}${endDay}T${endHours}${endMinutes}00Z`;
  const now = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Digital Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${code}-${defaultEvent.id}@weddingapp.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Wedding of ${defaultEvent.couple_names}`,
    `DESCRIPTION:We are delighted to celebrate our wedding with you!\\nPoruwa Ceremony: ${defaultEvent.poruwa_time}\\nReception: ${defaultEvent.reception_time}`,
    `LOCATION:${defaultEvent.venue_name}, ${defaultEvent.venue_address}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="wedding-${defaultEvent.couple_names.replace(/\s+/g, '-')}.ics"`,
    },
  });
}
