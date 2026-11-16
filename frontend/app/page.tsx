import Link from 'next/link';
import { Sparkles, Mail, ShieldCheck, ArrowRight, Heart } from 'lucide-react';
import { defaultEvent } from '@/lib/dummy-data';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#FAFAFA] text-[#1F2937] flex flex-col justify-between overflow-hidden">
      {/* Navigation */}
      <header className="border-b border-rose-100 py-4 px-6 bg-white/90 backdrop-blur-md shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💍</span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-playfair italic text-lg text-stone-900 font-medium tracking-wide">
                {defaultEvent.couple_names}
              </span>
              <span className="font-sinhala text-xs text-rose-600 font-semibold">
                ({defaultEvent.couple_names_si || 'විනෝද් සහ නිම්නාදී'})
              </span>
            </div>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-full border border-rose-200 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-600 hover:text-white transition shadow-xs"
          >
            <ShieldCheck className="h-4 w-4 text-rose-500" />
            <span>Couple Admin</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-2xl mx-auto px-4 py-16 text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-700 mb-6 mx-auto shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-rose-500" />
          <span>Digital Wedding Invitation</span>
          <Sparkles className="h-3.5 w-3.5 text-rose-500" />
        </div>

        <h1 className="font-playfair italic text-5xl md:text-7xl font-normal text-stone-900 tracking-tight leading-tight">
          {defaultEvent.couple_names}
        </h1>

        {/* Sinhala Couple Typography Badge */}
        <div className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50/90 px-5 py-1.5 mx-auto shadow-xs">
          <span className="text-rose-500 text-xs">✦</span>
          <span className="font-sinhala text-xl md:text-2xl font-bold text-rose-900 tracking-wider">
            {defaultEvent.couple_names_si || 'විනෝද් සහ නිම්නාදී'}
          </span>
          <span className="text-rose-500 text-xs">✦</span>
        </div>

        <p className="mt-4 font-playfair italic text-lg text-rose-700 font-medium">
          Sunday, November 29, 2026 • {defaultEvent.venue_name}
        </p>

        <p className="mt-4 text-xs md:text-sm text-stone-600 leading-relaxed max-w-lg mx-auto">
          Experience our royal luxury wedding invitation, complete with animated cover reveal, couple story timeline, interactive calendar, venue map, and personalized RSVP.
        </p>

        {/* Demo CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/invite/VIP-KASUN7"
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full px-8 py-3.5 font-playfair italic text-sm font-semibold tracking-wider text-white shadow-xl transition-all duration-300 hover:brightness-110 active:scale-98"
            style={{
              background: 'linear-gradient(135deg, #E11D48 0%, #9F1239 50%, #4C0519 100%)',
            }}
          >
            <Mail className="h-4 w-4" />
            <span>Open Guest Invitation Demo</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/admin"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-6 py-3.5 text-xs font-semibold tracking-wider text-stone-700 hover:bg-rose-50 hover:text-rose-800 transition shadow-xs"
          >
            <ShieldCheck className="h-4 w-4 text-rose-500" />
            <span>Go to Admin Portal</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-rose-100 py-4 text-center text-xs text-stone-500">
        <p>Digital Wedding Invitation System &bull; Winod & Nimnadee (විනෝද් සහ නිම්නාදී)</p>
      </footer>
    </div>
  );
}
