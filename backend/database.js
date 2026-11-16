const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATA_DIR = path.join(__dirname, 'data');
const EVENT_FILE = path.join(DATA_DIR, 'event-settings.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery-settings.json');
const GUESTS_FILE = path.join(DATA_DIR, 'guests.json');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseKey.includes('your-anon')
);

const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// Helpers for local JSON file DB
function readJson(filePath, defaultVal = []) {
  try {
    if (!fs.existsSync(filePath)) return defaultVal;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Read error on ${filePath}:`, err);
    return defaultVal;
  }
}

function writeJson(filePath, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Write error on ${filePath}:`, err);
    return false;
  }
}

// 1. Get Event Settings
async function getEvent() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('events').select('*').limit(1).single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase getEvent error, falling back to local DB:', e.message);
    }
  }
  return readJson(EVENT_FILE, {});
}

// 2. Save Event Settings
async function saveEvent(eventData) {
  writeJson(EVENT_FILE, eventData);
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('events').upsert(eventData);
    } catch (e) {
      console.warn('Supabase saveEvent error:', e.message);
    }
  }
  return eventData;
}

// 3. Get Guests
async function getGuests() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('guests').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getGuests error, falling back to local DB:', e.message);
    }
  }
  return readJson(GUESTS_FILE, []);
}

// 4. Get Single Guest by Code
async function getGuestByCode(code) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('guests').select('*').ilike('invite_code', cleanCode).single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase getGuestByCode error, falling back to local DB:', e.message);
    }
  }
  const guests = readJson(GUESTS_FILE, []);
  return guests.find((g) => (g.invite_code || '').toUpperCase() === cleanCode) || null;
}

// 5. Update RSVP
async function updateRsvp(code, { status, attendingCount, dietaryNote, wishText }) {
  const cleanCode = (code || '').trim().toUpperCase();
  const guests = readJson(GUESTS_FILE, []);
  const index = guests.findIndex((g) => (g.invite_code || '').toUpperCase() === cleanCode);

  let updatedGuest = null;
  if (index !== -1) {
    const g = guests[index];
    const maxSeats = g.max_seats || 1;
    const count = status === 'accepted' ? Math.min(Math.max(1, Number(attendingCount) || 1), maxSeats) : 0;

    guests[index] = {
      ...g,
      rsvp_status: status,
      attending_count: count,
      dietary_note: dietaryNote ? dietaryNote.trim() : '',
      wish_text: wishText ? wishText.trim() : g.wish_text,
      rsvp_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    writeJson(GUESTS_FILE, guests);
    updatedGuest = guests[index];
  }

  if (isSupabaseConfigured && supabase && updatedGuest) {
    try {
      await supabase.from('guests').update({
        rsvp_status: updatedGuest.rsvp_status,
        attending_count: updatedGuest.attending_count,
        dietary_note: updatedGuest.dietary_note,
        wish_text: updatedGuest.wish_text,
        updated_at: new Date().toISOString(),
      }).ilike('invite_code', cleanCode);
    } catch (e) {
      console.warn('Supabase updateRsvp error:', e.message);
    }
  }

  return updatedGuest;
}

// 6. Add Guest
async function addGuest({ name, phone, max_seats, notes }) {
  const cleanName = (name || '').trim();
  const slug = cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'GUEST';
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const invite_code = `VIP-${slug}${randomSuffix}`;

  const newGuest = {
    id: `guest-${Date.now()}`,
    name: cleanName,
    phone: phone ? phone.trim() : '',
    phone_number: phone ? phone.trim() : '',
    invite_code,
    max_seats: Number(max_seats) || 2,
    rsvp_status: 'pending',
    attending_count: 0,
    dietary_note: '',
    wish_text: '',
    notes: notes || '',
    created_at: new Date().toISOString(),
  };

  const guests = readJson(GUESTS_FILE, []);
  guests.push(newGuest);
  writeJson(GUESTS_FILE, guests);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('guests').insert([newGuest]);
    } catch (e) {
      console.warn('Supabase addGuest error:', e.message);
    }
  }

  return newGuest;
}

// 7. Gallery
async function getGallery() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('gallery_photos').select('*').order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getGallery error, falling back to local DB:', e.message);
    }
  }
  return readJson(GALLERY_FILE, []);
}

async function saveGallery(photos) {
  writeJson(GALLERY_FILE, photos);
  if (isSupabaseConfigured && supabase && Array.isArray(photos)) {
    try {
      await supabase.from('gallery_photos').upsert(photos);
    } catch (e) {
      console.warn('Supabase saveGallery error:', e.message);
    }
  }
  return photos;
}

module.exports = {
  isSupabaseConfigured,
  supabase,
  getEvent,
  saveEvent,
  getGuests,
  getGuestByCode,
  updateRsvp,
  addGuest,
  getGallery,
  saveGallery,
};
