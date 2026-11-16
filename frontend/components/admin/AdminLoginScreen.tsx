'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Send,
  AlertCircle,
  CheckCircle2,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AdminUser, AUTHORIZED_ADMINS } from '@/lib/admin-auth';
import ThemeToggle from './ThemeToggle';

interface AdminLoginScreenProps {
  onLoginSuccess: (user: AdminUser) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function AdminLoginScreen({
  onLoginSuccess,
  theme: propTheme,
  onToggleTheme,
}: AdminLoginScreenProps) {
  const [internalTheme, setInternalTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('wedding_admin_theme') as 'light' | 'dark' | null;
    if (saved === 'dark' || saved === 'light') {
      setInternalTheme(saved);
    }
  }, []);

  const activeTheme = propTheme || internalTheme;
  const isDark = activeTheme === 'dark';

  const handleToggle = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      const next = isDark ? 'light' : 'dark';
      setInternalTheme(next);
      localStorage.setItem('wedding_admin_theme', next);
    }
  };

  const [email, setEmail] = useState('supunhasaranga5@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Quick select admin
  const handleSelectAdmin = (adminEmail: string) => {
    setEmail(adminEmail);
    setError(null);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      localStorage.setItem('wedding_admin_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_otp',
          email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send login code');
      }

      setOtpSent(true);
      setStatusMessage(data.message || `Verification code sent to ${email}`);
    } catch (err: any) {
      setError(err.message || 'Error sending login code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          email,
          token: otpToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      localStorage.setItem('wedding_admin_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Code verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 relative transition-colors duration-300 ${
        isDark ? 'bg-[#0D0709] text-[#FFF1F2]' : 'bg-[#FAF6F0] text-[#2C1E1A]'
      }`}
    >
      {/* Top Bar with Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle theme={activeTheme} onToggle={handleToggle} />
      </div>

      {/* Decorative background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
            isDark ? 'bg-rose-600/10' : 'bg-[#C87D55]/10'
          }`}
        />
        <div
          className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
            isDark ? 'bg-rose-950/30' : 'bg-[#8C4729]/10'
          }`}
        />
      </div>

      <div
        className={`relative w-full max-w-md backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 transition-all duration-300 ${
          isDark
            ? 'bg-[#180E13]/95 border border-rose-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-white'
            : 'bg-white/95 border border-[#C87D55]/20 shadow-xl text-[#2C1E1A]'
        }`}
      >
        {/* Brand / Header */}
        <div className="text-center space-y-2 mb-6">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold border transition ${
              isDark
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                : 'bg-[#FAF6F0] text-[#C87D55] border-[#C87D55]/20'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Wedding Organizer Access</span>
          </div>

          <h1
            className={`font-serif text-2xl sm:text-3xl font-bold tracking-tight transition ${
              isDark ? 'text-white' : 'text-[#2C1E1A]'
            }`}
          >
            Winod & Nimnadee
          </h1>
          <p
            className={`font-serif text-xs italic transition ${
              isDark ? 'text-rose-300' : 'text-[#8C4729]'
            }`}
          >
            විනෝද් සහ නිම්නාදී විවාහ මංගල්‍යය
          </p>
          <p
            className={`text-xs pt-1 transition ${
              isDark ? 'text-rose-200/70' : 'text-gray-500'
            }`}
          >
            Sign in to manage guests, RSVPs, and invitation settings.
          </p>
        </div>

        {/* Quick select admin profiles */}
        <div className="space-y-2 mb-6">
          <label
            className={`block text-[11px] font-bold uppercase tracking-wider text-center transition ${
              isDark ? 'text-rose-300/80' : 'text-gray-500'
            }`}
          >
            Authorized Organizers
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(AUTHORIZED_ADMINS).map((admin) => {
              const isSelected = email.toLowerCase() === admin.email.toLowerCase();
              const isGroom = admin.email.includes('supun');
              return (
                <button
                  key={admin.email}
                  type="button"
                  onClick={() => handleSelectAdmin(admin.email)}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl border transition text-xs cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'border-rose-500 bg-rose-950/60 text-white shadow-xs ring-1 ring-rose-500'
                        : 'border-[#C87D55] bg-[#FAF6F0] text-[#2C1E1A] shadow-xs ring-1 ring-[#C87D55]'
                      : isDark
                      ? 'border-rose-900/30 bg-[#22131B]/70 text-rose-200/80 hover:bg-[#2A1822]'
                      : 'border-gray-200 bg-white/60 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${
                      isSelected
                        ? isDark
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#C87D55] text-white'
                        : isDark
                        ? 'bg-rose-950/80 text-rose-300'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isGroom ? '🤵' : '👰'}
                  </div>
                  <span className="font-semibold truncate w-full">{admin.name.split(' ')[0]}</span>
                  <span
                    className={`text-[10px] truncate w-full ${
                      isDark ? 'text-rose-300/50' : 'text-gray-400'
                    }`}
                  >
                    {admin.email.split('@')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auth Method Switcher Tabs */}
        <div
          className={`flex border-b mb-6 text-xs font-semibold transition ${
            isDark ? 'border-rose-900/40' : 'border-gray-200'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password');
              setError(null);
            }}
            className={`flex-1 pb-2.5 text-center transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === 'password'
                ? isDark
                  ? 'border-rose-500 text-rose-300 font-bold'
                  : 'border-[#C87D55] text-[#C87D55] font-bold'
                : isDark
                ? 'border-transparent text-rose-200/50 hover:text-rose-100'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Password / Passkey</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('otp');
              setError(null);
            }}
            className={`flex-1 pb-2.5 text-center transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === 'otp'
                ? isDark
                  ? 'border-rose-500 text-rose-300 font-bold'
                  : 'border-[#C87D55] text-[#C87D55] font-bold'
                : isDark
                ? 'border-transparent text-rose-200/50 hover:text-rose-100'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Email OTP / Supabase</span>
          </button>
        </div>

        {/* Notifications / Alerts */}
        {error && (
          <div
            className={`mb-4 flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
              isDark
                ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div
            className={`mb-4 flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
              isDark
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Form 1: Password / Passkey Login */}
        {loginMethod === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isDark ? 'text-rose-200/90' : 'text-gray-700'
                }`}
              >
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className={`w-full rounded-xl border px-3.5 py-2.5 pl-9 text-sm font-medium transition focus:outline-none shadow-xs ${
                    isDark
                      ? 'border-rose-900/50 bg-[#22131A] text-white placeholder:text-rose-200/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-gray-300 bg-white text-[#2C1E1A] placeholder:text-gray-400 focus:border-[#C87D55] focus:ring-1 focus:ring-[#C87D55]'
                  }`}
                />
                <Mail
                  className={`h-4 w-4 absolute left-3 top-3 ${
                    isDark ? 'text-rose-400' : 'text-gray-400'
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isDark ? 'text-rose-200/90' : 'text-gray-700'
                }`}
              >
                Admin Password / Passkey
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter wedding admin password"
                  className={`w-full rounded-xl border px-3.5 py-2.5 pl-9 pr-10 text-sm font-medium transition focus:outline-none shadow-xs ${
                    isDark
                      ? 'border-rose-900/50 bg-[#22131A] text-white placeholder:text-rose-200/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-gray-300 bg-white text-[#2C1E1A] placeholder:text-gray-400 focus:border-[#C87D55] focus:ring-1 focus:ring-[#C87D55]'
                  }`}
                />
                <Lock
                  className={`h-4 w-4 absolute left-3 top-3 ${
                    isDark ? 'text-rose-400' : 'text-gray-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3 cursor-pointer transition ${
                    isDark ? 'text-rose-300/70 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white shadow-md transition disabled:opacity-60 cursor-pointer ${
                isDark
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-950/50'
                  : 'bg-[#C87D55] hover:bg-[#8C4729]'
              }`}
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Form 2: Email OTP / Magic Link */}
        {loginMethod === 'otp' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isDark ? 'text-rose-200/90' : 'text-gray-700'
                    }`}
                  >
                    Send Login Code to Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@gmail.com"
                      className={`w-full rounded-xl border px-3.5 py-2.5 pl-9 text-sm font-medium transition focus:outline-none shadow-xs ${
                        isDark
                          ? 'border-rose-900/50 bg-[#22131A] text-white placeholder:text-rose-200/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-gray-300 bg-white text-[#2C1E1A] placeholder:text-gray-400 focus:border-[#C87D55] focus:ring-1 focus:ring-[#C87D55]'
                      }`}
                    />
                    <Mail
                      className={`h-4 w-4 absolute left-3 top-3 ${
                        isDark ? 'text-rose-400' : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <p
                    className={`text-[11px] mt-1 ${
                      isDark ? 'text-rose-300/60' : 'text-gray-500'
                    }`}
                  >
                    Supabase will dispatch an email with a 6-digit one-time code to your Gmail inbox.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white shadow-md transition disabled:opacity-60 cursor-pointer ${
                    isDark
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600'
                      : 'bg-[#C87D55] hover:bg-[#8C4729]'
                  }`}
                >
                  {loading ? (
                    <span>Sending code...</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Login Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isDark ? 'text-rose-200/90' : 'text-gray-700'
                    }`}
                  >
                    Enter 6-Digit Email Code
                  </label>
                  <input
                    type="text"
                    required
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    placeholder="123456"
                    className={`w-full text-center tracking-widest font-mono text-base font-bold rounded-xl border px-3.5 py-2.5 transition focus:outline-none shadow-xs ${
                      isDark
                        ? 'border-rose-900/50 bg-[#22131A] text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-gray-300 bg-white text-[#2C1E1A] focus:border-[#C87D55] focus:ring-1 focus:ring-[#C87D55]'
                    }`}
                  />
                  <div
                    className={`flex justify-between items-center text-[11px] mt-1 ${
                      isDark ? 'text-rose-300/50' : 'text-gray-400'
                    }`}
                  >
                    <span>Sent to {email}</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className={`hover:underline cursor-pointer ${
                        isDark ? 'text-rose-400' : 'text-[#C87D55]'
                      }`}
                    >
                      Change email
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white shadow-md transition disabled:opacity-60 cursor-pointer ${
                    isDark
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600'
                      : 'bg-[#C87D55] hover:bg-[#8C4729]'
                  }`}
                >
                  {loading ? <span>Verifying...</span> : <span>Confirm & Enter Dashboard</span>}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Security Footer Notice */}
        <div
          className={`mt-6 pt-4 border-t flex items-center justify-center gap-2 text-[11px] text-center transition ${
            isDark ? 'border-rose-900/30 text-rose-300/50' : 'border-gray-100 text-gray-400'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Restricted to Supun & Virajani via Supabase Security</span>
        </div>
      </div>
    </div>
  );
}
