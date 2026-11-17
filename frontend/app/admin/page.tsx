'use client';

import React, { useState, useEffect } from 'react';
import { Guest, WeddingEvent, GalleryPhoto, RsvpStatus } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Users,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  Plus,
  MessageCircle,
  Search,
  ExternalLink,
  Copy,
  Sparkles,
  Settings,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Type,
  Heart,
  Save,
  Check,
  Trash2,
  LogOut,
  ShieldCheck,
  Music,
  Play,
  Pause,
  Volume2,
  Pencil,
  ArrowUpDown,
  CheckCheck,
} from 'lucide-react';
import AdminLoginScreen from '@/components/admin/AdminLoginScreen';
import ThemeToggle from '@/components/admin/ThemeToggle';
import ModalDialog from '@/components/ui/ModalDialog';
import { AdminUser, isAuthorizedAdmin } from '@/lib/admin-auth';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('wedding_admin_theme') as 'light' | 'dark' | null;
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('wedding_admin_theme', next);
  };

  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'guests' | 'settings'>('guests');

  // Guest list state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newlyAddedGuestId, setNewlyAddedGuestId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // New guest modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [namePrefix, setNamePrefix] = useState('Mr. & Mrs.');
  const [newName, setNewName] = useState('');
  const [newMaxSeats, setNewMaxSeats] = useState(2);
  const [newPhone, setNewPhone] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit guest modal
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editNamePrefix, setEditNamePrefix] = useState('Mr. & Mrs.');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMaxSeats, setEditMaxSeats] = useState(2);
  const [editRsvpStatus, setEditRsvpStatus] = useState<RsvpStatus>('pending');
  const [editAttendingCount, setEditAttendingCount] = useState(1);
  const [editWishText, setEditWishText] = useState('');
  const [editDietaryNote, setEditDietaryNote] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Modern Dialog Box States
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<{ id: string; name: string; code: string } | null>(null);
  const [isDeletingGuest, setIsDeletingGuest] = useState(false);
  const [photoToDeleteIndex, setPhotoToDeleteIndex] = useState<number | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    title: string;
    description: string;
    variant: 'danger' | 'warning' | 'info' | 'success';
  } | null>(null);

  // WhatsApp Share Modal for freshly created guest
  const [createdGuestForShare, setCreatedGuestForShare] = useState<Guest | null>(null);
  const [copiedShareText, setCopiedShareText] = useState(false);

  // Background Audio Preview state
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const toggleAudioPreview = (url: string) => {
    if (!url) return;
    try {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(url);
        previewAudioRef.current.onended = () => setIsPreviewPlaying(false);
      } else if (previewAudioRef.current.src !== url && !previewAudioRef.current.src.endsWith(url)) {
        previewAudioRef.current.pause();
        previewAudioRef.current = new Audio(url);
        previewAudioRef.current.onended = () => setIsPreviewPlaying(false);
      }

      if (isPreviewPlaying) {
        previewAudioRef.current.pause();
        setIsPreviewPlaying(false);
      } else {
        previewAudioRef.current
          .play()
          .then(() => setIsPreviewPlaying(true))
          .catch((e) => {
            console.warn('Audio preview error:', e);
            setIsPreviewPlaying(false);
          });
      }
    } catch (e) {
      console.warn('Audio toggle error:', e);
    }
  };

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  // Event Settings state
  const [eventSettings, setEventSettings] = useState<WeddingEvent | null>(null);
  const [galleryList, setGalleryList] = useState<GalleryPhoto[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchGuests = async (silently = false) => {
    if (!silently) setLoading(true);
    try {
      const res = await fetch(`/api/admin/guests?order=${sortOrder}`);
      const data = await res.json();
      if (data.guests && Array.isArray(data.guests)) {
        setGuests((prev) => {
          if (silently && JSON.stringify(prev) === JSON.stringify(data.guests)) {
            return prev;
          }
          return data.guests;
        });
      }
    } catch (err) {
      if (!silently) console.error(err);
    } finally {
      if (!silently) setLoading(false);
    }
  };

  const fetchEventSettings = async () => {
    try {
      const res = await fetch('/api/admin/event');
      const data = await res.json();
      if (data.event) {
        setEventSettings(data.event);
      }
      if (data.gallery) {
        setGalleryList(data.gallery);
      }
    } catch (err) {
      console.error('Error fetching event settings:', err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('wedding_admin_user') : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.email && isAuthorizedAdmin(parsed.email)) {
            setCurrentUser(parsed);
          }
        }

        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('wedding_admin_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    fetchGuests();
    fetchEventSettings();

    // Supabase Real-time Channel for Instant Updates
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('admin-guests-realtime-channel')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'guests' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newGuest = payload.new as Guest;
                setGuests((prev) => {
                  if (prev.some((g) => g.id === newGuest.id || g.invite_code === newGuest.invite_code)) {
                    return prev;
                  }
                  return sortOrder === 'asc' ? [...prev, newGuest] : [newGuest, ...prev];
                });
                setNewlyAddedGuestId(newGuest.id);
                setTimeout(() => setNewlyAddedGuestId(null), 4500);
                showToast(`New Invitation: ${newGuest.name}`, 'info');
              } else if (payload.eventType === 'UPDATE') {
                const updatedGuest = payload.new as Guest;
                setGuests((prev) =>
                  prev.map((g) => (g.id === updatedGuest.id ? { ...g, ...updatedGuest } : g))
                );
                showToast(`Live Update: ${updatedGuest.name} RSVP updated!`, 'info');
              } else if (payload.eventType === 'DELETE') {
                setGuests((prev) => prev.filter((g) => g.id !== payload.old.id));
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription error:', err);
      }
    }

    // High-frequency Background Poll Fallback (every 3.5 seconds)
    const pollInterval = setInterval(() => {
      fetchGuests(true);
    }, 3500);

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      clearInterval(pollInterval);
    };
  }, [currentUser, sortOrder]);

  const handleConfirmLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {}
    localStorage.removeItem('wedding_admin_user');
    setCurrentUser(null);
    setShowLogoutModal(false);
  };

  const handleQuickStatusChange = async (guest: Guest, newStatus: RsvpStatus) => {
    const previousGuest = { ...guest };
    const newAttendingCount =
      newStatus === 'accepted'
        ? guest.attending_count > 0
          ? guest.attending_count
          : guest.max_seats || 1
        : 0;

    const updatedGuest: Guest = {
      ...guest,
      rsvp_status: newStatus,
      attending_count: newAttendingCount,
      updated_at: new Date().toISOString(),
    };

    // Optimistic instant update
    setGuests((prev) => prev.map((g) => (g.id === guest.id ? updatedGuest : g)));
    showToast(`${guest.name}: RSVP set to ${newStatus.toUpperCase()}`);

    try {
      const res = await fetch('/api/admin/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: guest.id,
          invite_code: guest.invite_code,
          rsvp_status: newStatus,
          attending_count: newAttendingCount,
        }),
      });

      if (!res.ok) {
        setGuests((prev) => prev.map((g) => (g.id === guest.id ? previousGuest : g)));
        showToast('Failed to update status in database', 'error');
      }
    } catch (err) {
      setGuests((prev) => prev.map((g) => (g.id === guest.id ? previousGuest : g)));
      showToast('Network error updating status', 'error');
    }
  };

  const handleQuickSeatsChange = async (guest: Guest, newSeats: number) => {
    const previousSeats = guest.attending_count;
    setGuests((prev) =>
      prev.map((g) => (g.id === guest.id ? { ...g, attending_count: newSeats } : g))
    );

    try {
      await fetch('/api/admin/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: guest.id,
          invite_code: guest.invite_code,
          attending_count: newSeats,
        }),
      });
      showToast(`${guest.name}: seats updated to ${newSeats}`);
    } catch (err) {
      setGuests((prev) =>
        prev.map((g) => (g.id === guest.id ? { ...g, attending_count: previousSeats } : g))
      );
    }
  };

  const handleOpenEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    const prefixes = ['Mr. & Mrs.', 'Mr.', 'Mrs.', 'Miss', 'Rev.', 'Dr.', 'Hon.', 'Family'];
    let matchedPrefix = '';
    let pureName = guest.name;

    for (const p of prefixes) {
      if (guest.name.startsWith(p + ' ')) {
        matchedPrefix = p;
        pureName = guest.name.substring(p.length + 1);
        break;
      }
    }

    setEditNamePrefix(matchedPrefix || 'Mr.');
    setEditName(pureName);
    setEditPhone(guest.phone_number || '');
    setEditMaxSeats(guest.max_seats || 1);
    setEditRsvpStatus(guest.rsvp_status || 'pending');
    setEditAttendingCount(
      guest.attending_count > 0
        ? guest.attending_count
        : guest.rsvp_status === 'accepted'
        ? guest.max_seats || 1
        : 0
    );
    setEditWishText(guest.wish_text || '');
    setEditDietaryNote(guest.dietary_note || '');
  };

  const handleSaveEditGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest || !editName.trim()) return;

    setIsSavingEdit(true);
    const fullName = editNamePrefix ? `${editNamePrefix} ${editName.trim()}` : editName.trim();
    const cleanPhone = editPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone
      ? (cleanPhone.startsWith('94') ? `+${cleanPhone}` : `+94${cleanPhone.replace(/^0+/, '')}`)
      : '';

    const attending =
      editRsvpStatus === 'accepted'
        ? editAttendingCount > 0
          ? editAttendingCount
          : editMaxSeats
        : 0;

    const updatedData: Partial<Guest> = {
      name: fullName,
      phone_number: formattedPhone,
      max_seats: editMaxSeats,
      rsvp_status: editRsvpStatus,
      attending_count: attending,
      wish_text: editWishText.trim(),
      dietary_note: editDietaryNote.trim(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic update
    setGuests((prev) =>
      prev.map((g) => (g.id === editingGuest.id ? { ...g, ...updatedData } : g))
    );

    try {
      const res = await fetch('/api/admin/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGuest.id,
          invite_code: editingGuest.invite_code,
          ...updatedData,
        }),
      });

      const data = await res.json();
      if (res.ok && data.guest) {
        setGuests((prev) =>
          prev.map((g) => (g.id === editingGuest.id ? data.guest : g))
        );
        setEditingGuest(null);
        showToast(`Invitation updated for ${fullName}`);
      } else {
        setFeedbackModal({
          title: 'Failed to Update Invitation',
          description: data.error || 'Could not save updates to database.',
          variant: 'danger',
        });
      }
    } catch (err) {
      setFeedbackModal({
        title: 'Network Error',
        description: 'Failed to reach database while saving.',
        variant: 'danger',
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsAdding(true);
    const fullName = namePrefix ? `${namePrefix} ${newName.trim()}` : newName.trim();
    const cleanPhone = newPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone
      ? (cleanPhone.startsWith('94') ? `+${cleanPhone}` : `+94${cleanPhone.replace(/^0+/, '')}`)
      : '';

    try {
      const res = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          max_seats: newMaxSeats,
          phone_number: formattedPhone,
        }),
      });

      const data = await res.json();
      if (res.ok && data.guest) {
        // Show newly added invitation underneath ("eke yatin")
        if (sortOrder === 'asc') {
          setGuests((prev) => [...prev, data.guest]);
        } else {
          setGuests((prev) => [data.guest, ...prev]);
        }
        setNewlyAddedGuestId(data.guest.id);
        setTimeout(() => setNewlyAddedGuestId(null), 4500);
        setShowAddModal(false);
        setNewName('');
        setNamePrefix('Mr. & Mrs.');
        setNewMaxSeats(2);
        setNewPhone('');
        setCreatedGuestForShare(data.guest);
        showToast(`Invitation added for ${fullName}`);
      } else {
        setFeedbackModal({
          title: 'Failed to Add Guest',
          description: data.error || 'Could not save the guest to the database.',
          variant: 'danger',
        });
      }
    } catch (err) {
      setFeedbackModal({
        title: 'Error Creating Guest',
        description: 'An unexpected connection error occurred.',
        variant: 'danger',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleConfirmDeleteGuest = async () => {
    if (!guestToDelete) return;
    setIsDeletingGuest(true);

    try {
      const res = await fetch(`/api/admin/guests?id=${encodeURIComponent(guestToDelete.id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setGuests(guests.filter((g) => g.id !== guestToDelete.id));
        setGuestToDelete(null);
      } else {
        const data = await res.json();
        setFeedbackModal({
          title: 'Delete Failed',
          description: data.error || 'Failed to remove the guest.',
          variant: 'danger',
        });
      }
    } catch (err) {
      setFeedbackModal({
        title: 'Error Deleting Guest',
        description: 'A network error occurred while deleting the guest.',
        variant: 'danger',
      });
    } finally {
      setIsDeletingGuest(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventSettings) return;

    setSavingSettings(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventSettings,
          gallery: galleryList,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setFeedbackModal({
          title: 'Failed to Save Settings',
          description: data.error || 'Database could not update your wedding settings.',
          variant: 'danger',
        });
      }
    } catch (err) {
      setFeedbackModal({
        title: 'Save Error',
        description: 'An error occurred while connecting to the database.',
        variant: 'danger',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const copyInviteLink = (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/invite/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatWhatsAppMessage = (guestName: string, inviteCode: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteUrl = `${origin}/invite/${inviteCode}`;
    const coupleNameSi = eventSettings?.couple_names_si
      ? eventSettings.couple_names_si.replace(/\s+සහ\s+/g, ', ')
      : 'විනෝද්, නිම්නාදී';

    return (
      `${guestName} 💐,\n\n` +
      `With great joy and happiness, we invite you to celebrate our special day as we begin a beautiful new chapter of our lives. ❤️\n\n` +
      `Your presence and blessings would mean the world to us as we tie the knot and start our journey together.\n\n` +
      `We warmly invite you to join us in celebrating our wedding \n\n` +
      `${inviteUrl}\n\n` +
      `Winod 💍 Nimnadee (${coupleNameSi})`
    );
  };

  const getWhatsAppShareUrl = (guest: { name: string; invite_code: string; phone_number?: string }) => {
    const text = formatWhatsAppMessage(guest.name, guest.invite_code);
    const phone = guest.phone_number ? guest.phone_number.replace(/\D/g, '') : '';
    // Use api.whatsapp.com directly (wa.me shortener corrupts multibyte 4-byte emojis in HTTP 302 redirects)
    if (phone) {
      return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  // Gallery Helpers
  const handleAddGalleryPhoto = () => {
    const newPhoto: GalleryPhoto = {
      id: `p-${Date.now()}`,
      event_id: eventSettings?.id || 'default',
      image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      caption: 'New Memory',
      display_order: galleryList.length + 1,
    };
    setGalleryList([...galleryList, newPhoto]);
  };

  const handleConfirmDeletePhoto = () => {
    if (photoToDeleteIndex !== null) {
      const updated = galleryList.filter((_, i) => i !== photoToDeleteIndex);
      setGalleryList(updated);
      setPhotoToDeleteIndex(null);
    }
  };

  const handleUpdateGalleryPhoto = (idx: number, field: keyof GalleryPhoto, value: any) => {
    const updated = [...galleryList];
    updated[idx] = { ...updated[idx], [field]: value };
    setGalleryList(updated);
  };

  // Metrics
  const totalInvited = guests.length;
  const accepted = guests.filter((g) => g.rsvp_status === 'accepted');
  const declined = guests.filter((g) => g.rsvp_status === 'declined');
  const pending = guests.filter((g) => g.rsvp_status === 'pending');
  const totalAttendingSeats = accepted.reduce((sum, g) => sum + (g.attending_count || 1), 0);

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.invite_code.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark ? 'bg-[#0D0709] text-white' : 'bg-[#FAF6F0] text-[#2C1E1A]'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#C87D55] border-t-transparent" />
          <span className={`text-xs font-semibold ${isDark ? 'text-rose-200/70' : 'text-gray-500'}`}>
            Checking organizer access...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AdminLoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const cardCls = isDark
    ? 'rounded-2xl border border-rose-900/30 bg-[#180E13] p-6 shadow-sm space-y-4 text-white transition'
    : 'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 text-[#2C1E1A] transition';

  const cardHeaderCls = isDark
    ? 'flex items-center gap-2 border-b border-rose-900/30 pb-3 text-sm font-bold text-white'
    : 'flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-bold text-[#2C1E1A]';

  const labelCls = isDark
    ? 'block text-xs font-semibold text-rose-200/85'
    : 'block text-xs font-semibold text-gray-700';

  const inputCls = isDark
    ? 'mt-1 w-full rounded-xl border border-rose-900/40 bg-[#22131A] text-white p-2.5 text-xs focus:border-rose-500 focus:outline-none transition'
    : 'mt-1 w-full rounded-xl border border-gray-300 bg-white text-[#2C1E1A] p-2.5 text-xs focus:border-[#C87D55] focus:outline-none transition';

  const hintCls = isDark
    ? 'mt-1 text-[11px] text-rose-300/50'
    : 'mt-1 text-[11px] text-gray-400';

  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
        isDark ? 'bg-[#0D0709] text-[#FFF1F2]' : 'bg-[#FAF6F0] text-[#2C1E1A]'
      }`}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div
          className={`flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between transition ${
            isDark ? 'border-rose-900/30' : 'border-[#C87D55]/20'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C87D55]">
              <Sparkles className="h-4 w-4" />
              <span>Couple Management Portal</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 tracking-normal normal-case">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Supabase DB Live
              </span>
            </div>
            <h1
              className={`font-serif text-3xl font-bold tracking-tight md:text-4xl transition ${
                isDark ? 'text-white' : 'text-[#2C1E1A]'
              }`}
            >
              {eventSettings?.couple_names || 'Winod & Nimnadee'} Wedding Portal
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-rose-200/70' : 'text-gray-600'}`}>
              Customize your wedding invitation page, manage guest RSVPs, and share personalized invitations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dark/Light Mode Theme Toggle Switch */}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            {/* Logged in Admin Profile Badge */}
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 shadow-xs transition ${
                isDark
                  ? 'bg-[#180E13] border-rose-900/40 text-white'
                  : 'bg-white border-gray-200 text-[#2C1E1A]'
              }`}
            >
              <span className="text-base">
                {currentUser.email.includes('supun') ? '🤵' : '👰'}
              </span>
              <div className="text-left">
                <div className="text-[11px] font-bold leading-tight">
                  {currentUser.name}
                </div>
                <div className={`text-[9px] leading-tight ${isDark ? 'text-rose-300/60' : 'text-gray-400'}`}>
                  {currentUser.email}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              title="Sign Out"
              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <a
              href="/invite/VIP-KASUN7"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-xs transition ${
                isDark
                  ? 'border-rose-900/40 bg-[#180E13] text-rose-200 hover:bg-[#25141D]'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
              <span>Preview Live Invite</span>
            </a>

            {activeTab === 'guests' ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C87D55] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#8C4729] transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Guest</span>
              </button>
            ) : (
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C87D55] px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#8C4729] transition disabled:opacity-60"
              >
                {saveSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{savingSettings ? 'Saving...' : 'Save All Settings'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          className={`my-6 flex gap-2 border-b transition ${
            isDark ? 'border-rose-900/40' : 'border-gray-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('guests')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'guests'
                ? isDark
                  ? 'border-rose-500 text-rose-300'
                  : 'border-[#C87D55] text-[#C87D55]'
                : isDark
                ? 'border-transparent text-rose-200/50 hover:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Guest List & RSVPs ({totalInvited})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'settings'
                ? isDark
                  ? 'border-rose-500 text-rose-300'
                  : 'border-[#C87D55] text-[#C87D55]'
                : isDark
                ? 'border-transparent text-rose-200/50 hover:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Page Customization & Settings</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: GUESTS & RSVP TRACKING
        ======================================================== */}
        {activeTab === 'guests' && (
          <div>
            {/* Metric Cards */}
            <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
              <div
                className={`rounded-2xl border p-4 shadow-sm transition ${
                  isDark ? 'border-rose-900/30 bg-[#180E13]' : 'border-gray-200 bg-white'
                }`}
              >
                <div
                  className={`flex items-center justify-between text-xs font-medium uppercase ${
                    isDark ? 'text-rose-200/60' : 'text-gray-500'
                  }`}
                >
                  <span>Total Invitations</span>
                  <Users className="h-4 w-4 text-gray-400" />
                </div>
                <p
                  className={`mt-2 font-serif text-3xl font-bold ${
                    isDark ? 'text-white' : 'text-[#2C1E1A]'
                  }`}
                >
                  {totalInvited}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-4 shadow-sm transition ${
                  isDark
                    ? 'border-emerald-900/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-emerald-100 bg-emerald-50/50 text-emerald-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase">Accepted (Seats)</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mt-2 font-serif text-3xl font-bold">
                  {accepted.length}{' '}
                  <span
                    className={`text-sm font-sans font-normal ${
                      isDark ? 'text-emerald-400/80' : 'text-emerald-600'
                    }`}
                  >
                    ({totalAttendingSeats} seats)
                  </span>
                </p>
              </div>

              <div
                className={`rounded-2xl border p-4 shadow-sm transition ${
                  isDark
                    ? 'border-amber-900/40 bg-amber-950/30 text-amber-300'
                    : 'border-amber-100 bg-amber-50/50 text-amber-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase">Pending</span>
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <p className="mt-2 font-serif text-3xl font-bold">{pending.length}</p>
              </div>

              <div
                className={`rounded-2xl border p-4 shadow-sm transition ${
                  isDark
                    ? 'border-rose-900/40 bg-rose-950/30 text-rose-300'
                    : 'border-rose-100 bg-rose-50/50 text-rose-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase">Declined</span>
                  <XCircle className="h-4 w-4 text-rose-500" />
                </div>
                <p className="mt-2 font-serif text-3xl font-bold">{declined.length}</p>
              </div>
            </div>

            {/* Guest Search, Sort Order & Live Indicator */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full max-w-sm">
                <Search
                  className={`absolute left-3 top-2.5 h-4 w-4 ${
                    isDark ? 'text-rose-400' : 'text-gray-400'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search by name or invite code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full rounded-xl border py-2 pl-9 pr-4 text-xs focus:outline-none transition ${
                    isDark
                      ? 'border-rose-900/40 bg-[#180E13] text-white placeholder:text-rose-200/40 focus:border-rose-500'
                      : 'border-gray-300 bg-white text-gray-800 focus:border-[#C87D55]'
                  }`}
                />
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {/* Live Real-time Status Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border ${
                    isDark
                      ? 'border-emerald-800/40 bg-emerald-950/40 text-emerald-300'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}
                  title="Live Instant Sync Active with Supabase Realtime"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Live Sync Active</span>
                </div>

                {/* Sort Order Selector */}
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    isDark
                      ? 'border-rose-900/40 bg-[#180E13] text-rose-200 hover:bg-[#25141D]'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Toggle order (New guests at bottom vs top)"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span>{sortOrder === 'asc' ? 'Added Order (New at Bottom)' : 'Newest at Top'}</span>
                </button>
              </div>
            </div>

            {/* Guests Table */}
            <div
              className={`overflow-hidden rounded-2xl border shadow-sm transition ${
                isDark ? 'border-rose-900/30 bg-[#180E13]' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead
                    className={`border-b uppercase font-semibold text-[11px] transition ${
                      isDark
                        ? 'bg-[#201319] border-rose-900/30 text-rose-300'
                        : 'bg-[#FAF6F0] border-gray-200 text-gray-600'
                    }`}
                  >
                    <tr>
                      <th className="p-3.5">Guest Name</th>
                      <th className="p-3.5">Invite Code</th>
                      <th className="p-3.5">Max Seats</th>
                      <th className="p-3.5">RSVP Status</th>
                      <th className="p-3.5">Attending</th>
                      <th className="p-3.5">Dietary / Wishes</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y transition ${
                      isDark ? 'divide-rose-900/20' : 'divide-gray-100'
                    }`}
                  >
                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className={`p-8 text-center ${isDark ? 'text-rose-200/60' : 'text-gray-500'}`}
                        >
                          Loading guest list...
                        </td>
                      </tr>
                    ) : filteredGuests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className={`p-8 text-center ${isDark ? 'text-rose-200/60' : 'text-gray-500'}`}
                        >
                          No guests found. Click "Add New Guest" to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredGuests.map((guest) => {
                        const isNewlyAdded = guest.id === newlyAddedGuestId;
                        return (
                          <tr
                            key={guest.id}
                            className={`transition duration-300 ${
                              isNewlyAdded
                                ? isDark
                                  ? 'bg-rose-900/40 ring-1 ring-rose-400'
                                  : 'bg-emerald-50 ring-1 ring-emerald-400'
                                : isDark
                                ? 'hover:bg-rose-950/20 text-white'
                                : 'hover:bg-gray-50/80 text-[#2C1E1A]'
                            }`}
                          >
                            <td className="p-3.5 font-medium">
                              <div className="flex items-center gap-2">
                                <span>{guest.name}</span>
                                {isNewlyAdded && (
                                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 animate-pulse">
                                    NEW
                                  </span>
                                )}
                              </div>
                              {guest.phone_number && (
                                <div
                                  className={`text-[11px] ${
                                    isDark ? 'text-rose-300/60' : 'text-gray-400'
                                  }`}
                                >
                                  {guest.phone_number}
                                </div>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`font-mono rounded px-2 py-0.5 text-xs ${
                                  isDark
                                    ? 'border border-rose-900/40 bg-rose-950/80 text-rose-200'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {guest.invite_code}
                              </span>
                            </td>
                            <td className={`p-3.5 ${isDark ? 'text-rose-200/80' : 'text-gray-600'}`}>
                              {guest.max_seats}
                            </td>
                            <td className="p-3.5">
                              {/* Direct Instant RSVP Status Change Dropdown */}
                              <div className="relative inline-block">
                                <select
                                  value={guest.rsvp_status}
                                  onChange={(e) =>
                                    handleQuickStatusChange(guest, e.target.value as RsvpStatus)
                                  }
                                  title="Click to update RSVP status directly"
                                  className={`appearance-none text-xs font-semibold rounded-full pl-3 pr-6 py-1 border cursor-pointer outline-none transition shadow-xs ${
                                    guest.rsvp_status === 'accepted'
                                      ? isDark
                                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/80'
                                        : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                      : guest.rsvp_status === 'declined'
                                      ? isDark
                                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/50 hover:bg-rose-900/80'
                                        : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                                      : isDark
                                      ? 'bg-amber-950/80 text-amber-300 border-amber-800/50 hover:bg-amber-900/80'
                                      : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                  }`}
                                >
                                  <option value="pending" className="bg-[#180E13] text-amber-300">
                                    ⏳ Pending
                                  </option>
                                  <option value="accepted" className="bg-[#180E13] text-emerald-300">
                                    ✓ Accepted
                                  </option>
                                  <option value="declined" className="bg-[#180E13] text-rose-300">
                                    ✕ Declined
                                  </option>
                                </select>
                                <span className="pointer-events-none absolute right-2 top-1.5 text-[8px] opacity-60">
                                  ▼
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5 font-semibold">
                              {guest.rsvp_status === 'accepted' ? (
                                <select
                                  value={guest.attending_count || 1}
                                  onChange={(e) =>
                                    handleQuickSeatsChange(guest, Number(e.target.value))
                                  }
                                  title="Adjust attending seats"
                                  className={`rounded-lg px-2 py-0.5 border text-xs font-semibold cursor-pointer outline-none ${
                                    isDark
                                      ? 'border-emerald-800/40 bg-[#24151C] text-emerald-300 hover:border-emerald-500'
                                      : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-500'
                                  }`}
                                >
                                  {Array.from(
                                    {
                                      length: Math.max(
                                        guest.max_seats,
                                        guest.attending_count || 1
                                      ),
                                    },
                                    (_, i) => i + 1
                                  ).map((s) => (
                                    <option key={s} value={s} className="bg-[#180E13] text-white">
                                      {s} {s === 1 ? 'seat' : 'seats'}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td
                              className={`p-3.5 max-w-xs truncate ${
                                isDark ? 'text-rose-200/70' : 'text-gray-500'
                              }`}
                            >
                              {guest.wish_text ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditGuest(guest)}
                                  className="text-left group cursor-pointer block truncate w-full"
                                  title={`Click to view or edit full wish:\n"${guest.wish_text}"`}
                                >
                                  <span className="group-hover:underline">
                                    💌 "{guest.wish_text}"
                                  </span>
                                </button>
                              ) : guest.dietary_note ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditGuest(guest)}
                                  className="text-left group cursor-pointer block truncate w-full"
                                  title={`Click to edit dietary note:\n${guest.dietary_note}`}
                                >
                                  <span className="group-hover:underline">
                                    🥗 {guest.dietary_note}
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditGuest(guest)}
                                  className={`text-[11px] underline transition cursor-pointer ${
                                    isDark
                                      ? 'text-rose-400/60 hover:text-rose-300'
                                      : 'text-gray-400 hover:text-gray-600'
                                  }`}
                                  title="Add comment or dietary requirement"
                                >
                                  + Add Note / Wish
                                </button>
                              )}
                            </td>
                            <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                              {/* Copy Link */}
                              <button
                                onClick={() => copyInviteLink(guest.invite_code)}
                                title="Copy Link"
                                className={`inline-flex items-center justify-center rounded-lg border p-2 transition cursor-pointer ${
                                  isDark
                                    ? 'border-rose-900/40 bg-[#24151C] text-rose-200 hover:bg-[#301B25]'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                {copiedCode === guest.invite_code ? (
                                  <span className="text-[10px] font-bold text-emerald-400">
                                    Copied!
                                  </span>
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>

                              {/* WhatsApp Invite */}
                              <a
                                href={getWhatsAppShareUrl(guest)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                    navigator.clipboard
                                      .writeText(
                                        formatWhatsAppMessage(guest.name, guest.invite_code)
                                      )
                                      .catch(() => {});
                                  }
                                }}
                                title="Send via WhatsApp (Auto-copies message with emojis to clipboard)"
                                className="inline-flex items-center justify-center rounded-lg border border-emerald-500 bg-emerald-500 p-2 text-white hover:bg-emerald-600 cursor-pointer"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>

                              {/* Edit Invitation & RSVP */}
                              <button
                                onClick={() => handleOpenEditGuest(guest)}
                                title="Edit Invitation, RSVP & Comment"
                                className={`inline-flex items-center justify-center rounded-lg border p-2 transition cursor-pointer ${
                                  isDark
                                    ? 'border-amber-900/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 hover:text-white'
                                    : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {/* Preview */}
                              <a
                                href={`/invite/${guest.invite_code}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Preview Invitation"
                                className={`inline-flex items-center justify-center rounded-lg border p-2 transition cursor-pointer ${
                                  isDark
                                    ? 'border-rose-900/40 bg-[#24151C] text-rose-200 hover:bg-[#301B25]'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>

                              {/* Delete Guest */}
                              <button
                                onClick={() =>
                                  setGuestToDelete({
                                    id: guest.id,
                                    name: guest.name,
                                    code: guest.invite_code,
                                  })
                                }
                                title="Delete Guest"
                                className={`inline-flex items-center justify-center rounded-lg border p-2 transition cursor-pointer ${
                                  isDark
                                    ? 'border-rose-900/50 bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 hover:text-white'
                                    : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                                }`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: WEDDING PAGE CUSTOMIZATION & SETTINGS
        ======================================================== */}
        {activeTab === 'settings' && eventSettings && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Top notification if saved */}
            {saveSuccess && (
              <div
                className={`flex items-center gap-2 rounded-xl border p-4 text-xs font-semibold shadow-sm ${
                  isDark
                    ? 'border-emerald-800/40 bg-emerald-950/70 text-emerald-300'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Settings saved successfully! Changes are immediately active on all live invitation links.</span>
              </div>
            )}

            {/* 1. Couple Names & Language */}
            <div className={cardCls}>
              <div className={cardHeaderCls}>
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Couple Names & Sinhala Typography</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>
                    Couple Names (English)
                  </label>
                  <input
                    type="text"
                    value={eventSettings.couple_names}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, couple_names: e.target.value })
                    }
                    placeholder="e.g. Sanjaya & Gagani"
                    className={inputCls}
                    required
                  />
                  <p className={hintCls}>Displayed in main headings and metadata.</p>
                </div>

                <div>
                  <label className={labelCls}>
                    Couple Names (සිංහලෙන් - Sinhala)
                  </label>
                  <input
                    type="text"
                    value={eventSettings.couple_names_si || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, couple_names_si: e.target.value })
                    }
                    placeholder="e.g. සංජය සහ ගගනි"
                    className={`${inputCls} font-sinhala`}
                  />
                  <p className={hintCls}>Displayed in Abhaya Libre serif script on invitation badges.</p>
                </div>
              </div>
            </div>

            {/* 2. Typography & Fonts Settings */}
            <div className={cardCls}>
              <div className={cardHeaderCls}>
                <Type className="h-4 w-4 text-blue-500" />
                <span>Font & Size Settings</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>
                    Heading Font Style
                  </label>
                  <select
                    value={eventSettings.font_family || 'Playfair Display'}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, font_family: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option value="Playfair Display">Playfair Display (Romantic Editorial Serif)</option>
                    <option value="Cormorant Garamond">Cormorant Garamond (Classic Luxury)</option>
                    <option value="Bodoni Moda">Bodoni Moda (High-Contrast Vogue Serif)</option>
                    <option value="Serif">Traditional Serif</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    Font Scale / Size
                  </label>
                  <select
                    value={eventSettings.font_size_scale || 'normal'}
                    onChange={(e) =>
                      setEventSettings({
                        ...eventSettings,
                        font_size_scale: e.target.value as any,
                      })
                    }
                    className={inputCls}
                  >
                    <option value="normal">Normal (Standard balanced sizing)</option>
                    <option value="large">Large (+15% larger typography for readability)</option>
                    <option value="extra-large">Extra Large (+30% bold prominent typography)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Page Images Customization */}
            <div className={cardCls}>
              <div className={cardHeaderCls}>
                <ImageIcon className="h-4 w-4 text-purple-500" />
                <span>Page Images & Couple Photos</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Hero Photo */}
                <div>
                  <label className={labelCls}>
                    Hero Cover Photo URL
                  </label>
                  <input
                    type="url"
                    value={eventSettings.hero_image_url || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, hero_image_url: e.target.value })
                    }
                    placeholder="https://..."
                    className={inputCls}
                  />
                  {eventSettings.hero_image_url && (
                    <div className={`mt-2 h-20 w-32 overflow-hidden rounded-lg border ${isDark ? 'border-rose-900/40' : 'border-gray-200'}`}>
                      <img src={eventSettings.hero_image_url} alt="Hero" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Circle Avatar */}
                <div>
                  <label className={labelCls}>
                    Couple Circle Portrait URL
                  </label>
                  <input
                    type="url"
                    value={eventSettings.couple_avatar_url || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, couple_avatar_url: e.target.value })
                    }
                    placeholder="https://..."
                    className={inputCls}
                  />
                  {eventSettings.couple_avatar_url && (
                    <div className="mt-2 h-16 w-16 overflow-hidden rounded-full border-2 border-rose-400">
                      <img src={eventSettings.couple_avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Groom Photo */}
                <div>
                  <label className={labelCls}>
                    Groom Photo URL (Winod)
                  </label>
                  <input
                    type="url"
                    value={eventSettings.groom_image_url || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, groom_image_url: e.target.value })
                    }
                    placeholder="https://..."
                    className={inputCls}
                  />
                  {eventSettings.groom_image_url && (
                    <div className={`mt-2 h-20 w-20 overflow-hidden rounded-lg border ${isDark ? 'border-rose-900/40' : 'border-gray-200'}`}>
                      <img src={eventSettings.groom_image_url} alt="Groom" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Bride Photo */}
                <div>
                  <label className={labelCls}>
                    Bride Photo URL (Nimnadee)
                  </label>
                  <input
                    type="url"
                    value={eventSettings.bride_image_url || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, bride_image_url: e.target.value })
                    }
                    placeholder="https://..."
                    className={inputCls}
                  />
                  {eventSettings.bride_image_url && (
                    <div className={`mt-2 h-20 w-20 overflow-hidden rounded-lg border ${isDark ? 'border-rose-900/40' : 'border-gray-200'}`}>
                      <img src={eventSettings.bride_image_url} alt="Bride" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Photos Manager */}
              <div className={`pt-4 border-t ${isDark ? 'border-rose-900/30' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold ${isDark ? 'text-rose-200' : 'text-gray-700'}`}>Gallery Memories ({galleryList.length} Photos)</span>
                  <button
                    type="button"
                    onClick={handleAddGalleryPhoto}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
                      isDark
                        ? 'bg-[#25141D] text-rose-200 hover:bg-[#341d29] border border-rose-900/40'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {galleryList.map((photo, idx) => (
                    <div
                      key={photo.id || idx}
                      className={`flex gap-3 rounded-xl border p-3 ${
                        isDark ? 'border-rose-900/40 bg-[#22131A]' : 'border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <img src={photo.image_url} alt={photo.caption} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="flex-1 space-y-1.5 text-xs">
                        <input
                          type="url"
                          value={photo.image_url}
                          onChange={(e) => handleUpdateGalleryPhoto(idx, 'image_url', e.target.value)}
                          placeholder="Image URL"
                          className={`w-full rounded-lg border px-2 py-1 text-[11px] ${
                            isDark
                              ? 'border-rose-900/40 bg-[#180E13] text-white focus:border-rose-500'
                              : 'border-gray-300 bg-white text-[#2C1E1A]'
                          }`}
                        />
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) => handleUpdateGalleryPhoto(idx, 'caption', e.target.value)}
                          placeholder="Photo Caption"
                          className={`w-full rounded-lg border px-2 py-1 text-[11px] ${
                            isDark
                              ? 'border-rose-900/40 bg-[#180E13] text-white focus:border-rose-500'
                              : 'border-gray-300 bg-white text-[#2C1E1A]'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhotoToDeleteIndex(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        title="Remove Photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Wedding Background Music & Song */}
            <div className={cardCls}>
              <div className={cardHeaderCls}>
                <Music className="h-4 w-4 text-rose-500" />
                <span>Wedding Background Music / Song</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Background Music Audio URL (.mp3)</label>
                  <div className="mt-1 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={eventSettings.music_url || ''}
                      onChange={(e) => {
                        if (isPreviewPlaying && previewAudioRef.current) {
                          previewAudioRef.current.pause();
                          setIsPreviewPlaying(false);
                        }
                        setEventSettings({ ...eventSettings, music_url: e.target.value });
                      }}
                      placeholder="/music/wedding.mp3 or https://..."
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => toggleAudioPreview(eventSettings.music_url || '/music/wedding.mp3')}
                      title={isPreviewPlaying ? 'Pause Audio Preview' : 'Play Audio Preview'}
                      className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                        isPreviewPlaying
                          ? 'bg-rose-600 text-white shadow-md animate-pulse'
                          : isDark
                          ? 'bg-[#25141D] text-rose-200 border border-rose-900/40 hover:bg-[#341d29]'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {isPreviewPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Pause Audio</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Listen / Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className={hintCls}>
                    This audio automatically plays when guests open their digital invitation envelope. You can use local paths (e.g. <code>/music/wedding.mp3</code>) or any direct online audio link.
                  </p>
                </div>

                {/* Preset Song Selection */}
                <div>
                  <label className={`text-[11px] font-semibold ${isDark ? 'text-rose-300/80' : 'text-gray-500'}`}>
                    Quick Presets:
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPreviewPlaying && previewAudioRef.current) previewAudioRef.current.pause();
                        setIsPreviewPlaying(false);
                        setEventSettings({ ...eventSettings, music_url: '/music/beautiful-in-white.mp3' });
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition cursor-pointer ${
                        eventSettings.music_url?.includes('beautiful-in-white')
                          ? 'border-rose-500 bg-rose-500/15 text-rose-300 font-bold'
                          : isDark
                          ? 'border-rose-900/30 bg-[#22131A] text-rose-200/70 hover:text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      🎵 Westlife - Beautiful In White (/music/beautiful-in-white.mp3)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isPreviewPlaying && previewAudioRef.current) previewAudioRef.current.pause();
                        setIsPreviewPlaying(false);
                        setEventSettings({ ...eventSettings, music_url: '/music/wedding.mp3' });
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition cursor-pointer ${
                        eventSettings.music_url === '/music/wedding.mp3'
                          ? 'border-rose-500 bg-rose-500/15 text-rose-300 font-bold'
                          : isDark
                          ? 'border-rose-900/30 bg-[#22131A] text-rose-200/70 hover:text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      🎵 Classic Wedding Melody (/music/wedding.mp3)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Location & Venue */}
            <div className={cardCls}>
              <div className={cardHeaderCls}>
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>Venue & Location Settings</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Venue Name</label>
                  <input
                    type="text"
                    value={eventSettings.venue_name}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, venue_name: e.target.value })
                    }
                    placeholder="e.g. Grand Ballroom, Shangri-La Colombo"
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Venue Address</label>
                  <input
                    type="text"
                    value={eventSettings.venue_address}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, venue_address: e.target.value })
                    }
                    placeholder="e.g. 1 Galle Face, Colombo 02, Sri Lanka"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Google Maps URL</label>
                  <input
                    type="url"
                    value={eventSettings.map_url}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, map_url: e.target.value })
                    }
                    placeholder="https://maps.google.com/..."
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* 6. Date & Schedule */}
            <div className={cardCls}>
              <div className={cardHeaderCls}>
                <Calendar className="h-4 w-4 text-amber-500" />
                <span>Date & Ceremony Schedule</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Wedding Date (ISO)</label>
                  <input
                    type="text"
                    value={eventSettings.date_iso}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, date_iso: e.target.value })
                    }
                    placeholder="2026-12-18T09:30:00+05:30"
                    className={inputCls}
                    required
                  />
                  <p className={hintCls}>Controls the countdown timer & calendar date.</p>
                </div>

                <div>
                  <label className={labelCls}>Poruwa Ceremony Time</label>
                  <input
                    type="text"
                    value={eventSettings.poruwa_time}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, poruwa_time: e.target.value })
                    }
                    placeholder="09:30 AM"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Reception Time</label>
                  <input
                    type="text"
                    value={eventSettings.reception_time}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, reception_time: e.target.value })
                    }
                    placeholder="11:45 AM"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* 7. Parents & Family Lineage */}
            <div className={cardCls}>
              <div className={cardHeaderCls}>
                <Users className="h-4 w-4 text-indigo-500" />
                <span>Parents (Beloved Son Of & Beloved Daughter Of)</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>
                    Beloved Son Of (Groom's Parents)
                  </label>
                  <input
                    type="text"
                    value={eventSettings.beloved_son_of || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, beloved_son_of: e.target.value })
                    }
                    placeholder="e.g. Rathnasiri & Karunawathi"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Beloved Daughter Of (Bride's Parents)
                  </label>
                  <input
                    type="text"
                    value={eventSettings.beloved_daughter_of || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, beloved_daughter_of: e.target.value })
                    }
                    placeholder="e.g. Gamini & Madhuka"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* 8. Section Titles & Custom Texts */}
            <div className={cardCls}>
              <div className={cardHeaderCls}>
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Custom Section Titles & Note</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>
                    Countdown Title (Until We Say "I Do")
                  </label>
                  <input
                    type="text"
                    value={eventSettings.title_countdown || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, title_countdown: e.target.value })
                    }
                    placeholder='Until We Say "I Do"'
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Calendar Section Title (Save The Date)
                  </label>
                  <input
                    type="text"
                    value={eventSettings.title_calendar || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, title_calendar: e.target.value })
                    }
                    placeholder="Save The Date"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Schedule Section Title
                  </label>
                  <input
                    type="text"
                    value={eventSettings.title_schedule || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, title_schedule: e.target.value })
                    }
                    placeholder="Schedule"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Venue Section Title
                  </label>
                  <input
                    type="text"
                    value={eventSettings.title_venue || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, title_venue: e.target.value })
                    }
                    placeholder="Venue"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Note Section Title
                  </label>
                  <input
                    type="text"
                    value={eventSettings.title_note || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, title_note: e.target.value })
                    }
                    placeholder="Note"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Note Description Text
                  </label>
                  <input
                    type="text"
                    value={eventSettings.text_note || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, text_note: e.target.value })
                    }
                    placeholder="Wedding theme: Crimson Red & Obsidian Black"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C87D55] px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#8C4729] transition disabled:opacity-60 cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{savingSettings ? 'Saving...' : 'Save All Settings'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Add Guest Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div
              className={`w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl transition ${
                isDark
                  ? 'bg-[#180E13] border border-rose-500/30 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                  : 'bg-white border border-gray-200 text-[#2C1E1A] shadow-xl'
              }`}
            >
              {/* Modal Header with Title and Close Button */}
              <div className="flex items-center justify-between pb-2 border-b border-rose-900/20">
                <h2
                  className={`font-serif text-lg sm:text-xl font-bold ${
                    isDark ? 'text-white' : 'text-[#2C1E1A]'
                  }`}
                >
                  Add New Guest
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`p-1.5 rounded-full transition cursor-pointer ${
                    isDark
                      ? 'text-gray-400 hover:text-white hover:bg-rose-950/60'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddGuest} className="mt-4 space-y-4 text-xs">
                {/* Guest Name with Title Dropdown */}
                <div>
                  <label className={labelCls}>Guest Name / Family Name</label>
                  <div className="flex gap-2 mt-1">
                    <select
                      value={namePrefix}
                      onChange={(e) => setNamePrefix(e.target.value)}
                      className={`w-28 sm:w-32 rounded-xl px-2.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer ${
                        isDark
                          ? 'bg-[#12080D] border border-rose-500/30 text-rose-200'
                          : 'bg-gray-50 border border-gray-300 text-gray-800'
                      }`}
                    >
                      <option value="Mr. & Mrs.">Mr. & Mrs.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Miss.">Miss.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Dr. & Mrs.">Dr. & Mrs.</option>
                      <option value="Rev.">Rev.</option>
                      <option value="Family">Family</option>
                      <option value="">(None)</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Perera"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className={`flex-1 ${inputCls}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Max Allowed Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newMaxSeats}
                    onChange={(e) => setNewMaxSeats(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>

                {/* WhatsApp Phone with Fixed +94 Prefix */}
                <div>
                  <label className={labelCls}>WhatsApp Phone (Optional)</label>
                  <div className="relative flex items-center mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-2.5 text-xs font-semibold rounded-l-xl border-y border-l select-none ${
                        isDark
                          ? 'bg-[#24151C] border-rose-500/30 text-rose-300'
                          : 'bg-gray-100 border-gray-300 text-gray-700'
                      }`}
                    >
                      +94
                    </span>
                    <input
                      type="tel"
                      placeholder="771234567"
                      value={newPhone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.startsWith('94')) val = val.substring(2);
                        if (val.startsWith('0')) val = val.substring(1);
                        setNewPhone(val);
                      }}
                      className={`flex-1 rounded-r-xl rounded-l-none border-y border-r px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                        isDark
                          ? 'bg-[#12080D] border-rose-500/30 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  <p className={`mt-1 text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Type 9 digits without leading 0 (e.g. 771234567)
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`rounded-xl border px-4 py-2 font-semibold transition cursor-pointer ${
                      isDark
                        ? 'border-rose-900/40 bg-[#24151C] text-rose-200 hover:bg-[#301B25]'
                        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="rounded-xl bg-[#C87D55] px-4 py-2 font-semibold text-white hover:bg-[#8C4729] cursor-pointer"
                  >
                    {isAdding ? 'Adding...' : 'Save Guest'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Guest & RSVP Modal */}
        {editingGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
            <div
              className={`w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl transition max-h-[90vh] overflow-y-auto ${
                isDark
                  ? 'bg-[#180E13] border border-amber-500/30 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
                  : 'bg-white border border-gray-200 text-[#2C1E1A] shadow-2xl'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-rose-900/20">
                <div>
                  <h2
                    className={`font-serif text-lg sm:text-xl font-bold ${
                      isDark ? 'text-white' : 'text-[#2C1E1A]'
                    }`}
                  >
                    Edit Invitation & RSVP
                  </h2>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-rose-200/70' : 'text-gray-500'}`}>
                    Invite Code: <span className="font-mono font-semibold text-amber-400">{editingGuest.invite_code}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className={`p-1.5 rounded-full transition cursor-pointer ${
                    isDark
                      ? 'text-gray-400 hover:text-white hover:bg-rose-950/60'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditGuest} className="mt-4 space-y-4 text-xs">
                {/* Guest Name & Prefix */}
                <div>
                  <label className={labelCls}>Guest / Family Name</label>
                  <div className="flex gap-2 mt-1">
                    <select
                      value={editNamePrefix}
                      onChange={(e) => setEditNamePrefix(e.target.value)}
                      className={`w-28 rounded-xl border px-2.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer ${
                        isDark
                          ? 'bg-[#12080D] border-rose-500/30 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="Mr. & Mrs.">Mr. & Mrs.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Miss">Miss</option>
                      <option value="Rev.">Rev.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Hon.">Hon.</option>
                      <option value="Family">Family</option>
                      <option value="">(None)</option>
                    </select>

                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Guest full name"
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDark
                          ? 'bg-[#12080D] border-rose-500/30 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Phone & Max Seats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>WhatsApp / Phone</label>
                    <div className="flex mt-1">
                      <span
                        className={`inline-flex items-center rounded-l-xl border-y border-l px-2.5 text-xs font-semibold ${
                          isDark
                            ? 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                            : 'bg-gray-100 border-gray-300 text-gray-600'
                        }`}
                      >
                        +94
                      </span>
                      <input
                        type="tel"
                        value={editPhone.replace(/^\+94/, '')}
                        placeholder="77 123 4567"
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.startsWith('94')) val = val.substring(2);
                          if (val.startsWith('0')) val = val.substring(1);
                          setEditPhone(val);
                        }}
                        className={`flex-1 rounded-r-xl rounded-l-none border-y border-r px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDark
                            ? 'bg-[#12080D] border-rose-500/30 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Max Allowed Seats</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={editMaxSeats}
                      onChange={(e) => setEditMaxSeats(Math.max(1, Number(e.target.value)))}
                      className={`w-full mt-1 rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDark
                          ? 'bg-[#12080D] border-rose-500/30 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* RSVP Status Selection */}
                <div>
                  <label className={labelCls}>RSVP Status</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditRsvpStatus('pending');
                        setEditAttendingCount(0);
                      }}
                      className={`rounded-xl border py-2 px-2 font-semibold text-xs transition cursor-pointer text-center ${
                        editRsvpStatus === 'pending'
                          ? isDark
                            ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-sm'
                            : 'bg-amber-100 border-amber-400 text-amber-800 shadow-sm'
                          : isDark
                          ? 'border-rose-900/40 bg-[#12080D] text-gray-400 hover:text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      ⏳ Pending
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditRsvpStatus('accepted');
                        if (editAttendingCount === 0) setEditAttendingCount(editMaxSeats || 1);
                      }}
                      className={`rounded-xl border py-2 px-2 font-semibold text-xs transition cursor-pointer text-center ${
                        editRsvpStatus === 'accepted'
                          ? isDark
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-emerald-100 border-emerald-400 text-emerald-800 shadow-sm'
                          : isDark
                          ? 'border-rose-900/40 bg-[#12080D] text-gray-400 hover:text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      ✓ Accepted
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditRsvpStatus('declined');
                        setEditAttendingCount(0);
                      }}
                      className={`rounded-xl border py-2 px-2 font-semibold text-xs transition cursor-pointer text-center ${
                        editRsvpStatus === 'declined'
                          ? isDark
                            ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-sm'
                            : 'bg-rose-100 border-rose-400 text-rose-800 shadow-sm'
                          : isDark
                          ? 'border-rose-900/40 bg-[#12080D] text-gray-400 hover:text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      ✕ Declined
                    </button>
                  </div>
                </div>

                {/* Attending Seats Stepper (if Accepted) */}
                {editRsvpStatus === 'accepted' && (
                  <div>
                    <label className={labelCls}>Confirmed Attending Seats</label>
                    <div className="flex items-center gap-3 mt-1">
                      <input
                        type="number"
                        min="1"
                        max={editMaxSeats}
                        value={editAttendingCount}
                        onChange={(e) =>
                          setEditAttendingCount(
                            Math.min(editMaxSeats, Math.max(1, Number(e.target.value)))
                          )
                        }
                        className={`w-24 rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDark
                            ? 'bg-[#12080D] border-rose-500/30 text-emerald-300'
                            : 'bg-white border-gray-300 text-emerald-700'
                        }`}
                      />
                      <span className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        out of {editMaxSeats} max seats allocated
                      </span>
                    </div>
                  </div>
                )}

                {/* Wishes / Comment */}
                <div>
                  <label className={labelCls}>Wishes / Guest Comment</label>
                  <textarea
                    rows={3}
                    value={editWishText}
                    onChange={(e) => setEditWishText(e.target.value)}
                    placeholder="Enter or edit guest's blessings and comments..."
                    className={`w-full mt-1 rounded-xl border p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-[#12080D] border-rose-500/30 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Dietary Requirements */}
                <div>
                  <label className={labelCls}>Dietary / Special Notes</label>
                  <input
                    type="text"
                    value={editDietaryNote}
                    onChange={(e) => setEditDietaryNote(e.target.value)}
                    placeholder="e.g. Vegetarian, Halal, Allergen note"
                    className={`w-full mt-1 rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-[#12080D] border-rose-500/30 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Modal Action Buttons */}
                <div className="flex justify-end gap-2.5 pt-3 border-t border-rose-900/20">
                  <button
                    type="button"
                    onClick={() => setEditingGuest(null)}
                    className={`rounded-xl border px-4 py-2 font-semibold transition cursor-pointer ${
                      isDark
                        ? 'border-rose-900/40 bg-[#24151C] text-rose-200 hover:bg-[#301B25]'
                        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="rounded-xl bg-[#C87D55] px-5 py-2 font-semibold text-white hover:bg-[#8C4729] cursor-pointer transition shadow-md"
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL DIALOGS (LOGOUT, DELETE GUEST, DELETE PHOTO, NOTICE)
        ======================================================== */}

        {/* 1. Logout Confirmation Dialog */}
        <ModalDialog
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleConfirmLogout}
          title="Sign Out of Portal"
          description={`Are you sure you want to sign out, ${currentUser.name}? You will need your organizer passcode or OTP to access the dashboard again.`}
          confirmText="Yes, Sign Out"
          cancelText="Stay Signed In"
          variant="logout"
          theme={theme}
        />

        {/* 2. Delete Guest Confirmation Dialog */}
        <ModalDialog
          isOpen={!!guestToDelete}
          onClose={() => setGuestToDelete(null)}
          onConfirm={handleConfirmDeleteGuest}
          isLoading={isDeletingGuest}
          title="Delete Guest Invitation"
          description={
            guestToDelete ? (
              <div className="space-y-1.5">
                <p>
                  Are you sure you want to permanently remove{' '}
                  <strong className={isDark ? 'text-white' : 'text-gray-900'}>
                    "{guestToDelete.name}"
                  </strong>{' '}
                  from the database?
                </p>
                <p className={`text-[11px] ${isDark ? 'text-rose-300/70' : 'text-gray-500'}`}>
                  Invite Code: <span className="font-mono font-semibold">{guestToDelete.code}</span>. Their RSVP status, seats, and personalized link will be erased.
                </p>
              </div>
            ) : ''
          }
          confirmText="Yes, Delete Guest"
          cancelText="Cancel"
          variant="delete"
          theme={theme}
        />

        {/* 3. Delete Gallery Photo Confirmation Dialog */}
        <ModalDialog
          isOpen={photoToDeleteIndex !== null}
          onClose={() => setPhotoToDeleteIndex(null)}
          onConfirm={handleConfirmDeletePhoto}
          title="Remove Memory Photo"
          description="Are you sure you want to remove this photo from your wedding gallery memories? Don't forget to click 'Save All Settings' to apply this change."
          confirmText="Remove Photo"
          cancelText="Cancel"
          variant="delete"
          theme={theme}
        >
          {photoToDeleteIndex !== null && galleryList[photoToDeleteIndex] && (
            <div
              className={`flex items-center gap-3 rounded-2xl border p-3 mt-2 ${
                isDark ? 'border-rose-900/40 bg-[#22131A]' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <img
                src={galleryList[photoToDeleteIndex].image_url}
                alt="Preview"
                className="h-16 w-16 rounded-xl object-cover shrink-0"
              />
              <div className="text-xs overflow-hidden">
                <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {galleryList[photoToDeleteIndex].caption || 'Untitled photo'}
                </p>
                <p className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-rose-300/60' : 'text-gray-400'}`}>
                  {galleryList[photoToDeleteIndex].image_url}
                </p>
              </div>
            </div>
          )}
        </ModalDialog>

        {/* 4. Feedback / Notice Modal Dialog */}
        <ModalDialog
          isOpen={!!feedbackModal}
          onClose={() => setFeedbackModal(null)}
          onConfirm={() => setFeedbackModal(null)}
          showCancel={false}
          title={feedbackModal?.title || 'Notice'}
          description={feedbackModal?.description}
          confirmText="OK"
          variant={feedbackModal?.variant || 'info'}
          theme={theme}
        />

        {/* 5. Guest Saved & WhatsApp Share Modal */}
        {createdGuestForShare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
            <div
              className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl transition ${
                isDark
                  ? 'bg-[#180E13] border border-rose-500/30 text-white shadow-[0_25px_50px_rgba(0,0,0,0.85)]'
                  : 'bg-white border border-[#C87D55]/20 text-[#2C1E1A] shadow-2xl'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold">
                    Guest Added Successfully! 💌
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-rose-200/70' : 'text-gray-500'}`}>
                    Invite code: <span className="font-mono font-semibold">{createdGuestForShare.invite_code}</span> ({createdGuestForShare.max_seats} seat{createdGuestForShare.max_seats > 1 ? 's' : ''})
                  </p>
                </div>
              </div>

              {/* Message Preview */}
              <div className="space-y-2">
                <label className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-rose-300/80' : 'text-gray-600'}`}>
                  WhatsApp Invitation Message
                </label>
                <div
                  className={`rounded-2xl p-4 text-xs font-sans whitespace-pre-line leading-relaxed border max-h-56 overflow-y-auto ${
                    isDark
                      ? 'bg-[#22131A] border-rose-900/40 text-rose-100'
                      : 'bg-emerald-50/50 border-emerald-200/80 text-gray-800'
                  }`}
                >
                  {formatWhatsAppMessage(createdGuestForShare.name, createdGuestForShare.invite_code)}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const text = formatWhatsAppMessage(createdGuestForShare.name, createdGuestForShare.invite_code);
                    navigator.clipboard.writeText(text);
                    setCopiedShareText(true);
                    setTimeout(() => setCopiedShareText(false), 2500);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    isDark
                      ? 'border-rose-900/40 bg-[#25141D] text-rose-200 hover:bg-[#341d29]'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {copiedShareText ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Invitation Text</span>
                    </>
                  )}
                </button>

                <a
                  href={getWhatsAppShareUrl(createdGuestForShare)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(formatWhatsAppMessage(createdGuestForShare.name, createdGuestForShare.invite_code)).catch(() => {});
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Share via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setCreatedGuestForShare(null)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    isDark
                      ? 'text-rose-300/80 hover:text-white'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Real-time Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 transition-all">
            <div
              className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-md ${
                toast.type === 'error'
                  ? 'border-rose-800 bg-rose-950 text-rose-200'
                  : toast.type === 'info'
                  ? isDark
                    ? 'border-rose-500/40 bg-[#1D0C14] text-rose-200 shadow-[0_10px_25px_rgba(0,0,0,0.6)]'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-md'
                  : isDark
                  ? 'border-emerald-700/60 bg-[#0C1E14] text-emerald-300 shadow-[0_10px_25px_rgba(0,0,0,0.6)]'
                  : 'border-emerald-300 bg-emerald-100 text-emerald-900 shadow-md'
              }`}
            >
              <CheckCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="ml-2 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
