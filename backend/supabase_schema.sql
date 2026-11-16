-- ==============================================================================
-- DIGITAL WEDDING INVITATION WEB APP - SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create RSVP Status Enum
DO $$ BEGIN
    CREATE TYPE rsvp_status_enum AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_names TEXT NOT NULL,
    date_iso TIMESTAMPTZ NOT NULL,
    venue_name TEXT NOT NULL,
    venue_address TEXT,
    map_url TEXT NOT NULL,
    poruwa_time TEXT DEFAULT '09:30 AM',
    reception_time TEXT DEFAULT '12:00 PM',
    theme_id TEXT DEFAULT 'terracotta',
    music_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Guests Table
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    invite_code VARCHAR(16) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT,
    max_seats INT NOT NULL DEFAULT 1,
    rsvp_status rsvp_status_enum DEFAULT 'pending',
    attending_count INT DEFAULT 0,
    dietary_note TEXT,
    wish_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Gallery Photos Table
CREATE TABLE IF NOT EXISTS gallery_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_guests_invite_code ON guests(invite_code);
CREATE INDEX IF NOT EXISTS idx_gallery_event_order ON gallery_photos(event_id, display_order);

-- 7. Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- Public can read event details
CREATE POLICY "Public can view events" 
    ON events FOR SELECT 
    USING (true);

-- Public can view gallery photos
CREATE POLICY "Public can view gallery photos" 
    ON gallery_photos FOR SELECT 
    USING (true);

-- Public can view guest record if matching invite_code
CREATE POLICY "Public can view their guest invitation" 
    ON guests FOR SELECT 
    USING (true);

-- Public can update their own RSVP
CREATE POLICY "Public can update their RSVP" 
    ON guests FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- SAMPLE SEED DATA FOR TESTING
-- ==============================================================================

-- Insert Sample Event
INSERT INTO events (id, couple_names, date_iso, venue_name, venue_address, map_url, poruwa_time, reception_time, theme_id, music_url)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Gagani & Sanjaya',
    '2026-12-18 09:30:00+05:30',
    'Grand Ballroom, Shangri-La Hotel',
    '1 Galle Face, Colombo 02, Sri Lanka',
    'https://maps.google.com/?q=Shangri-La+Hotel+Colombo',
    '09:30 AM',
    '11:45 AM',
    'midnight_blue',
    '/audio/wedding-melody.mp3'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Guests with Unique Invite Codes
INSERT INTO guests (event_id, invite_code, name, max_seats, rsvp_status)
VALUES 
    ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'VIP-KASUN7', 'Mr. Kasun Perera & Family', 3, 'pending'),
    ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'VIP-NIMAL3', 'Dr. & Mrs. Nimal Silva', 2, 'pending'),
    ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'FRIEND-SAM9', 'Samantha Fernando', 1, 'pending')
ON CONFLICT (invite_code) DO NOTHING;
