"use client";
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, Trash2, AlertTriangle, CheckCircle, Info, MessageSquare } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Variant = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
}

interface AlertOptions {
  title?: string;
  message: string;
  variant?: Variant;
  okLabel?: string;
}

interface PromptOptions {
  title?: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  alert: (opts: AlertOptions) => Promise<void>;
  prompt: (opts: PromptOptions) => Promise<string | null>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within a DialogProvider');
  return ctx;
}

// ── Variant Config ────────────────────────────────────────────────────────────

function getVariantConfig(variant: Variant = 'info') {
  const configs = {
    danger: {
      Icon: Trash2,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      iconRing: 'ring-red-100',
      bar: 'bg-red-500',
      btn: 'bg-red-500 hover:bg-red-600 text-white',
    },
    warning: {
      Icon: AlertTriangle,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      iconRing: 'ring-amber-100',
      bar: 'bg-amber-500',
      btn: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
    success: {
      Icon: CheckCircle,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
      iconRing: 'ring-green-100',
      bar: 'bg-green-500',
      btn: 'bg-green-500 hover:bg-green-600 text-white',
    },
    info: {
      Icon: Info,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      iconRing: 'ring-blue-100',
      bar: 'bg-blue-500',
      btn: 'bg-[#1D1A39] hover:bg-[#2d2950] text-white',
    },
  };
  return configs[variant];
}

// ── Modal Shell ───────────────────────────────────────────────────────────────

function ModalShell({
  open,
  onClose,
  variant = 'info',
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  const cfg = getVariantConfig(variant);
  const { Icon } = cfg;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'dialogIn 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
      >
        {/* Colour bar */}
        <div className={`h-1 w-full ${cfg.bar}`} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl ${cfg.iconBg} ring-4 ${cfg.iconRing} flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${cfg.iconColor}`} />
          </div>

          {/* Title */}
          {title && (
            <h3 className="text-lg font-bold text-[#1D1A39] mb-1 font-display">{title}</h3>
          )}

          {children}
        </div>
      </div>

      <style jsx global>{`
        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.9) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Dialog State Types ────────────────────────────────────────────────────────

type DialogState =
  | { type: 'confirm'; opts: ConfirmOptions; resolve: (v: boolean) => void }
  | { type: 'alert';   opts: AlertOptions;   resolve: () => void }
  | { type: 'prompt';  opts: PromptOptions;  resolve: (v: string | null) => void }
  | null;

// ── Provider ──────────────────────────────────────────────────────────────────

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [promptValue, setPromptValue] = useState('');

  const close = useCallback(() => setDialog(null), []);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({ type: 'confirm', opts, resolve });
    });
  }, []);

  const alert = useCallback((opts: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setDialog({ type: 'alert', opts, resolve });
    });
  }, []);

  const prompt = useCallback((opts: PromptOptions): Promise<string | null> => {
    setPromptValue(opts.defaultValue || '');
    return new Promise((resolve) => {
      setDialog({ type: 'prompt', opts, resolve });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ confirm, alert, prompt }}>
      {children}

      {/* ── CONFIRM MODAL ── */}
      {dialog?.type === 'confirm' && (() => {
        const { opts, resolve } = dialog;
        const cfg = getVariantConfig(opts.variant || 'danger');
        return (
          <ModalShell
            open={true}
            onClose={() => { resolve(false); close(); }}
            variant={opts.variant || 'danger'}
            title={opts.title}
          >
            <p className="text-gray-500 text-sm leading-relaxed mb-6">{opts.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { resolve(false); close(); }}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                {opts.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => { resolve(true); close(); }}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 ${cfg.btn}`}
              >
                {opts.confirmLabel || 'Confirm'}
              </button>
            </div>
          </ModalShell>
        );
      })()}

      {/* ── ALERT MODAL ── */}
      {dialog?.type === 'alert' && (() => {
        const { opts, resolve } = dialog;
        const cfg = getVariantConfig(opts.variant || 'info');
        return (
          <ModalShell
            open={true}
            onClose={() => { resolve(); close(); }}
            variant={opts.variant || 'info'}
            title={opts.title}
          >
            <p className="text-gray-500 text-sm leading-relaxed mb-6">{opts.message}</p>
            <div className="flex justify-end">
              <button
                onClick={() => { resolve(); close(); }}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 ${cfg.btn}`}
              >
                {opts.okLabel || 'OK'}
              </button>
            </div>
          </ModalShell>
        );
      })()}

      {/* ── PROMPT MODAL ── */}
      {dialog?.type === 'prompt' && (() => {
        const { opts, resolve } = dialog;
        return (
          <ModalShell
            open={true}
            onClose={() => { resolve(null); close(); }}
            variant="info"
            title={opts.title}
          >
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{opts.message}</p>
            <input
              autoFocus
              type="text"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { resolve(promptValue); close(); }
              }}
              placeholder={opts.placeholder || ''}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1D1A39] focus:outline-none focus:ring-2 focus:ring-[#F59F59]/40 focus:border-[#F59F59] mb-5 font-medium"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { resolve(null); close(); }}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                {opts.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => { resolve(promptValue); close(); }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#1D1A39] hover:bg-[#2d2950] text-white transition-all hover:opacity-90 active:scale-95"
              >
                {opts.confirmLabel || 'Submit'}
              </button>
            </div>
          </ModalShell>
        );
      })()}
    </DialogContext.Provider>
  );
}
