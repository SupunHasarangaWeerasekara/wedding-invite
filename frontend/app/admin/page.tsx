'use client';

import React, { useState, useEffect } from 'react';
import { Guest, WeddingEvent, GalleryPhoto } from '@/lib/types';
import {
  Users,
  CheckCircle2,
  XCircle,
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
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'guests' | 'settings'>('guests');

  // Guest list state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New guest modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMaxSeats, setNewMaxSeats] = useState(2);
  const [newPhone, setNewPhone] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Event Settings state
  const [eventSettings, setEventSettings] = useState<WeddingEvent | null>(null);
  const [galleryList, setGalleryList] = useState<GalleryPhoto[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/guests');
      const data = await res.json();
      if (data.guests) {
        setGuests(data.guests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    fetchGuests();
    fetchEventSettings();
  }, []);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    setIsAdding(true);
    try {
      const res = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          max_seats: newMaxSeats,
          phone_number: newPhone,
        }),
      });

      const data = await res.json();
      if (res.ok && data.guest) {
        setGuests([data.guest, ...guests]);
        setShowAddModal(false);
        setNewName('');
        setNewMaxSeats(2);
        setNewPhone('');
      } else {
        alert(data.error || 'Failed to add guest');
      }
    } catch (err) {
      alert('Error creating guest');
    } finally {
      setIsAdding(false);
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
        alert(data.error || 'Failed to save settings');
      }
    } catch (err) {
      alert('Error saving settings');
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

  const getWhatsAppShareUrl = (guest: Guest) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteUrl = `${origin}/invite/${guest.invite_code}`;
    const coupleName = eventSettings?.couple_names || 'Sanjaya & Gagani';
    const coupleNameSi = eventSettings?.couple_names_si || 'සංජය සහ ගගනි';
    const venue = eventSettings?.venue_name || 'Shangri-La Colombo';
    const text = `Dear ${guest.name},\n\nWe cordially invite you to celebrate our wedding ceremony on December 18, 2026 at ${venue}.\n\nPlease open your personalized digital invitation and RSVP here:\n${inviteUrl}\n\nWith love,\n${coupleName} (${coupleNameSi})`;
    return `https://wa.me/${guest.phone_number ? guest.phone_number.replace(/\D/g, '') : ''}?text=${encodeURIComponent(text)}`;
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

  const handleRemoveGalleryPhoto = (idx: number) => {
    const updated = galleryList.filter((_, i) => i !== idx);
    setGalleryList(updated);
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

  return (
    <div className="min-h-screen bg-[#FAF6F0] p-4 text-[#2C1E1A] md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[#C87D55]/20 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C87D55]">
              <Sparkles className="h-4 w-4" />
              <span>Couple Management Portal</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1E1A] md:text-4xl">
              {eventSettings?.couple_names || 'Sanjaya & Gagani'} Wedding Portal
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Customize your wedding invitation page, manage guest RSVPs, and share personalized invitations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/invite/VIP-KASUN7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition"
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
        <div className="my-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('guests')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'guests'
                ? 'border-[#C87D55] text-[#C87D55]'
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
                ? 'border-[#C87D55] text-[#C87D55]'
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
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-gray-500">
                  <span className="text-xs font-medium uppercase">Total Invitations</span>
                  <Users className="h-4 w-4 text-gray-400" />
                </div>
                <p className="mt-2 font-serif text-3xl font-bold text-[#2C1E1A]">{totalInvited}</p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="text-xs font-medium uppercase">Accepted (Seats)</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-2 font-serif text-3xl font-bold text-emerald-800">
                  {accepted.length}{' '}
                  <span className="text-sm font-sans font-normal text-emerald-600">
                    ({totalAttendingSeats} seats)
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
                <div className="flex items-center justify-between text-amber-700">
                  <span className="text-xs font-medium uppercase">Pending</span>
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <p className="mt-2 font-serif text-3xl font-bold text-amber-800">{pending.length}</p>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 shadow-sm">
                <div className="flex items-center justify-between text-rose-700">
                  <span className="text-xs font-medium uppercase">Declined</span>
                  <XCircle className="h-4 w-4 text-rose-600" />
                </div>
                <p className="mt-2 font-serif text-3xl font-bold text-rose-800">{declined.length}</p>
              </div>
            </div>

            {/* Guest Search */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or invite code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-4 text-xs focus:border-[#C87D55] focus:outline-none"
                />
              </div>
            </div>

            {/* Guests Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6F0] border-b border-gray-200 text-gray-600 uppercase font-semibold">
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
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          Loading guest list...
                        </td>
                      </tr>
                    ) : filteredGuests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          No guests found. Click "Add New Guest" to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredGuests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-gray-50/80 transition">
                          <td className="p-3.5 font-medium text-[#2C1E1A]">
                            <div>{guest.name}</div>
                            {guest.phone_number && (
                              <div className="text-[11px] text-gray-400">{guest.phone_number}</div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono rounded bg-gray-100 px-2 py-0.5 text-gray-800">
                              {guest.invite_code}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-600">{guest.max_seats}</td>
                          <td className="p-3.5">
                            {guest.rsvp_status === 'accepted' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800">
                                Accepted
                              </span>
                            )}
                            {guest.rsvp_status === 'declined' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 font-semibold text-rose-800">
                                Declined
                              </span>
                            )}
                            {guest.rsvp_status === 'pending' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-semibold">
                            {guest.rsvp_status === 'accepted' ? `${guest.attending_count} seats` : '-'}
                          </td>
                          <td className="p-3.5 max-w-xs truncate text-gray-500">
                            {guest.wish_text ? (
                              <span title={guest.wish_text}>💌 "{guest.wish_text}"</span>
                            ) : guest.dietary_note ? (
                              <span>🥗 {guest.dietary_note}</span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            {/* Copy Link */}
                            <button
                              onClick={() => copyInviteLink(guest.invite_code)}
                              title="Copy Link"
                              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100"
                            >
                              {copiedCode === guest.invite_code ? (
                                <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {/* WhatsApp Invite */}
                            <a
                              href={getWhatsAppShareUrl(guest)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Send via WhatsApp"
                              className="inline-flex items-center justify-center rounded-lg border border-emerald-500 bg-emerald-500 p-2 text-white hover:bg-emerald-600"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>

                            {/* Preview */}
                            <a
                              href={`/invite/${guest.invite_code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Preview Invitation"
                              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </td>
                        </tr>
                      ))
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
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Settings saved successfully! Changes are immediately active on all live invitation links.</span>
              </div>
            )}

            {/* 1. Couple Names & Language */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-bold text-[#2C1E1A]">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Couple Names & Sinhala Typography</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Couple Names (English)
                  </label>
                  <input
                    type="text"
                    value={eventSettings.couple_names}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, couple_names: e.target.value })
                    }
                    placeholder="e.g. Sanjaya & Gagani"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-400">Displayed in main headings and metadata.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Couple Names (සිංහලෙන් - Sinhala)
                  </label>
                  <input
                    type="text"
                    value={eventSettings.couple_names_si || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, couple_names_si: e.target.value })
                    }
                    placeholder="e.g. සංජය සහ ගගනි"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none font-sinhala"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">Displayed in Abhaya Libre serif script on invitation badges.</p>
                </div>
              </div>
            </div>

            {/* 2. Typography & Fonts Settings */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-bold text-[#2C1E1A]">
                <Type className="h-4 w-4 text-blue-500" />
                <span>Font & Size Settings</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Heading Font Style
                  </label>
                  <select
                    value={eventSettings.font_family || 'Playfair Display'}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, font_family: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  >
                    <option value="Playfair Display">Playfair Display (Romantic Editorial Serif)</option>
                    <option value="Cormorant Garamond">Cormorant Garamond (Classic Luxury)</option>
                    <option value="Bodoni Moda">Bodoni Moda (High-Contrast Vogue Serif)</option>
                    <option value="Serif">Traditional Serif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">
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
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  >
                    <option value="normal">Normal (Standard balanced sizing)</option>
                    <option value="large">Large (+15% larger typography for readability)</option>
                    <option value="extra-large">Extra Large (+30% bold prominent typography)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Page Images Customization */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-bold text-[#2C1E1A]">
                <ImageIcon className="h-4 w-4 text-purple-500" />
                <span>Page Images & Couple Photos</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Hero Photo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Hero Cover Photo URL
                  </label>
                  <input
                    type="url"
                    value={eventSettings.hero_image_url || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, hero_image_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                  {eventSettings.hero_image_url && (
                    <div className="mt-2 h-20 w-32 overflow-hidden rounded-lg border border-gray-200">
                      <img src={eventSettings.hero_image_url} alt="Hero" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Circle Avatar */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Couple Circle Portrait URL
                  </label>
                  <input
                    type="url"
                    value={eventSettings.couple_avatar_url || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, couple_avatar_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                  {eventSettings.couple_avatar_url && (
                    <div className="mt-2 h-16 w-16 overflow-hidden rounded-full border-2 border-rose-400">
                      <img src={eventSettings.couple_avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Groom Photo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Groom Photo URL (Sanjaya)
                  </label>
                  <input
                    type="url"
                    value={eventSettings.groom_image_url || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, groom_image_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                  {eventSettings.groom_image_url && (
                    <div className="mt-2 h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                      <img src={eventSettings.groom_image_url} alt="Groom" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Bride Photo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Bride Photo URL (Gagani)
                  </label>
                  <input
                    type="url"
                    value={eventSettings.bride_image_url || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, bride_image_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                  {eventSettings.bride_image_url && (
                    <div className="mt-2 h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                      <img src={eventSettings.bride_image_url} alt="Bride" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Photos Manager */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-700">Gallery Memories ({galleryList.length} Photos)</span>
                  <button
                    type="button"
                    onClick={handleAddGalleryPhoto}
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {galleryList.map((photo, idx) => (
                    <div key={photo.id || idx} className="flex gap-3 rounded-xl border border-gray-200 p-3 bg-gray-50/50">
                      <img src={photo.image_url} alt={photo.caption} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="flex-1 space-y-1.5 text-xs">
                        <input
                          type="url"
                          value={photo.image_url}
                          onChange={(e) => handleUpdateGalleryPhoto(idx, 'image_url', e.target.value)}
                          placeholder="Image URL"
                          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-[11px]"
                        />
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) => handleUpdateGalleryPhoto(idx, 'caption', e.target.value)}
                          placeholder="Photo Caption"
                          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-[11px]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryPhoto(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Remove Photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Location & Venue */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-bold text-[#2C1E1A]">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>Venue & Location Settings</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Venue Name</label>
                  <input
                    type="text"
                    value={eventSettings.venue_name}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, venue_name: e.target.value })
                    }
                    placeholder="e.g. Grand Ballroom, Shangri-La Colombo"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Venue Address</label>
                  <input
                    type="text"
                    value={eventSettings.venue_address}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, venue_address: e.target.value })
                    }
                    placeholder="e.g. 1 Galle Face, Colombo 02, Sri Lanka"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Google Maps URL</label>
                  <input
                    type="url"
                    value={eventSettings.map_url}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, map_url: e.target.value })
                    }
                    placeholder="https://maps.google.com/..."
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 5. Date & Schedule */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-bold text-[#2C1E1A]">
                <Calendar className="h-4 w-4 text-amber-500" />
                <span>Date & Ceremony Schedule</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Wedding Date (ISO)</label>
                  <input
                    type="text"
                    value={eventSettings.date_iso}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, date_iso: e.target.value })
                    }
                    placeholder="2026-12-18T09:30:00+05:30"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-400">Controls the countdown timer & calendar date.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Poruwa Ceremony Time</label>
                  <input
                    type="text"
                    value={eventSettings.poruwa_time}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, poruwa_time: e.target.value })
                    }
                    placeholder="09:30 AM"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Reception Time</label>
                  <input
                    type="text"
                    value={eventSettings.reception_time}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, reception_time: e.target.value })
                    }
                    placeholder="11:45 AM"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 6. Parents & Family Lineage */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-bold text-[#2C1E1A]">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>Parents (Beloved Son Of & Beloved Daughter Of)</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Beloved Son Of (Groom's Parents)
                  </label>
                  <input
                    type="text"
                    value={eventSettings.beloved_son_of || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, beloved_son_of: e.target.value })
                    }
                    placeholder="e.g. Rathnasiri & Karunawathi"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Beloved Daughter Of (Bride's Parents)
                  </label>
                  <input
                    type="text"
                    value={eventSettings.beloved_daughter_of || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, beloved_daughter_of: e.target.value })
                    }
                    placeholder="e.g. Gamini & Madhuka"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 7. Section Titles & Custom Texts */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-bold text-[#2C1E1A]">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Custom Section Titles & Note</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Countdown Title (Until We Say "I Do")
                  </label>
                  <input
                    type="text"
                    value={eventSettings.title_countdown || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, title_countdown: e.target.value })
                    }
                    placeholder='Until We Say "I Do"'
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Calendar Section Title (Save The Date)
                  </label>
                  <input
                    type="text"
                    value={eventSettings.title_calendar || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, title_calendar: e.target.value })
                    }
                    placeholder="Save The Date"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Schedule Section Title
                  </label>
                  <input
                    type="text"
                    value={eventSettings.title_schedule || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, title_schedule: e.target.value })
                    }
                    placeholder="Schedule"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Venue Section Title
                  </label>
                  <input
                    type="text"
                    value={eventSettings.title_venue || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, title_venue: e.target.value })
                    }
                    placeholder="Venue"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Note Section Title
                  </label>
                  <input
                    type="text"
                    value={eventSettings.title_note || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, title_note: e.target.value })
                    }
                    placeholder="Note"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Note Description Text
                  </label>
                  <input
                    type="text"
                    value={eventSettings.text_note || ''}
                    onChange={(e) =>
                      setEventSettings({ ...eventSettings, text_note: e.target.value })
                    }
                    placeholder="Wedding theme: Crimson Red & Obsidian Black"
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#C87D55] focus:outline-none"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="font-serif text-xl font-bold text-[#2C1E1A]">Add New Guest</h2>
              <form onSubmit={handleAddGuest} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700">Guest Name / Family Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mr. & Mrs. Perera"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 focus:border-[#C87D55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700">Max Allowed Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newMaxSeats}
                    onChange={(e) => setNewMaxSeats(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 focus:border-[#C87D55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700">WhatsApp Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g., +94771234567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 focus:border-[#C87D55] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="rounded-xl bg-[#C87D55] px-4 py-2 font-semibold text-white hover:bg-[#8C4729]"
                  >
                    {isAdding ? 'Adding...' : 'Save Guest'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
