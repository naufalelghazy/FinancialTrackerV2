import React, { useState, useEffect, useMemo } from 'react';
import {
  Mic,
  MicOff,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Pencil,
  ChevronDown,
} from 'lucide-react';
import type { Account, Category, QuickTemplate, Transaction, TransactionType } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { parseVoiceTransaction } from '../../services/voiceTransactionParser';
import { formatCurrency } from '../../lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';

interface VoiceTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  templates?: QuickTemplate[];
  history?: Transaction[];
  onApplyToForm: (data: {
    type: TransactionType;
    amount: number;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  }) => void;
  onDirectSave?: (data: {
    type: TransactionType;
    amount: number;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  }) => void;
}

const EXAMPLE_PHRASES = [
  'Makan siang 25 ribu pakai Cash',
  'Beli bensin 35rb Gopay',
  'Transfer dari BCA ke Gopay 100 ribu',
  'Gaji bulanan 5 juta masuk ke Mandiri',
  'Kopi kenangan 18.000 dana',
  'Indomaret 50rb',
];

export const VoiceTransactionModal: React.FC<VoiceTransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  templates = [],
  history = [],
  onApplyToForm,
  onDirectSave,
}) => {
  const [manualText, setManualText] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 1-Tap Quick Correction Overrides
  const [overrideAccountId, setOverrideAccountId] = useState<string | null>(null);
  const [overrideCategoryId, setOverrideCategoryId] = useState<string | null>(null);
  const [overrideAmount, setOverrideAmount] = useState<number | null>(null);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [isChangingAccount, setIsChangingAccount] = useState(false);
  const [isChangingCategory, setIsChangingCategory] = useState(false);

  const {
    isListening,
    fullText,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechRecognition({
    lang: 'id-ID',
    autoStopOnSilence: true,
    silenceTimeoutMs: 1800,
  });

  const activeText = manualText || fullText;

  // Auto-start listening saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setManualText('');
      setSaveSuccess(false);
      setOverrideAccountId(null);
      setOverrideCategoryId(null);
      setOverrideAmount(null);
      setIsEditingTranscript(false);
      setIsChangingAccount(false);
      setIsChangingCategory(false);
      resetTranscript();
      if (isSupported) {
        startListening();
      }
    } else {
      stopListening();
    }
  }, [isOpen, isSupported, startListening, stopListening, resetTranscript]);

  // Parsing teks suara dengan integrasi template dan riwayat
  const parsedBase = useMemo(() => {
    if (!activeText.trim()) return null;
    return parseVoiceTransaction(activeText, accounts, categories, templates, history);
  }, [activeText, accounts, categories, templates, history]);

  // Terapkan override manual 1-tap pengguna jika ada
  const parsed = useMemo(() => {
    if (!parsedBase) return null;
    return {
      ...parsedBase,
      amount: overrideAmount !== null ? overrideAmount : parsedBase.amount,
      sourceAccountId: overrideAccountId !== null ? overrideAccountId : parsedBase.sourceAccountId,
      categoryId: overrideCategoryId !== null ? overrideCategoryId : parsedBase.categoryId,
    };
  }, [parsedBase, overrideAmount, overrideAccountId, overrideCategoryId]);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setManualText('');
      setOverrideAccountId(null);
      setOverrideCategoryId(null);
      setOverrideAmount(null);
      startListening();
    }
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleReset = () => {
    resetTranscript();
    setManualText('');
    setOverrideAccountId(null);
    setOverrideCategoryId(null);
    setOverrideAmount(null);
    setIsEditingTranscript(false);
    startListening();
  };

  const handleApplyExample = (phrase: string) => {
    stopListening();
    setManualText(phrase);
    setTranscript(phrase);
    setOverrideAccountId(null);
    setOverrideCategoryId(null);
    setOverrideAmount(null);
    setIsEditingTranscript(false);
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const sourceAccount = accounts.find((a) => a.id === parsed?.sourceAccountId);
  const destinationAccount = accounts.find((a) => a.id === parsed?.destinationAccountId);
  const matchedCategory = categories.find((c) => c.id === parsed?.categoryId);

  const canDirectSave = Boolean(parsed && parsed.amount && parsed.amount > 0 && parsed.sourceAccountId);
  const canApplyToForm = Boolean(parsed && parsed.sourceAccountId);

  const handleSaveDirectly = () => {
    if (!canDirectSave || !parsed || !parsed.amount || !parsed.sourceAccountId) return;

    const payload = {
      type: parsed.type,
      amount: parsed.amount,
      sourceAccountId: parsed.sourceAccountId,
      destinationAccountId: parsed.type === 'transfer' ? parsed.destinationAccountId : undefined,
      categoryId: parsed.type !== 'transfer' ? parsed.categoryId : undefined,
      date: parsed.date,
      notes: parsed.notes,
    };

    if (onDirectSave) {
      onDirectSave(payload);
      setSaveSuccess(true);
      if (navigator.vibrate) {
        navigator.vibrate([40, 40, 40]);
      }
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } else {
      onApplyToForm(payload);
      onClose();
    }
  };

  const handleApplyToForm = () => {
    if (!canApplyToForm || !parsed || !parsed.sourceAccountId) return;

    onApplyToForm({
      type: parsed.type,
      amount: parsed.amount || 0,
      sourceAccountId: parsed.sourceAccountId,
      destinationAccountId: parsed.type === 'transfer' ? parsed.destinationAccountId : undefined,
      categoryId: parsed.type !== 'transfer' ? parsed.categoryId : undefined,
      date: parsed.date,
      notes: parsed.notes,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#16171f] rounded-[24px] border border-[#dedee5] dark:border-[#282937] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#dedee5]/70 dark:border-[#282937]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#7132f5]/10 dark:bg-[#7132f5]/20 flex items-center justify-center text-[#7132f5] dark:text-[#a78bfa]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#101114] dark:text-[#f3f4f8] leading-tight">
                Catat Transaksi dengan Suara
              </h3>
              <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
                Parser Cerdas Lokal (Template, Riwayat, & Toleransi Typo)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#686b82] hover:text-[#101114] dark:text-[#9ca0ba] dark:hover:text-white hover:bg-[#edeef3] dark:hover:bg-[#1e202b] transition-colors"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning if SpeechRecognition not supported */}
        {!isSupported && (
          <div className="p-3 rounded-[12px] bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#b45309] dark:text-[#fbbf24] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Browser belum mendukung input mic otomatis.</span> Anda tetap dapat mengetik teks atau mencoba contoh kalimat di bawah.
            </div>
          </div>
        )}

        {/* Microphone Interactive Button & Waves */}
        <div className="flex flex-col items-center justify-center py-3 space-y-2.5">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Ripple Rings when listening */}
            {isListening && (
              <>
                <span className="absolute w-24 h-24 rounded-full bg-[#7132f5]/20 dark:bg-[#3cffd0]/20 animate-ping opacity-75" />
                <span className="absolute w-20 h-20 rounded-full bg-[#7132f5]/30 dark:bg-[#3cffd0]/30 animate-pulse" />
              </>
            )}

            <button
              type="button"
              onClick={handleToggleListening}
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-90 ${
                isListening
                  ? 'btn-kraken-primary ring-4 ring-[#7132f5]/30 scale-105'
                  : 'bg-[#edeef3] dark:bg-[#1e202b] text-[#686b82] dark:text-[#9ca0ba] hover:text-[#7132f5] dark:hover:text-[#3cffd0] border border-[#dedee5] dark:border-[#282937]'
              }`}
              title={isListening ? 'Klik untuk Menghentikan' : 'Klik untuk Mulai Bicara'}
            >
              {isListening ? (
                <Mic className="w-7 h-7 stroke-[2.5]" />
              ) : (
                <MicOff className="w-7 h-7 stroke-[2]" />
              )}
            </button>
          </div>

          {/* Equalizer Visualizer Waves */}
          {isListening && (
            <div className="flex items-center gap-1 h-4">
              <span className="w-1 h-2 bg-[#7132f5] dark:bg-[#3cffd0] rounded-full animate-pulse [animation-delay:0ms]" />
              <span className="w-1 h-3.5 bg-[#7132f5] dark:bg-[#3cffd0] rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-1 h-2 bg-[#7132f5] dark:bg-[#3cffd0] rounded-full animate-pulse [animation-delay:300ms]" />
              <span className="w-1 h-4 bg-[#7132f5] dark:bg-[#3cffd0] rounded-full animate-pulse [animation-delay:75ms]" />
              <span className="w-1 h-2.5 bg-[#7132f5] dark:bg-[#3cffd0] rounded-full animate-pulse [animation-delay:225ms]" />
            </div>
          )}

          <div className="text-center">
            <span
              className={`text-xs font-bold transition-colors ${
                isListening
                  ? 'text-[#7132f5] dark:text-[#3cffd0] animate-pulse'
                  : 'text-[#686b82] dark:text-[#9ca0ba]'
              }`}
            >
              {isListening
                ? 'Sedang mendengarkan... (Otomatis berhenti saat Anda jeda bicara)'
                : activeText
                ? 'Rekaman selesai. Klik mic untuk mengulang atau koreksi di bawah'
                : 'Klik tombol mikrofon di atas lalu mulai bicara'}
            </span>
          </div>
        </div>

        {/* Transcript Box with 1-Tap Edit */}
        <div className="p-3.5 rounded-[16px] bg-[#fafbfe] dark:bg-[#12131a] border border-[#dedee5] dark:border-[#282937] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#686b82] dark:text-[#9ca0ba]">
            <span>Teks Hasil Ucapan:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                className="inline-flex items-center gap-1 text-[10px] text-[#686b82] dark:text-[#9ca0ba] hover:text-[#7132f5] dark:hover:text-[#3cffd0] transition-colors"
              >
                <Pencil className="w-3 h-3" />
                <span>{isEditingTranscript ? 'Tutup Edit' : 'Edit Teks'}</span>
              </button>
              {activeText && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-[10px] text-[#7132f5] dark:text-[#a78bfa] hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  Ulangi
                </button>
              )}
            </div>
          </div>

          {isEditingTranscript ? (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <textarea
                value={activeText}
                onChange={(e) => {
                  setManualText(e.target.value);
                  setTranscript(e.target.value);
                }}
                placeholder="Ketik atau edit ucapan di sini..."
                rows={2}
                className="w-full text-xs sm:text-sm p-2 rounded-[10px] bg-white dark:bg-[#181a24] border border-[#dedee5] dark:border-[#282937] text-[#101114] dark:text-[#f3f4f8] focus:outline-none focus:ring-1 focus:ring-[#7132f5]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingTranscript(false)}
                  className="text-[10px] font-bold text-[#7132f5] dark:text-[#3cffd0] hover:underline"
                >
                  Selesai Mengedit
                </button>
              </div>
            </div>
          ) : (
            <p
              onClick={() => setIsEditingTranscript(true)}
              title="Klik untuk mengedit teks"
              className={`text-xs sm:text-sm font-medium min-h-[38px] leading-relaxed break-words cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded transition-colors ${
                activeText
                  ? 'text-[#101114] dark:text-[#f3f4f8]'
                  : 'text-[#9497a9] dark:text-[#65697e] italic'
              }`}
            >
              {activeText || 'Contoh: "Makan siang 35 ribu pakai BCA"'}
            </p>
          )}

          {error && (
            <p className="text-[11px] text-[#e53e3e] dark:text-[#f87171] font-medium pt-1">
              {error}
            </p>
          )}
        </div>

        {/* Parsed Result Card with 1-Tap Quick Correction */}
        {parsed && (
          <div className="p-4 rounded-[16px] bg-white dark:bg-[#181a24] border-2 border-[#7132f5]/30 dark:border-[#3cffd0]/30 space-y-3 shadow-micro animate-in fade-in duration-150">
            {/* Header Result + Badges */}
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9497a9] dark:text-[#767993]">
                Hasil Deteksi Cerdas:
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  parsed.type === 'pengeluaran'
                    ? 'bg-[#e53e3e]/15 text-[#e53e3e] dark:text-[#f87171]'
                    : parsed.type === 'pemasukan'
                    ? 'bg-[#149e61]/15 text-[#026b3f] dark:text-[#34d399]'
                    : 'bg-[#7132f5]/15 text-[#7132f5] dark:text-[#a78bfa]'
                }`}
              >
                {parsed.type === 'pengeluaran' && <ArrowUpRight className="w-3 h-3" />}
                {parsed.type === 'pemasukan' && <ArrowDownLeft className="w-3 h-3" />}
                {parsed.type === 'transfer' && <ArrowLeftRight className="w-3 h-3" />}
                {parsed.type}
              </span>
            </div>

            {/* Template Match Badge */}
            {parsed.matchedTemplate && (
              <div className="flex items-center gap-1.5 p-2 rounded-[10px] bg-[#3cffd0]/10 border border-[#3cffd0]/30 text-[#026b3f] dark:text-[#3cffd0] text-xs font-bold animate-in fade-in">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  ⚡ Otomatis cocok dengan Template: <b>{parsed.matchedTemplate.emoji || '📌'} {parsed.matchedTemplate.name}</b>
                </span>
              </div>
            )}

            {/* History Prediction Badge */}
            {parsed.predictedFromHistory && !parsed.matchedTemplate && (
              <div className="flex items-center gap-1.5 p-2 rounded-[10px] bg-[#7132f5]/10 border border-[#7132f5]/20 text-[#7132f5] dark:text-[#a78bfa] text-xs font-medium animate-in fade-in">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>💡 {parsed.predictedFromHistory.reason}</span>
              </div>
            )}

            {/* Nominal Big Display */}
            <div className="flex items-baseline justify-between border-b border-[#dedee5]/70 dark:border-[#282937] pb-2.5">
              <span className="text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba]">
                Nominal:
              </span>
              <span
                className={`text-xl sm:text-2xl font-bold font-display tabular-nums ${
                  parsed.amount
                    ? parsed.type === 'pengeluaran'
                      ? 'text-[#e53e3e] dark:text-[#f87171]'
                      : parsed.type === 'pemasukan'
                      ? 'text-[#026b3f] dark:text-[#34d399]'
                      : 'text-[#101114] dark:text-[#f3f4f8]'
                    : 'text-[#9497a9] text-base italic font-sans'
                }`}
              >
                {parsed.amount ? formatCurrency(parsed.amount) : 'Belum terdeteksi'}
              </span>
            </div>

            {/* Quick Nominal Shortcut Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-[#686b82] dark:text-[#9ca0ba] font-semibold mr-1">
                {parsed.amount ? 'Pilihan angka cepat:' : 'Pilih nominal langsung:'}
              </span>
              {[10000, 20000, 35000, 50000, 100000].map((quickVal) => (
                <button
                  key={quickVal}
                  type="button"
                  onClick={() => setOverrideAmount(quickVal)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                    parsed.amount === quickVal
                      ? 'bg-[#7132f5] text-white shadow-sm'
                      : 'bg-[#edeef3] dark:bg-[#1e202b] text-[#101114] dark:text-[#f3f4f8] hover:bg-[#dedee5] dark:hover:bg-[#282937]'
                  }`}
                >
                  {quickVal >= 1000000 ? `${quickVal / 1000000}jt` : `${quickVal / 1000}rb`}
                </button>
              ))}
              {overrideAmount !== null && (
                <button
                  type="button"
                  onClick={() => setOverrideAmount(null)}
                  className="text-[10px] text-[#e53e3e] hover:underline ml-auto"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Account & Category Row with 1-Tap Quick Correction Dropdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Account Card */}
              <div className="p-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#12131a] border border-[#dedee5]/70 dark:border-[#282937]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#686b82] dark:text-[#9ca0ba]">
                    {parsed.type === 'transfer' ? 'Dari Akun' : 'Akun Rekening'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsChangingAccount(!isChangingAccount)}
                    className="text-[10px] font-bold text-[#7132f5] dark:text-[#3cffd0] hover:underline flex items-center gap-0.5"
                  >
                    <span>Ganti</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                </div>
                <span className="font-bold text-[#101114] dark:text-[#f3f4f8] truncate block mt-0.5">
                  {sourceAccount ? sourceAccount.name : 'Default (Cash)'}
                </span>

                {/* 1-Tap Account Selector */}
                {isChangingAccount && (
                  <div className="mt-2 pt-2 border-t border-[#dedee5]/70 dark:border-[#282937] flex flex-wrap gap-1 max-h-32 overflow-y-auto animate-in fade-in">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setOverrideAccountId(acc.id);
                          setIsChangingAccount(false);
                        }}
                        className={`px-2 py-1 rounded-[6px] text-[10px] font-semibold transition-all ${
                          parsed.sourceAccountId === acc.id
                            ? 'bg-[#7132f5] text-white'
                            : 'bg-[#edeef3] dark:bg-[#1e202b] text-[#101114] dark:text-[#f3f4f8] hover:bg-[#dedee5] dark:hover:bg-[#282937]'
                        }`}
                      >
                        {acc.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination or Category */}
              {parsed.type === 'transfer' ? (
                <div className="p-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#12131a] border border-[#dedee5]/70 dark:border-[#282937]">
                  <span className="text-[10px] font-semibold text-[#686b82] dark:text-[#9ca0ba] block">
                    Ke Akun
                  </span>
                  <span className="font-bold text-[#101114] dark:text-[#f3f4f8] truncate block mt-0.5">
                    {destinationAccount ? destinationAccount.name : 'Pilih Akun Tujuan'}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#12131a] border border-[#dedee5]/70 dark:border-[#282937]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#686b82] dark:text-[#9ca0ba]">
                      Kategori
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsChangingCategory(!isChangingCategory)}
                      className="text-[10px] font-bold text-[#7132f5] dark:text-[#3cffd0] hover:underline flex items-center gap-0.5"
                    >
                      <span>Ganti</span>
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-bold text-[#101114] dark:text-[#f3f4f8] truncate">
                      {matchedCategory ? matchedCategory.name : 'Umum'}
                    </span>
                    {matchedCategory && (
                      <CategoryIcon
                        name={matchedCategory.name}
                        type={matchedCategory.type}
                        emoji={matchedCategory.emoji}
                        icon={matchedCategory.icon}
                        size="sm"
                      />
                    )}
                  </div>

                  {/* 1-Tap Category Selector */}
                  {isChangingCategory && (
                    <div className="mt-2 pt-2 border-t border-[#dedee5]/70 dark:border-[#282937] flex flex-wrap gap-1 max-h-32 overflow-y-auto animate-in fade-in">
                      {categories
                        .filter((c) => c.type === (parsed.type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'))
                        .map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setOverrideCategoryId(cat.id);
                              setIsChangingCategory(false);
                            }}
                            className={`px-2 py-1 rounded-[6px] text-[10px] font-semibold transition-all flex items-center gap-1 ${
                              parsed.categoryId === cat.id
                                ? 'bg-[#7132f5] text-white'
                                : 'bg-[#edeef3] dark:bg-[#1e202b] text-[#101114] dark:text-[#f3f4f8] hover:bg-[#dedee5] dark:hover:bg-[#282937]'
                            }`}
                          >
                            <span>{cat.emoji || '📁'}</span>
                            <span>{cat.name}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="text-xs">
              <span className="text-[10px] font-semibold text-[#686b82] dark:text-[#9ca0ba] block">
                Catatan:
              </span>
              <p className="font-medium text-[#101114] dark:text-[#f3f4f8] mt-0.5 italic">
                "{parsed.notes}"
              </p>
            </div>
          </div>
        )}

        {/* Quick Example Phrases Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-1.5 text-xs text-[#7132f5] dark:text-[#a78bfa] font-bold hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showExamples ? 'Sembunyikan Contoh Ucapan' : 'Lihat Contoh Kalimat yang Didukung'}</span>
          </button>

          {showExamples && (
            <div className="mt-2 grid grid-cols-1 gap-1.5 p-2 rounded-[12px] bg-[#edeef3]/60 dark:bg-[#1a1c24] border border-[#dedee5] dark:border-[#282937]">
              {EXAMPLE_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyExample(phrase)}
                  className="text-left text-xs p-2 rounded-[8px] hover:bg-white dark:hover:bg-[#232534] text-[#101114] dark:text-[#f3f4f8] transition-all flex items-center justify-between group"
                >
                  <span className="truncate">"{phrase}"</span>
                  <span className="text-[10px] text-[#7132f5] dark:text-[#3cffd0] font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Coba
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          {saveSuccess ? (
            <div className="w-full py-2.5 rounded-[12px] bg-[#149e61] text-white flex items-center justify-center gap-2 font-bold text-xs animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4" />
              <span>Transaksi Berhasil Disimpan!</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={!canDirectSave}
                onClick={handleSaveDirectly}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-[12px] btn-kraken-primary font-bold text-xs flex items-center justify-center gap-2 shadow-whisper disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Transaksi</span>
              </button>

              <button
                type="button"
                disabled={!canApplyToForm}
                onClick={handleApplyToForm}
                className="w-full sm:w-auto py-2.5 px-4 rounded-[12px] bg-[#edeef3] dark:bg-[#1e202b] hover:bg-[#dedee5] dark:hover:bg-[#282937] text-[#101114] dark:text-[#f3f4f8] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#dedee5] dark:border-[#282937] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>Tinjau di Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
