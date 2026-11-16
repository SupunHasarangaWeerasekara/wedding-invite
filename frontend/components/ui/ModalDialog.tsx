'use client';

import React, { useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  LogOut,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';

export type DialogVariant = 'danger' | 'warning' | 'info' | 'success' | 'logout' | 'delete';

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  theme?: 'light' | 'dark';
  isLoading?: boolean;
  children?: React.ReactNode;
  showCancel?: boolean;
}

export default function ModalDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  theme = 'light',
  isLoading = false,
  children,
  showCancel = true,
}: ModalDialogProps) {
  const isDark = theme === 'dark';

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Icon selector based on variant
  const renderIcon = () => {
    switch (variant) {
      case 'danger':
      case 'delete':
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
            <Trash2 className="h-6 w-6" />
          </div>
        );
      case 'logout':
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
            <LogOut className="h-6 w-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
        );
      case 'success':
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500">
            <Info className="h-6 w-6" />
          </div>
        );
    }
  };

  // Button style based on variant
  const getConfirmBtnClasses = () => {
    switch (variant) {
      case 'danger':
      case 'delete':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/20';
      case 'logout':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-950/20';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/20';
      case 'info':
      default:
        return 'bg-[#C87D55] hover:bg-[#8C4729] text-white shadow-[#C87D55]/20';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs transition-opacity duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Dialog Card */}
      <div
        className={`relative z-10 w-full max-w-md transform overflow-hidden rounded-3xl p-6 shadow-2xl transition-all sm:p-7 ${
          isDark
            ? 'border border-rose-500/25 bg-[#180E13] text-white shadow-[0_25px_50px_rgba(0,0,0,0.8)]'
            : 'border border-gray-200 bg-white text-[#2C1E1A] shadow-2xl'
        }`}
      >
        {/* Close 'X' Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          title="Close dialog"
          className={`absolute top-4 right-4 rounded-xl p-1.5 transition cursor-pointer ${
            isDark
              ? 'text-rose-200/50 hover:bg-[#25141D] hover:text-white'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with Icon and Title */}
        <div className="flex items-start gap-4">
          {renderIcon()}
          <div className="flex-1 pt-1">
            <h3
              className={`font-serif text-lg font-bold sm:text-xl ${
                isDark ? 'text-white' : 'text-[#2C1E1A]'
              }`}
            >
              {title}
            </h3>
            {description && (
              <div
                className={`mt-1.5 text-xs leading-relaxed ${
                  isDark ? 'text-rose-200/75' : 'text-gray-600'
                }`}
              >
                {description}
              </div>
            )}
          </div>
        </div>

        {/* Optional Custom Children */}
        {children && <div className="mt-4">{children}</div>}

        {/* Actions Footer */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
          {showCancel && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                isDark
                  ? 'border-rose-900/40 bg-[#24151C] text-rose-200 hover:bg-[#301B25] hover:text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cancelText}
            </button>
          )}

          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer ${getConfirmBtnClasses()}`}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{confirmText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
