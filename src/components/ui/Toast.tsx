import React, { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  subtitle?: string;
  duration?: number; // default 4000ms
  onUndo?: () => void;
}

interface ToastProps {
  toast: ToastItem | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const duration = toast.duration || 4500;
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
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-6 z-50 sm:max-w-sm w-auto animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="bg-[#101114] text-white dark:bg-[#1f222e] dark:text-[#f3f4f8] rounded-[14px] p-3.5 shadow-2xl border border-white/10 dark:border-white/15 overflow-hidden relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-[10px] bg-[#149e61]/20 text-[#10b981] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate tracking-tight">{toast.title}</p>
              {toast.subtitle && (
                <p className="text-[11px] text-white/70 dark:text-[#9ca0ba] truncate mt-0.5">
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
              className="p-1.5 rounded-[8px] text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            className="h-full bg-[#10b981] transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
