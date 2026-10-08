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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-800">Pengaturan Backend</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {/* Status Badge */}
          <div
            className={`p-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>
              {isSupabaseConfigured
                ? 'Supabase Cloud Terhubung'
                : 'Mode Penyimpanan Lokal (Offline / Browser Cache)'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Supabase Anon Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {saved && (
            <p className="text-xs text-emerald-600 font-semibold text-center">
              ✅ Pengaturan berhasil disimpan!
            </p>
          )}

          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
};
