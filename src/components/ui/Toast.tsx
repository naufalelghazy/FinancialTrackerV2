import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, RotateCcw, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  subtitle?: string;
  /** default 4500ms; errors stay longer so they can actually be read */
  duration?: number;
  variant?: ToastVariant;
  onUndo?: () => void;
}

interface ToastProps {
  toast: ToastItem | null;
  onClose: () => void;
}

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: React.FC<{ className?: string }>; iconWrap: string; bar: string }
> = {
  success: {
    icon: CheckCircle2,
    iconWrap: 'bg-[#149e61]/20 text-[#10b981]',
    bar: 'bg-[#10b981]',
  },
  error: {
    icon: AlertTriangle,
    iconWrap: 'bg-[#e53e3e]/20 text-[#f87171]',
    bar: 'bg-[#f87171]',
  },
  info: {
    icon: Info,
    iconWrap: 'bg-brand-soft text-[#a78bfa]',
    bar: 'bg-[#a78bfa]',
  },
};

const ToastContent: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const variant = toast.variant || 'success';
  const style = VARIANT_STYLES[variant];
  const Icon = style.icon;
  const [progress, setProgress] = useState(100);

  const duration = toast.duration || (variant === 'error' ? 7000 : 4500);

  useEffect(() => {
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, intervalTime);

    const closeTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      role="status"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-6 z-50 sm:max-w-sm w-auto animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="bg-[#101114] text-white dark:bg-[#1f222e] dark:text-[#f3f4f8] rounded-[14px] p-3.5 shadow-2xl border border-white/10 dark:border-white/15 overflow-hidden relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${style.iconWrap}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate tracking-tight">{toast.title}</p>
              {toast.subtitle && (
                <p className="text-[11px] text-white/70 dark:text-[#9ca0ba] line-clamp-2 mt-0.5">
                  {toast.subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {toast.onUndo && (
              <button
                type="button"
                onClick={() => {
                  toast.onUndo?.();
                  onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-semibold text-white transition-all"
                title="Batalkan transaksi ini"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Urungkan</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-[8px] text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            className={`h-full transition-all duration-75 ease-linear ${style.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;
  return <ToastContent key={toast.id} toast={toast} onClose={onClose} />;
};
