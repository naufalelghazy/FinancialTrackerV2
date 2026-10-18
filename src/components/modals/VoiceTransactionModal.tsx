import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Wallet,
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

const ACCOUNT_TYPE_LABELS: Record<Account['type'], string> = {
  bank: 'Bank',
  ewallet: 'E-Wallet',
  credit: 'Kredit / Paylater',
  cash: 'Tunai',
};

type ActiveDropdownType = 'account' | 'destination' | 'category' | null;

interface VoiceModalContentProps {
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  templates: QuickTemplate[];
  history: Transaction[];
  onApplyToForm: VoiceTransactionModalProps['onApplyToForm'];
  onDirectSave?: VoiceTransactionModalProps['onDirectSave'];
}

const VoiceModalContent: React.FC<VoiceModalContentProps> = ({
  onClose,
  accounts,
  categories,
  templates,
  history,
  onApplyToForm,
  onDirectSave,
}) => {
  const [manualText, setManualText] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [overrideAccountId, setOverrideAccountId] = useState<string | null>(null);
  const [overrideDestinationAccountId, setOverrideDestinationAccountId] = useState<string | null>(null);
  const [overrideCategoryId, setOverrideCategoryId] = useState<string | null>(null);
  const [overrideAmount, setOverrideAmount] = useState<number | null>(null);
  const [overrideNotes, setOverrideNotes] = useState<string | null>(null);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdownType>(null);

  const dropdownAreaRef = useRef<HTMLDivElement>(null);
  const notesInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    resetTranscript();
    if (isSupported) {
      startListening();
    }
    return () => {
      stopListening();
    };
  }, [isSupported, startListening, stopListening, resetTranscript]);

  // Close popup dropdown on outside click
  useEffect(() => {
    if (!activeDropdown) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownAreaRef.current &&
        !dropdownAreaRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [activeDropdown]);

  // Keyboard Escape support for dropdowns and modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activeDropdown) {
          event.stopPropagation();
          setActiveDropdown(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDropdown, onClose]);

  const parsedBase = useMemo(() => {
    if (!activeText.trim()) return null;
    return parseVoiceTransaction(activeText, accounts, categories, templates, history);
  }, [activeText, accounts, categories, templates, history]);

  const parsed = useMemo(() => {
    if (!parsedBase) return null;
    return {
      ...parsedBase,
      amount: overrideAmount !== null ? overrideAmount : parsedBase.amount,
      sourceAccountId: overrideAccountId !== null ? overrideAccountId : parsedBase.sourceAccountId,
      destinationAccountId:
        overrideDestinationAccountId !== null
          ? overrideDestinationAccountId
          : parsedBase.destinationAccountId,
      categoryId: overrideCategoryId !== null ? overrideCategoryId : parsedBase.categoryId,
      notes: overrideNotes !== null ? overrideNotes : parsedBase.notes,
    };
  }, [
    parsedBase,
    overrideAmount,
    overrideAccountId,
    overrideDestinationAccountId,
    overrideCategoryId,
    overrideNotes,
  ]);

  const resetOverrides = () => {
    setOverrideAccountId(null);
    setOverrideDestinationAccountId(null);
    setOverrideCategoryId(null);
    setOverrideAmount(null);
    setOverrideNotes(null);
    setActiveDropdown(null);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setManualText('');
      resetOverrides();
      startListening();
    }
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleReset = () => {
    resetTranscript();
    setManualText('');
    resetOverrides();
    setIsEditingTranscript(false);
    startListening();
  };

  const handleApplyExample = (phrase: string) => {
    stopListening();
    setManualText(phrase);
    setTranscript(phrase);
    resetOverrides();
    setIsEditingTranscript(false);
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const sourceAccount = accounts.find((a) => a.id === parsed?.sourceAccountId);
  const destinationAccount = accounts.find((a) => a.id === parsed?.destinationAccountId);
  const matchedCategory = categories.find((c) => c.id === parsed?.categoryId);

  const availableCategories = categories.filter(
    (c) => c.type === (parsed?.type === 'pemasukan' ? 'pemasukan' : 'pengeluaran')
  );
  const availableDestinationAccounts = accounts.filter(
    (a) => a.id !== parsed?.sourceAccountId
  );

  const canDirectSave = Boolean(
    parsed &&
      parsed.amount &&
      parsed.amount > 0 &&
      parsed.sourceAccountId &&
      (parsed.type !== 'transfer' || parsed.destinationAccountId)
  );
  const canApplyToForm = Boolean(parsed && parsed.sourceAccountId);

  const resolvedNotes = (parsed?.notes ?? '').trim() || parsedBase?.notes || 'Transaksi Suara';

  const handleSaveDirectly = () => {
    if (!canDirectSave || !parsed || !parsed.amount || !parsed.sourceAccountId) return;

    const payload = {
      type: parsed.type,
      amount: parsed.amount,
      sourceAccountId: parsed.sourceAccountId,
      destinationAccountId: parsed.type === 'transfer' ? parsed.destinationAccountId : undefined,
      categoryId: parsed.type !== 'transfer' ? parsed.categoryId : undefined,
      date: parsed.date,
      notes: resolvedNotes,
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
      notes: resolvedNotes,
    });
    onClose();
  };

  const toggleDropdown = (menu: Exclude<ActiveDropdownType, null>) => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-modal-title"
        className="relative w-full max-w-lg bg-white dark:bg-[#16171f] rounded-[24px] border border-[#dedee5] dark:border-[#282937] shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#dedee5]/70 dark:border-[#282937] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#7132f5]/10 dark:bg-[#7132f5]/20 flex items-center justify-center text-[#7132f5] dark:text-[#a78bfa]">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="voice-modal-title"
                className="font-bold text-sm sm:text-base text-[#101114] dark:text-[#f3f4f8] leading-tight"
              >
                Catat Transaksi dengan Suara
              </h3>
              <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
                Deteksi otomatis nominal, rekening, kategori, dan catatan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Modal"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#686b82] hover:text-[#101114] dark:text-[#9ca0ba] dark:hover:text-white hover:bg-[#edeef3] dark:hover:bg-[#1e202b] focus-visible:outline-2 focus-visible:outline-[#7132f5] transition-colors"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {!isSupported && (
            <div className="p-3 rounded-[12px] bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#b45309] dark:text-[#fbbf24] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Browser belum mendukung input mikrofon otomatis.</span> Anda tetap dapat mengetik teks atau mencoba contoh kalimat di bawah.
              </div>
            </div>
          )}

          {/* Microphone Interactive Button */}
          <div className="flex flex-col items-center justify-center py-1.5 space-y-2">
            <div className="relative flex items-center justify-center">
              {isListening && (
                <span className="absolute w-20 h-20 rounded-full bg-[#7132f5]/20 dark:bg-[#3cffd0]/20 animate-pulse" />
              )}

              <button
                type="button"
                onClick={handleToggleListening}
                aria-label={isListening ? 'Hentikan rekaman suara' : 'Mulai rekaman suara'}
                className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7132f5] ${
                  isListening
                    ? 'btn-kraken-primary ring-4 ring-[#7132f5]/30'
                    : 'bg-[#edeef3] dark:bg-[#1e202b] text-[#686b82] dark:text-[#9ca0ba] hover:text-[#7132f5] dark:hover:text-[#3cffd0] border border-[#dedee5] dark:border-[#282937]'
                }`}
                title={isListening ? 'Klik untuk Menghentikan' : 'Klik untuk Mulai Bicara'}
              >
                {isListening ? (
                  <Mic className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <MicOff className="w-6 h-6 stroke-[2]" />
                )}
              </button>
            </div>

            <div className="text-center">
              <span
                className={`text-xs font-semibold transition-colors ${
                  isListening
                    ? 'text-[#7132f5] dark:text-[#3cffd0]'
                    : 'text-[#686b82] dark:text-[#9ca0ba]'
                }`}
              >
                {isListening
                  ? 'Sedang mendengarkan... (Berhenti otomatis saat jeda bicara)'
                  : activeText
                  ? 'Rekaman selesai. Klik mikrofon untuk mengulang atau koreksi di bawah'
                  : 'Klik tombol mikrofon di atas lalu mulai bicara'}
              </span>
            </div>
          </div>

          {/* Transcript Box */}
          <div className="p-3 rounded-[14px] bg-[#fafbfe] dark:bg-[#12131a] border border-[#dedee5] dark:border-[#282937] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#686b82] dark:text-[#9ca0ba]">
              <span>Teks Hasil Ucapan:</span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                  className="inline-flex items-center gap-1 py-1 px-1.5 rounded text-[11px] text-[#686b82] dark:text-[#9ca0ba] hover:text-[#7132f5] dark:hover:text-[#3cffd0] focus-visible:outline-2 focus-visible:outline-[#7132f5] transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  <span>{isEditingTranscript ? 'Tutup Edit' : 'Edit Teks'}</span>
                </button>
                {activeText && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 py-1 px-1.5 rounded text-[11px] text-[#7132f5] dark:text-[#a78bfa] hover:underline focus-visible:outline-2 focus-visible:outline-[#7132f5]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Ulangi</span>
                  </button>
                )}
              </div>
            </div>

            {isEditingTranscript ? (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <textarea
                  id="voice-transcript-textarea"
                  name="voiceTranscript"
                  aria-label="Teks Hasil Ucapan"
                  value={activeText}
                  onChange={(e) => {
                    setManualText(e.target.value);
                    setTranscript(e.target.value);
                  }}
                  placeholder="Ketik atau edit kalimat transaksi di sini..."
                  rows={2}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-[10px] bg-white dark:bg-[#181a24] border border-[#dedee5] dark:border-[#282937] text-[#101114] dark:text-[#f3f4f8] focus-visible:outline-2 focus-visible:outline-[#7132f5]"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingTranscript(false)}
                    className="text-[11px] font-bold text-[#7132f5] dark:text-[#3cffd0] hover:underline py-1 px-2"
                  >
                    Selesai Mengedit
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingTranscript(true)}
                title="Klik untuk mengedit teks"
                className={`w-full text-left text-xs sm:text-sm font-medium min-h-[36px] leading-relaxed break-words cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-1.5 rounded-[8px] focus-visible:outline-2 focus-visible:outline-[#7132f5] transition-colors ${
                  activeText
                    ? 'text-[#101114] dark:text-[#f3f4f8]'
                    : 'text-[#686b82] dark:text-[#9ca0ba] italic'
                }`}
              >
                {activeText || 'Contoh: "Makan siang 35 ribu pakai BCA"'}
              </button>
            )}

            {error && (
              <p className="text-[11px] text-[#e53e3e] dark:text-[#f87171] font-medium pt-1">
                {error}
              </p>
            )}
          </div>

          {/* Parsed Result Card */}
          {parsed && (
            <div className="p-3.5 sm:p-4 rounded-[16px] bg-white dark:bg-[#181a24] border-2 border-[#7132f5]/30 dark:border-[#3cffd0]/30 space-y-3 shadow-micro animate-in fade-in duration-150">
              {/* Header Result + Badges */}
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba]">
                  Hasil Deteksi Cerdas:
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    parsed.type === 'pengeluaran'
                      ? 'bg-[#e53e3e]/15 text-[#c53030] dark:text-[#f87171]'
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
                <div className="flex items-center gap-1.5 p-2 rounded-[10px] bg-[#149e61]/10 border border-[#149e61]/30 text-[#026b3f] dark:text-[#34d399] text-xs font-bold animate-in fade-in">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Cocok dengan Template: <b>{parsed.matchedTemplate.name}</b>
                  </span>
                </div>
              )}

              {/* History Prediction Badge */}
              {parsed.predictedFromHistory && !parsed.matchedTemplate && (
                <div className="flex items-center gap-1.5 p-2 rounded-[10px] bg-[#7132f5]/10 border border-[#7132f5]/20 text-[#7132f5] dark:text-[#a78bfa] text-xs font-medium animate-in fade-in">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{parsed.predictedFromHistory.reason}</span>
                </div>
              )}

              {/* Nominal Display */}
              <div className="flex items-baseline justify-between border-b border-[#dedee5]/70 dark:border-[#282937] pb-2">
                <span className="text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba]">
                  Nominal:
                </span>
                <span
                  className={`text-xl sm:text-2xl font-bold font-display tabular-nums ${
                    parsed.amount
                      ? parsed.type === 'pengeluaran'
                        ? 'text-[#c53030] dark:text-[#f87171]'
                        : parsed.type === 'pemasukan'
                        ? 'text-[#026b3f] dark:text-[#34d399]'
                        : 'text-[#101114] dark:text-[#f3f4f8]'
                      : 'text-[#686b82] dark:text-[#9ca0ba] text-sm italic font-sans'
                  }`}
                >
                  {parsed.amount ? formatCurrency(parsed.amount) : 'Belum terdeteksi'}
                </span>
              </div>

              {/* Quick Nominal Shortcut Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] font-semibold mr-1">
                  {parsed.amount ? 'Pilihan angka cepat:' : 'Pilih nominal:'}
                </span>
                {[10000, 20000, 35000, 50000, 100000].map((quickVal) => (
                  <button
                    key={quickVal}
                    type="button"
                    onClick={() => setOverrideAmount(quickVal)}
                    className={`min-h-[30px] px-2.5 py-1 rounded-full text-[11px] font-bold transition-all focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                      parsed.amount === quickVal
                        ? 'bg-[#7132f5] text-white shadow-2xs'
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
                    className="text-[11px] font-semibold text-[#c53030] dark:text-[#f87171] hover:underline ml-auto py-1 px-1.5"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Payment Account & Category / Destination Popup Dropdown Row */}
              <div ref={dropdownAreaRef} className="relative grid grid-cols-2 gap-2.5 text-xs">
                {/* Payment / Source Account Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => toggleDropdown('account')}
                  aria-expanded={activeDropdown === 'account'}
                  aria-haspopup="listbox"
                  className={`w-full min-h-[58px] p-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#12131a] border text-left transition-all flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                    activeDropdown === 'account'
                      ? 'border-[#7132f5] ring-2 ring-[#7132f5]/15'
                      : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-1">
                    <span className="text-[10px] font-semibold text-[#686b82] dark:text-[#9ca0ba] truncate">
                      {parsed.type === 'transfer' ? 'Dari Rekening' : 'Akun Pembayaran'}
                    </span>
                    <span className="text-[10px] font-bold text-[#7132f5] dark:text-[#3cffd0] inline-flex items-center gap-0.5 shrink-0">
                      <span>Pilih</span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-150 ${
                          activeDropdown === 'account' ? 'rotate-180' : ''
                        }`}
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 mt-1 w-full">
                    <span className="font-bold text-xs sm:text-sm text-[#101114] dark:text-[#f3f4f8] truncate">
                      {sourceAccount ? sourceAccount.name : 'Pilih Akun'}
                    </span>
                    <Wallet className="w-3.5 h-3.5 text-[#686b82] dark:text-[#9ca0ba] shrink-0" />
                  </div>
                </button>

                {/* Destination Account (if transfer) OR Category Dropdown Trigger */}
                {parsed.type === 'transfer' ? (
                  <button
                    type="button"
                    onClick={() => toggleDropdown('destination')}
                    aria-expanded={activeDropdown === 'destination'}
                    aria-haspopup="listbox"
                    className={`w-full min-h-[58px] p-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#12131a] border text-left transition-all flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                      activeDropdown === 'destination'
                        ? 'border-[#7132f5] ring-2 ring-[#7132f5]/15'
                        : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full gap-1">
                      <span className="text-[10px] font-semibold text-[#686b82] dark:text-[#9ca0ba] truncate">
                        Ke Akun Tujuan
                      </span>
                      <span className="text-[10px] font-bold text-[#7132f5] dark:text-[#3cffd0] inline-flex items-center gap-0.5 shrink-0">
                        <span>Pilih</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-150 ${
                            activeDropdown === 'destination' ? 'rotate-180' : ''
                          }`}
                        />
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 mt-1 w-full">
                      <span className="font-bold text-xs sm:text-sm text-[#101114] dark:text-[#f3f4f8] truncate">
                        {destinationAccount ? destinationAccount.name : 'Pilih Tujuan'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#686b82] dark:text-[#9ca0ba] shrink-0" />
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleDropdown('category')}
                    aria-expanded={activeDropdown === 'category'}
                    aria-haspopup="listbox"
                    className={`w-full min-h-[58px] p-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#12131a] border text-left transition-all flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                      activeDropdown === 'category'
                        ? 'border-[#7132f5] ring-2 ring-[#7132f5]/15'
                        : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full gap-1">
                      <span className="text-[10px] font-semibold text-[#686b82] dark:text-[#9ca0ba] truncate">
                        Kategori
                      </span>
                      <span className="text-[10px] font-bold text-[#7132f5] dark:text-[#3cffd0] inline-flex items-center gap-0.5 shrink-0">
                        <span>Pilih</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-150 ${
                            activeDropdown === 'category' ? 'rotate-180' : ''
                          }`}
                        />
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 mt-1 w-full">
                      <span className="font-bold text-xs sm:text-sm text-[#101114] dark:text-[#f3f4f8] truncate">
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
                  </button>
                )}

                {/* Floating Popup Dropdown Menu: Payment / Source Account */}
                {activeDropdown === 'account' && (
                  <div
                    role="listbox"
                    aria-label="Pilih Akun Pembayaran"
                    className="absolute left-0 right-0 bottom-full mb-2 z-30 rounded-[14px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center justify-between px-3 py-2 bg-[#fafbfe] dark:bg-[#12131a] border-b border-[#dedee5]/70 dark:border-[#282937]">
                      <span className="text-[11px] font-bold text-[#101114] dark:text-[#f3f4f8]">
                        {parsed.type === 'transfer' ? 'Pilih Rekening Asal' : 'Pilih Metode Pembayaran'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(null)}
                        aria-label="Tutup daftar akun"
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#686b82] hover:text-[#101114] dark:text-[#9ca0ba] dark:hover:text-white hover:bg-[#edeef3] dark:hover:bg-[#1e202b]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-1.5 max-h-48 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
                      {accounts.map((acc) => {
                        const isSelected = parsed.sourceAccountId === acc.id;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setOverrideAccountId(acc.id);
                              setActiveDropdown(null);
                            }}
                            className={`w-full min-h-[42px] px-3 py-2 rounded-[10px] text-left flex items-center justify-between gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                              isSelected
                                ? 'bg-[#7132f5] text-white font-bold'
                                : 'text-[#101114] dark:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] font-semibold'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate text-xs">{acc.name}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                                  isSelected
                                    ? 'bg-black/15 text-current'
                                    : 'bg-[#edeef3] dark:bg-[#232534] text-[#686b82] dark:text-[#9ca0ba]'
                                }`}
                              >
                                {ACCOUNT_TYPE_LABELS[acc.type] || acc.type}
                              </span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Floating Popup Dropdown Menu: Destination Account */}
                {activeDropdown === 'destination' && (
                  <div
                    role="listbox"
                    aria-label="Pilih Rekening Tujuan"
                    className="absolute left-0 right-0 bottom-full mb-2 z-30 rounded-[14px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center justify-between px-3 py-2 bg-[#fafbfe] dark:bg-[#12131a] border-b border-[#dedee5]/70 dark:border-[#282937]">
                      <span className="text-[11px] font-bold text-[#101114] dark:text-[#f3f4f8]">
                        Pilih Rekening Tujuan
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(null)}
                        aria-label="Tutup daftar rekening tujuan"
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#686b82] hover:text-[#101114] dark:text-[#9ca0ba] dark:hover:text-white hover:bg-[#edeef3] dark:hover:bg-[#1e202b]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-1.5 max-h-48 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
                      {availableDestinationAccounts.map((acc) => {
                        const isSelected = parsed.destinationAccountId === acc.id;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setOverrideDestinationAccountId(acc.id);
                              setActiveDropdown(null);
                            }}
                            className={`w-full min-h-[42px] px-3 py-2 rounded-[10px] text-left flex items-center justify-between gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                              isSelected
                                ? 'bg-[#7132f5] text-white font-bold'
                                : 'text-[#101114] dark:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] font-semibold'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate text-xs">{acc.name}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                                  isSelected
                                    ? 'bg-black/15 text-current'
                                    : 'bg-[#edeef3] dark:bg-[#232534] text-[#686b82] dark:text-[#9ca0ba]'
                                }`}
                              >
                                {ACCOUNT_TYPE_LABELS[acc.type] || acc.type}
                              </span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Floating Popup Dropdown Menu: Category */}
                {activeDropdown === 'category' && (
                  <div
                    role="listbox"
                    aria-label="Pilih Kategori Transaksi"
                    className="absolute left-0 right-0 bottom-full mb-2 z-30 rounded-[14px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center justify-between px-3 py-2 bg-[#fafbfe] dark:bg-[#12131a] border-b border-[#dedee5]/70 dark:border-[#282937]">
                      <span className="text-[11px] font-bold text-[#101114] dark:text-[#f3f4f8]">
                        Pilih Kategori Transaksi
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(null)}
                        aria-label="Tutup daftar kategori"
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#686b82] hover:text-[#101114] dark:text-[#9ca0ba] dark:hover:text-white hover:bg-[#edeef3] dark:hover:bg-[#1e202b]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-1.5 max-h-48 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
                      {availableCategories.map((cat) => {
                        const isSelected = parsed.categoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setOverrideCategoryId(cat.id);
                              setActiveDropdown(null);
                            }}
                            className={`w-full min-h-[42px] px-3 py-2 rounded-[10px] text-left flex items-center justify-between gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                              isSelected
                                ? 'bg-[#7132f5] text-white font-bold'
                                : 'text-[#101114] dark:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] font-semibold'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CategoryIcon
                                name={cat.name}
                                type={cat.type}
                                emoji={cat.emoji}
                                icon={cat.icon}
                                size="sm"
                              />
                              <span className="truncate text-xs">{cat.name}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Editable Notes Section */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="voice-transaction-notes"
                    className="text-[10px] font-semibold text-[#686b82] dark:text-[#9ca0ba]"
                  >
                    Catatan Transaksi:
                  </label>
                  <div className="flex items-center gap-2">
                    {overrideNotes !== null && (
                      <button
                        type="button"
                        onClick={() => setOverrideNotes(null)}
                        className="text-[10px] font-semibold text-[#c53030] dark:text-[#f87171] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => notesInputRef.current?.focus()}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7132f5] dark:text-[#3cffd0] hover:underline"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                      <span>Edit Catatan</span>
                    </button>
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    ref={notesInputRef}
                    id="voice-transaction-notes"
                    name="voiceTransactionNotes"
                    type="text"
                    value={parsed.notes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    placeholder="Tambahkan catatan transaksi..."
                    className="w-full min-h-[42px] px-3 py-2 pr-8 rounded-[10px] bg-[#fafbfe] dark:bg-[#12131a] border border-[#dedee5] dark:border-[#282937] text-xs sm:text-sm font-medium text-[#101114] dark:text-[#f3f4f8] focus:border-[#7132f5] focus-visible:outline-2 focus-visible:outline-[#7132f5] transition-colors"
                  />
                  <Pencil className="w-3.5 h-3.5 text-[#686b82] dark:text-[#9ca0ba] pointer-events-none absolute right-3" />
                </div>
              </div>
            </div>
          )}

          {/* Quick Example Phrases Accordion */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-1.5 py-1 text-xs text-[#7132f5] dark:text-[#a78bfa] font-bold hover:underline focus-visible:outline-2 focus-visible:outline-[#7132f5] rounded"
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
                    className="text-left text-xs p-2.5 rounded-[8px] hover:bg-white dark:hover:bg-[#232534] text-[#101114] dark:text-[#f3f4f8] transition-all flex items-center justify-between group focus-visible:outline-2 focus-visible:outline-[#7132f5]"
                  >
                    <span className="truncate">"{phrase}"</span>
                    <span className="text-[10px] text-[#7132f5] dark:text-[#3cffd0] font-bold shrink-0 ml-2">
                      Gunakan
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer Action Buttons */}
        <div className="px-5 py-3.5 border-t border-[#dedee5]/70 dark:border-[#282937] bg-white dark:bg-[#16171f] shrink-0 flex flex-col sm:flex-row items-center gap-2">
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
                className="w-full sm:flex-1 min-h-[44px] py-2.5 px-4 rounded-[12px] btn-kraken-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-whisper disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7132f5] transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Transaksi</span>
              </button>

              <button
                type="button"
                disabled={!canApplyToForm}
                onClick={handleApplyToForm}
                className="w-full sm:w-auto min-h-[44px] py-2.5 px-4 rounded-[12px] bg-[#edeef3] dark:bg-[#1e202b] hover:bg-[#dedee5] dark:hover:bg-[#282937] text-[#101114] dark:text-[#f3f4f8] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-[#dedee5] dark:border-[#282937] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7132f5] transition-all"
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
  if (!isOpen) return null;

  return (
    <VoiceModalContent
      onClose={onClose}
      accounts={accounts}
      categories={categories}
      templates={templates}
      history={history}
      onApplyToForm={onApplyToForm}
      onDirectSave={onDirectSave}
    />
  );
};


