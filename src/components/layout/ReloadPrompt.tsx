import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, CheckCircle2, X } from 'lucide-react';

export const ReloadPrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (r) {
        // Periodic check for new service worker every 15 minutes
        setInterval(() => {
          r.update();
        }, 15 * 60 * 1000);

        // Immediate check when window regains focus or tab becomes visible
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            r.update();
          }
        });
      }
    },
    onRegisterError(error) {
      console.warn('SW registration info:', error);
    },
  });

  // When a new version is detected, automatically apply update
  useEffect(() => {
    if (needRefresh) {
      // Auto-update immediately so the app is always on the latest version
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#101114] dark:bg-[#16171f] text-white px-4 py-3 rounded-[14px] shadow-2xl border border-white/15 flex items-center gap-3 max-w-sm">
        {needRefresh ? (
          <>
            <RefreshCw className="w-4 h-4 text-[#3cffd0] animate-spin shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Memperbarui Aplikasi...</p>
              <p className="text-white/70 text-[11px]">Versi terbaru sedang dimuat otomatis.</p>
            </div>
            <button
              onClick={() => updateServiceWorker(true)}
              className="ml-auto px-2.5 py-1 bg-[#7132f5] hover:bg-[#5741d8] text-white text-[11px] font-bold rounded-lg transition-colors"
            >
              Segarkan
            </button>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-[#149e61] shrink-0" />
            <span className="text-xs text-white/90">Aplikasi siap digunakan offline</span>
            <button
              onClick={close}
              className="ml-auto text-white/50 hover:text-white p-1"
              aria-label="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
