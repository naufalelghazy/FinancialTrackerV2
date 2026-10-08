import React, { useState } from 'react';
import { X, Database, CheckCircle2, ShieldAlert } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [supabaseUrl, setSupabaseUrl] = useState(
    () => localStorage.getItem('custom_supabase_url') || ''
  );
  const [supabaseKey, setSupabaseKey] = useState(
    () => localStorage.getItem('custom_supabase_key') || ''
  );
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('custom_supabase_url', supabaseUrl);
    localStorage.setItem('custom_supabase_key', supabaseKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-[16px] w-full max-w-sm overflow-hidden shadow-whisper border border-[#dedee5]">
        <div className="flex items-center justify-between p-4 border-b border-[#dedee5]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#855bfb]/15 flex items-center justify-center text-[#7132f5]">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base text-[#101114] tracking-[-0.5px]">
              Pengaturan Backend
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#686b82] hover:text-[#101114] hover:bg-[#edeef3]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {/* Status Badge */}
          <div
            className={`p-3 rounded-[10px] flex items-center gap-2.5 text-xs font-semibold ${
              isSupabaseConfigured
                ? 'bg-[#149e61]/15 text-[#026b3f] border border-[#149e61]/30'
                : 'bg-[#edeef3] text-[#686b82] border border-[#dedee5]'
            }`}
          >
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-[#149e61] shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-[#686b82] shrink-0" />
            )}
            <span>
              {isSupabaseConfigured
                ? 'Supabase Cloud Terhubung'
                : 'Mode Penyimpanan Lokal (Offline / Browser Cache)'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] block mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-xs font-mono outline-none focus:border-[#7132f5]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] block mb-1">
                Supabase Anon Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-3 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-xs font-mono outline-none focus:border-[#7132f5]"
              />
            </div>
          </div>

          {saved && (
            <p className="text-xs text-[#026b3f] font-semibold text-center">
              ✅ Pengaturan berhasil disimpan!
            </p>
          )}

          <button
            onClick={handleSave}
            className="w-full btn-kraken-primary text-sm shadow-whisper"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
};
