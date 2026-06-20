"use client";
import React, { useEffect } from 'react';
import { AlertTriangle, X, Trash2, CheckCircle, Info } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const iconMap = {
    danger: { Icon: Trash2, bg: 'bg-red-50', ring: 'ring-red-100', color: 'text-red-500', btn: 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' },
    warning: { Icon: AlertTriangle, bg: 'bg-amber-50', ring: 'ring-amber-100', color: 'text-amber-500', btn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' },
    info: { Icon: Info, bg: 'bg-blue-50', ring: 'ring-blue-100', color: 'text-blue-500', btn: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200' },
  };

  const cfg = iconMap[variant];
  const { Icon } = cfg;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeInUp_0.2s_ease-out]">
        {/* Top accent bar */}
        <div className={`h-1 w-full ${variant === 'danger' ? 'bg-red-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl ${cfg.bg} ring-4 ${cfg.ring} flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${cfg.color}`} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-[#1D1A39] mb-2 font-display">
            {title || (variant === 'danger' ? 'Confirm Delete' : variant === 'warning' ? 'Are you sure?' : 'Confirm Action')}
          </h3>

          {/* Message */}
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-opacity-30 transition-all hover:scale-105 active:scale-95 ${cfg.btn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
