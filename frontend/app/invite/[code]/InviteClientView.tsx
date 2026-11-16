'use client';

import React, { useState, useEffect } from 'react';
import { Guest, WeddingEvent, GalleryPhoto } from '@/lib/types';
import EnvelopeCover from '@/components/invite/EnvelopeCover';
import LeafParticles from '@/components/invite/LeafParticles';
import MusicPlayer from '@/components/invite/MusicPlayer';
import CountdownTimer from '@/components/invite/CountdownTimer';
import FixedCalendar from '@/components/invite/FixedCalendar';
import ScheduleTimeline from '@/components/invite/ScheduleTimeline';
import VenueMap from '@/components/invite/VenueMap';
import LightboxGallery from '@/components/invite/LightboxGallery';
import RsvpForm from '@/components/invite/RsvpForm';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InviteClientViewProps {
  initialGuest: Guest;
  event: WeddingEvent;
  gallery: GalleryPhoto[];
}

export default function InviteClientView({
  initialGuest,
  event,
  gallery,
}: InviteClientViewProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTab, setCurrentTab] = useState<'story' | 'details'>('story');
  const [guest, setGuest] = useState<Guest>(initialGuest);
  const [recentWishes, setRecentWishes] = useState<{ name: string; wish: string; date: string }[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Initialize and preload audio
  useEffect(() => {
    const audioSrc = event.music_url || '/music/wedding.mp3';
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [event.music_url]);

  const startMusic = () => {
    try {
      if (!audioRef.current) {
        const audioSrc = event.music_url || '/music/wedding.mp3';
        const audio = new Audio(audioSrc);
        audio.loop = true;
        audio.volume = 0.5;
        audioRef.current = audio;
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Could not auto-play audio:', err);
        });
    } catch (e) {
      console.warn('Audio start error:', e);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn(err));
    }
  };

  const nameParts = event.couple_names.split('&').map((n) => n.trim());
  const sinhalaCoupleName = event.couple_names_si || 'විනෝද් සහ නිම්නාදී';
  const sinhalaParts = sinhalaCoupleName.includes('සහ')
    ? sinhalaCoupleName.split('සහ').map((n) => n.trim())
    : [sinhalaCoupleName, ''];

  // Format wedding date for display
  const weddingDateObj = new Date(event.date_iso);
  const formattedDate = weddingDateObj.toLocaleDateString('default', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Fetch recent wishes on load
  useEffect(() => {
    fetch(`/api/invite/${guest.invite_code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.recentWishes) {
          setRecentWishes(data.recentWishes);
        }
      })
      .catch((err) => console.warn('Could not load recent wishes:', err));
  }, [guest.invite_code]);

  // Font scale class
  const fontScaleClass =
    event.font_size_scale === 'extra-large'
      ? 'text-lg'
      : event.font_size_scale === 'large'
      ? 'text-base'
      : 'text-sm';

  return (
    <>
      {/* Falling Romantic Heart Rain Shower - ALWAYS active, continuous everywhere */}
      <LeafParticles count={50} />

      {!isOpened ? (
        <EnvelopeCover
          guestName={guest.name}
          coupleNames={event.couple_names}
          coupleNamesSi={sinhalaCoupleName}
          venueName={event.venue_name}
          weddingDateStr={formattedDate}
          onOpen={() => setIsOpened(true)}
          onPlayMusic={startMusic}
        />
      ) : (
        <main
          className={`relative min-h-screen bg-[#0A0406] text-[#FFF1F2] overflow-x-hidden pb-12 ${fontScaleClass}`}
        >
          {/* Floating Music Player */}
          <MusicPlayer isPlaying={isPlaying} onTogglePlay={toggleMusic} />

          {/* Fixed Top Header Bar */}
          <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-rose-900/30 bg-[#120509]/95 px-3 sm:px-4 backdrop-blur-md">
            {currentTab === 'story' ? (
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-rose-400">
                Our Story
              </span>
            ) : (
              <button
                onClick={() => {
                  setCurrentTab('story');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1 text-xs font-semibold text-rose-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Our Story</span>
              </button>
            )}

            {/* Center couple names (English + Sinhala) */}
            <div className="flex flex-col items-center">
              <span className="font-playfair italic text-xs sm:text-sm md:text-base text-white tracking-wide">
                {event.couple_names}
              </span>
              <span className="font-sinhala text-[10px] sm:text-[11px] text-rose-300 font-semibold leading-tight">
                {sinhalaCoupleName}
              </span>
            </div>

            {currentTab === 'story' ? (
              <button
                onClick={() => {
                  setCurrentTab('details');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-full bg-rose-600 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-semibold text-white tracking-wide shadow-sm hover:bg-rose-500 transition cursor-pointer"
              >
                DETAILS →
              </button>
            ) : (
              <div className="w-12 sm:w-16" />
            )}
          </header>

          {/* Main Content Area */}
          <div className="pt-14">
            <AnimatePresence mode="wait">
              {currentTab === 'story' ? (
                /* ========================================================
                   TAB 1: OUR STORY VIEW
                ======================================================== */
                <motion.div
                  key="story"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.35 }}
                  className="mx-auto max-w-md px-3.5 sm:px-4 pt-3 pb-8"
                  id="story"
                >
                  {/* Couple Hero Photo with Dark Bottom Gradient */}
                  <div className="relative overflow-hidden rounded-3xl border border-rose-500/20 shadow-2xl">
                    <img
                      src={
                        event.hero_image_url ||
                        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80'
                      }
                      alt={event.couple_names}
                      className="h-[340px] sm:h-[400px] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0406] via-[#0A0406]/30 to-transparent" />
                  </div>

                  {/* Sparkle & Names */}
                  <div className="text-center mt-5 mb-4">
                    <div className="flex items-center justify-center gap-3 w-36 mx-auto mb-3 opacity-90">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rose-500" />
                      <span className="text-rose-400 text-xs">✦</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rose-500" />
                    </div>

                    <div className="mb-2">
                      <h1 className="font-playfair italic text-3xl sm:text-4xl font-medium text-white">
                        {nameParts[0]}
                      </h1>
                      <span className="font-playfair italic text-lg sm:text-xl text-rose-400 my-0.5 block">&</span>
                      <h1 className="font-playfair italic text-3xl sm:text-4xl font-medium text-white">
                        {nameParts[1]}
                      </h1>

                      {/* Sinhala Couple Badge */}
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/40 px-3.5 sm:px-4 py-1">
                        <span className="font-sinhala text-base sm:text-lg font-bold text-rose-100 tracking-wider">
                          {sinhalaCoupleName}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-rose-200/80 mt-3 leading-relaxed max-w-xs mx-auto">
                      Together with their families, request the pleasure of your company.
                    </p>
                  </div>

                  {/* Couple Profile Cards (Groom & Bride) */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 my-6">
                    {/* Groom Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-[#16080C] shadow-lg">
                      <img
                        src={
                          event.groom_image_url ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
                        }
                        alt="Groom"
                        className="h-44 sm:h-52 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0406] via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 sm:bottom-3 left-0 right-0 text-center px-1">
                        <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-semibold text-rose-400">
                          Groom
                        </p>
                        <p className="font-playfair italic text-base sm:text-lg font-medium text-white">
                          {nameParts[0] || 'Winod'}
                        </p>
                        <p className="font-sinhala text-xs sm:text-sm font-semibold text-rose-300">
                          {sinhalaParts[0] || 'විනෝද්'}
                        </p>
                      </div>
                    </div>

                    {/* Bride Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-[#16080C] shadow-lg">
                      <img
                        src={
                          event.bride_image_url ||
                          '/images/girl.jpeg'
                        }
                        alt="Bride"
                        className="h-44 sm:h-52 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0406] via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 sm:bottom-3 left-0 right-0 text-center px-1">
                        <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-semibold text-rose-400">
                          Bride
                        </p>
                        <p className="font-playfair italic text-base sm:text-lg font-medium text-white">
                          {nameParts[1] || 'Nimnadee'}
                        </p>
                        <p className="font-sinhala text-xs sm:text-sm font-semibold text-rose-300">
                          {sinhalaParts[1] || 'නිම්නාදී'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Wide Pill Button */}
                  <div className="pt-2 pb-6">
                    <button
                      onClick={() => {
                        setCurrentTab('details');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full rounded-full py-3.5 sm:py-4 text-xs font-semibold tracking-[0.2em] uppercase text-white shadow-xl transition hover:brightness-110 active:scale-98 cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #E11D48 0%, #9F1239 50%, #4C0519 100%)',
                      }}
                    >
                      VIEW WEDDING DETAILS →
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* ========================================================
                   TAB 2: WEDDING DETAILS VIEW
                ======================================================== */
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.35 }}
                  className="mx-auto max-w-md px-3.5 sm:px-4 pt-3 pb-12 space-y-4 sm:space-y-5"
                >
                  {/* Couple Circular Portrait & Names */}
                  <div className="text-center pt-2 pb-1">
                    <div className="relative mx-auto mb-3 sm:mb-4 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center overflow-hidden rounded-full border-2 border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.4)]">
                      <img
                        src={
                          event.couple_avatar_url ||
                          event.hero_image_url ||
                          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80'
                        }
                        alt="Couple"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="mb-2">
                      <h1 className="font-playfair italic text-3xl sm:text-4xl text-white">
                        {nameParts[0]}
                      </h1>
                      <span className="font-playfair italic text-lg sm:text-xl text-rose-400 my-0.5 block">&</span>
                      <h1 className="font-playfair italic text-3xl sm:text-4xl text-white">
                        {nameParts[1]}
                      </h1>

                      {/* Sinhala Couple Typography */}
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/40 px-3.5 sm:px-4 py-1">
                        <span className="font-sinhala text-base sm:text-lg font-bold text-rose-100 tracking-wider">
                          {sinhalaCoupleName}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-rose-200/80 mt-2.5 sm:mt-3 leading-relaxed max-w-xs mx-auto">
                      Together with their families, request the pleasure of your company.
                    </p>
                  </div>

                  {/* Parents Card */}
                  <div className="olive-card p-4 sm:p-5 max-w-sm mx-auto shadow-xl space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-rose-400 mb-1">
                        Beloved Son Of
                      </p>
                      <p className="font-playfair italic text-sm sm:text-base text-white">
                        {event.beloved_son_of || 'Rathnasiri & Karunawathi'}
                      </p>
                    </div>

                    <div className="h-px bg-rose-900/30" />

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-rose-400 mb-1">
                        Beloved Daughter Of
                      </p>
                      <p className="font-playfair italic text-sm sm:text-base text-white">
                        {event.beloved_daughter_of || 'Gamini & Madhuka'}
                      </p>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <CountdownTimer
                    targetDateIso={event.date_iso}
                    title={event.title_countdown || 'Until We Say "I Do"'}
                  />

                  {/* Save the Date Calendar */}
                  <FixedCalendar
                    dateIso={event.date_iso}
                    inviteCode={guest.invite_code}
                    coupleNames={event.couple_names}
                    venueName={event.venue_name}
                    title={event.title_calendar || 'Save The Date'}
                  />

                  {/* Schedule */}
                  <div id="schedule">
                    <ScheduleTimeline
                      poruwaTime={event.poruwa_time}
                      receptionTime={event.reception_time}
                      title={event.title_schedule || 'Schedule'}
                    />
                  </div>

                  {/* Venue */}
                  <div id="venue">
                    <VenueMap
                      venueName={event.venue_name}
                      venueAddress={event.venue_address}
                      mapUrl={event.map_url}
                      title={event.title_venue || 'Venue'}
                    />
                  </div>

                  {/* Note / Theme Card (Rendered only if text_note is configured) */}
                  {Boolean(event.text_note && event.text_note.trim() !== '') && (
                    <div className="olive-card p-4 sm:p-5 max-w-sm mx-auto shadow-xl">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-400 mb-1.5">
                        {event.title_note || 'Note'}
                      </p>
                      <p className="text-xs font-medium text-white leading-relaxed">
                        {event.text_note}
                      </p>
                    </div>
                  )}

                  {/* Photo Gallery Lightbox */}
                  <div className="max-w-sm mx-auto pt-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-400 text-center mb-2.5 sm:mb-3">
                      Gallery Memories
                    </p>
                    <LightboxGallery photos={gallery} />
                  </div>

                  {/* Personalized RSVP Card */}
                  <div id="rsvp" className="pt-1">
                    <RsvpForm
                      guest={guest}
                      onRsvpUpdated={(u) => setGuest(u)}
                      recentWishes={recentWishes}
                    />
                  </div>

                  {/* Footer */}
                  <footer className="pt-6 pb-6 text-center text-xs">
                    <div className="h-px w-20 mx-auto bg-gradient-to-r from-transparent via-rose-500/40 to-transparent mb-5" />
                    <p className="font-playfair italic text-xs sm:text-sm text-rose-200/80 mb-1">
                      Thank you for being part of our journey.
                    </p>
                    <p className="font-playfair italic text-xs text-rose-400 mb-1">
                      With love,
                    </p>
                    <p className="font-playfair italic text-base sm:text-lg text-white">
                      {event.couple_names}
                    </p>
                    <p className="font-sinhala text-sm sm:text-base font-bold text-rose-300 mt-1 mb-3">
                      {sinhalaCoupleName}
                    </p>
                    <div className="text-xl mb-6">🌹</div>

                    {/* Replay invitation button */}
                    <button
                      onClick={() => {
                        setIsOpened(false);
                        setCurrentTab('story');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-[11px] underline text-rose-400 hover:text-rose-300 transition cursor-pointer"
                    >
                      Replay invitation
                    </button>
                  </footer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </main>
      )}
    </>
  );
}
