const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Health & Database connection check
app.get('/api/health', async (req, res) => {
  const guests = await db.getGuests();
  res.json({
    status: 'ok',
    service: 'Wedding Invite API',
    database: {
      type: db.isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local Database Store',
      connected: true,
      guest_count: guests.length,
    },
    time: new Date().toISOString(),
  });
});

app.get('/api/database/status', async (req, res) => {
  const guests = await db.getGuests();
  const event = await db.getEvent();
  const gallery = await db.getGallery();
  res.json({
    connected: true,
    engine: db.isSupabaseConfigured ? 'Supabase (Cloud PostgreSQL)' : 'Local Database (File-backed Engine)',
    isSupabaseConfigured: db.isSupabaseConfigured,
    stats: {
      guests: guests.length,
      hasEventSettings: Boolean(event && event.couple_names),
      galleryPhotos: gallery.length,
    },
  });
});

// 2. GET /api/invite/:code - Guest invitation details
app.get('/api/invite/:code', async (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const guest = await db.getGuestByCode(code);

  if (!guest) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  const event = await db.getEvent();
  const gallery = await db.getGallery();
  const allGuests = await db.getGuests();

  // Extract recent wishes from guests who left wishes
  const recentWishes = allGuests
    .filter((g) => g.wish_text && g.wish_text.trim().length > 0)
    .slice(-10)
    .reverse()
    .map((g) => ({
      name: g.name,
      wish: g.wish_text,
      date: g.rsvp_date || 'Recently',
    }));

  return res.json({
    guest,
    event,
    gallery,
    recentWishes,
  });
});

// 3. POST /api/rsvp - Guest RSVP submission
app.post('/api/rsvp', async (req, res) => {
  const { code, status, attendingCount, dietaryNote, wishText } = req.body;

  if (!code || !['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Valid invite code and status (accepted/declined) are required' });
  }

  const updatedGuest = await db.updateRsvp(code, {
    status,
    attendingCount,
    dietaryNote,
    wishText,
  });

  if (!updatedGuest) {
    return res.status(404).json({ error: 'Guest not found' });
  }

  return res.json({
    success: true,
    guest: updatedGuest,
    message: status === 'accepted' ? 'RSVP accepted successfully!' : 'RSVP updated. Thank you for letting us know!',
  });
});

// 4. GET & POST /api/admin/guests - Admin guest list management
app.get('/api/admin/guests', async (req, res) => {
  const guests = await db.getGuests();
  return res.json(guests);
});

app.post('/api/admin/guests', async (req, res) => {
  const { name, phone, max_seats, notes } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Guest name is required' });
  }

  const newGuest = await db.addGuest({ name, phone, max_seats, notes });
  return res.status(201).json(newGuest);
});

// 5. GET & POST /api/admin/event - Admin wedding customization settings & gallery
app.get('/api/admin/event', async (req, res) => {
  const event = await db.getEvent();
  const gallery = await db.getGallery();
  return res.json({ event, gallery });
});

app.post('/api/admin/event', async (req, res) => {
  const { event, gallery } = req.body;

  if (event) {
    await db.saveEvent(event);
  }

  if (gallery && Array.isArray(gallery)) {
    await db.saveGallery(gallery);
  }

  return res.json({
    success: true,
    message: 'Wedding settings and gallery updated successfully!',
    event: await db.getEvent(),
    gallery: await db.getGallery(),
  });
});

// 6. GET /api/calendar/:code - Downloadable .ics calendar file
app.get('/api/calendar/:code', async (req, res) => {
  const event = await db.getEvent();
  const weddingDate = new Date(event.date_iso || '2026-12-18T10:00:00Z');
  const endDate = new Date(weddingDate.getTime() + 6 * 60 * 60 * 1000);

  const formatIcsDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sanjaya & Gagani Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${Date.now()}@sanjayagagani.com`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(weddingDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:Wedding of ${event.couple_names || 'Sanjaya & Gagani'}`,
    `DESCRIPTION:You are warmly invited to celebrate the wedding of ${event.couple_names || 'Sanjaya & Gagani'}. Poruwa: ${event.poruwa_time || '09:30 AM'} | Reception: ${event.reception_time || '12:30 PM'}`,
    `LOCATION:${event.venue_name || 'Shangri-La Hotel Colombo'}, ${event.venue_address || 'Colombo, Sri Lanka'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="wedding-save-the-date.ics"');
  return res.send(icsContent);
});

// Start listening
app.listen(PORT, () => {
  console.log(`Backend API Server running at http://localhost:${PORT}`);
});
