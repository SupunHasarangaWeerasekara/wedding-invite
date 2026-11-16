'use client';

import React, { useState } from 'react';
import { Guest, RsvpStatus } from '@/lib/types';
import confetti from 'canvas-confetti';
import { Check, X, Send, Pen } from 'lucide-react';
import ModalDialog, { DialogVariant } from '@/components/ui/ModalDialog';

interface RsvpFormProps {
  guest: Guest;
  onRsvpUpdated?: (updated: Guest) => void;
  recentWishes?: { name: string; wish: string; date: string }[];
}

export default function RsvpForm({ guest, onRsvpUpdated, recentWishes }: RsvpFormProps) {
  const [status, setStatus] = useState<RsvpStatus>(guest.rsvp_status);
  const [attendingCount, setAttendingCount] = useState<number>(
    guest.attending_count > 0 ? guest.attending_count : guest.max_seats
  );
  const [dietaryNote, setDietaryNote] = useState<string>(guest.dietary_note || '');
  const [wishText, setWishText] = useState<string>(guest.wish_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(guest.rsvp_status === 'accepted');

  const [modalDialog, setModalDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: DialogVariant;
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'info',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: guest.invite_code,
          status,
          attendingCount: status === 'accepted' ? attendingCount : 0,
          dietaryNote,
          wishText,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (status === 'accepted') {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#E11D48', '#BE123C', '#F43F5E', '#FDA4AF', '#F59E0B', '#FFFFFF'],
          });
          setIsConfirmed(true);
        } else {
          setIsConfirmed(false);
          setModalDialog({
            isOpen: true,
            title: 'Response Received',
            description: `Dear ${guest.name}, thank you for letting us know! Even though you are unable to attend, your kind wishes and blessings are deeply appreciated.`,
            variant: 'info',
          });
        }

        if (onRsvpUpdated) {
          onRsvpUpdated({
            ...guest,
            rsvp_status: status,
            attending_count: status === 'accepted' ? attendingCount : 0,
            dietary_note: dietaryNote,
            wish_text: wishText,
          });
        }
      } else {
        setModalDialog({
          isOpen: true,
          title: 'RSVP Submission Failed',
          description: data.error || 'Failed to update RSVP. Please try again.',
          variant: 'danger',
        });
      }
    } catch (err) {
      console.error(err);
      setModalDialog({
        isOpen: true,
        title: 'Connection Error',
        description: 'An unexpected network error occurred. Please verify your connection and try again.',
        variant: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="olive-card p-5 max-w-sm mx-auto shadow-xl">
      <p className="font-playfair italic text-lg text-white mb-3">
        Dear {guest.name},
      </p>

      {isConfirmed ? (
        <div className="rounded-2xl border border-rose-500/40 bg-[#240810]/90 p-5 text-center shadow-inner">
          <p className="font-semibold text-base text-rose-300 flex items-center justify-center gap-1.5">
            <span>✓</span>
            <span>You're confirmed!</span>
          </p>
          <p className="text-xs text-rose-100 mt-1.5 leading-relaxed">
            We can't wait to celebrate with you, {guest.name.split(' ')[0]}!
          </p>

          <button
            onClick={() => setIsConfirmed(false)}
            className="mt-4 inline-flex items-center gap-1 text-[11px] text-rose-400 hover:underline"
          >
            <Pen className="h-3 w-3" />
            <span>Update your RSVP</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-rose-300 font-medium">
            We have reserved up to <strong className="text-white">{guest.max_seats} seat{guest.max_seats > 1 ? 's' : ''}</strong> for you.
          </p>

          {/* Accept / Decline Toggles */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStatus('accepted')}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition cursor-pointer ${
                status === 'accepted'
                  ? 'bg-rose-600 text-white shadow-md border border-rose-400'
                  : 'bg-[#18080C] text-rose-300/70 border border-rose-900/40 hover:bg-[#250D15]'
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>Accept</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('declined')}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition cursor-pointer ${
                status === 'declined'
                  ? 'bg-[#3A0F14] text-white shadow-md border border-rose-500'
                  : 'bg-[#18080C] text-slate-400 border border-rose-900/40 hover:bg-[#250D15]'
              }`}
            >
              <X className="h-3.5 w-3.5" />
              <span>Decline</span>
            </button>
          </div>

          {status === 'accepted' && (
            <div className="space-y-3 pt-1">
              {/* Attending Count */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-rose-400 mb-1">
                  Number Attending (Max {guest.max_seats})
                </label>
                <select
                  value={attendingCount}
                  onChange={(e) => setAttendingCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-rose-900/40 bg-[#120509] px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {Array.from({ length: guest.max_seats }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dietary Note */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-rose-400 mb-1">
                  Dietary Preferences / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={dietaryNote}
                  onChange={(e) => setDietaryNote(e.target.value)}
                  placeholder="e.g. Vegetarian"
                  className="w-full rounded-xl border border-rose-900/40 bg-[#120509] px-3 py-2 text-xs text-white placeholder-rose-300/40 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {/* Wish Text */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-rose-400 mb-1">
              Send a Wish to the Couple
            </label>
            <textarea
              rows={2}
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              placeholder="Your blessings..."
              className="w-full rounded-xl border border-rose-900/40 bg-[#120509] p-2.5 text-xs text-white placeholder-rose-300/40 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold tracking-wider text-white shadow-lg transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #E11D48 0%, #9F1239 50%, #4C0519 100%)',
            }}
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'CONFIRMING...' : 'CONFIRM RSVP'}</span>
          </button>
        </form>
      )}

      {/* Guestbook Blessings & Wishes matching Architecture Plan */}
      {recentWishes && recentWishes.length > 0 && (
        <div className="mt-5 pt-4 border-t border-rose-900/30">
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-rose-400 mb-3 text-center">
            Guestbook Blessings
          </p>
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {recentWishes.map((w, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-rose-900/40 bg-[#16080C]/80 p-3 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs text-rose-200">
                    {w.name}
                  </span>
                  <span className="text-[10px] text-rose-400/60">
                    {w.date}
                  </span>
                </div>
                <p className="text-xs text-white/90 italic font-light leading-relaxed">
                  "{w.wish}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* RSVP Feedback / Error Dialog */}
      <ModalDialog
        isOpen={modalDialog.isOpen}
        onClose={() => setModalDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => setModalDialog((prev) => ({ ...prev, isOpen: false }))}
        showCancel={false}
        title={modalDialog.title}
        description={modalDialog.description}
        confirmText="OK"
        variant={modalDialog.variant}
        theme="dark"
      />
    </div>
  );
}
