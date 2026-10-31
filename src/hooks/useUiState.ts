import { useCallback, useEffect, useState } from 'react';
import type { Account, Category, QuickTemplate, Transaction, TransactionType } from '../types';
import type { NavTab } from '../components/layout/BottomNav';
import type { SettingsTab } from '../components/modals/SettingsModal';
import { readLastTab, readRawLastTab, writeLastTab } from '../lib/lastTab';
import { consumeReloadFlag, markNextLoadAsReload } from '../lib/sessionFlag';

/**
 * Tab yang dipakai saat aplikasi dimuat.
 *
 * Dua situasi dibedakan dengan sengaja:
 *
 * - **Muat ulang** (F5, tarik-untuk-refresh, service worker memperbarui
 *   halaman): pulihkan tab apa pun, termasuk `input`. Pengguna sedang di
 *   tengah sesuatu; memindahkannya ke tab lain terasa seperti bug.
 * - **Peluncuran baru**: hanya tab "menetap" yang dipulihkan. Membuka aplikasi
 *   langsung pada form kosong tidak diminta siapa pun.
 */
function resolveInitialTab(): NavTab {
  if (consumeReloadFlag()) return readRawLastTab() ?? readLastTab();
  return readLastTab();
}

/** What the voice modal hands to the form. */
export interface VoicePrefill {
  type: TransactionType;
  amount: number;
  sourceAccountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  date: string;
  notes: string;
}

/**
 * Which modal is open and what it is editing.
 *
 * Each modal used to be a `useState` pair (`isXOpen` + `selectedX`) scattered
 * across `App`, producing 12 independent booleans that could in principle all be
 * true at once. Grouping them per entity makes "open for create" and "open for
 * edit" impossible to mix up: the selected value *is* the mode.
 */
export interface ModalState<T> {
  isOpen: boolean;
  item: T | null;
}

const CLOSED = { isOpen: false, item: null };

export type EntityModal<T> = ModalState<T> & {
  open: (item: T | null) => void;
  close: () => void;
};

function useEntityModal<T>(): EntityModal<T> {
  const [state, setState] = useState<ModalState<T>>(CLOSED);
  return {
    ...state,
    open: useCallback((item: T | null) => setState({ isOpen: true, item }), []),
    close: useCallback(() => setState({ isOpen: false, item: null }), []),
  };
}

export function useUiState() {
  // Reopens on whichever tab the user left, with `input` restored only across a
  // reload -- see `resolveInitialTab`.
  const [activeTab, setActiveTab] = useState<NavTab>(resolveInitialTab);
  const [historyAccountFilterId, setHistoryAccountFilterId] = useState<string>('all');

  // Persist on every change rather than on unload: `beforeunload` does not fire
  // when an installed PWA is swiped away on mobile, which is the common case.
  useEffect(() => {
    writeLastTab(activeTab);
  }, [activeTab]);

  // A reload is the only event we cannot observe after the fact, so leave a
  // flag behind for the next page load to pick up.
  useEffect(() => {
    window.addEventListener('beforeunload', markNextLoadAsReload);
    return () => window.removeEventListener('beforeunload', markNextLoadAsReload);
  }, []);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('akun');

  const accountModal = useEntityModal<Account>();
  const categoryModal = useEntityModal<Category>();
  const templateModal = useEntityModal<QuickTemplate>();
  const transactionModal = useEntityModal<Transaction>();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Bumping a key remounts the transaction form, which is how a voice parse
  // result is injected without the form having to watch a prop for changes.
  const [prefillKey, setPrefillKey] = useState(0);
  const [prefillData, setPrefillData] = useState<VoicePrefill | null>(null);

  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ft_hide_balance') === 'true';
    } catch {
      return false;
    }
  });

  const toggleHideBalance = useCallback(() => {
    setIsBalanceHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ft_hide_balance', String(next));
      } catch {
        /* private mode: keep the in-memory value only */
      }
      return next;
    });
  }, []);

  const openSettings = useCallback((tab: SettingsTab = 'akun') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  }, []);

  const applyVoicePrefill = useCallback((data: VoicePrefill) => {
    setPrefillData(data);
    setPrefillKey((k) => k + 1);
    setActiveTab('input');
  }, []);

  const clearPrefill = useCallback(() => setPrefillData(null), []);

  return {
    // Navigation
    activeTab,
    setActiveTab,
    historyAccountFilterId,
    setHistoryAccountFilterId,

    // Settings
    isSettingsOpen,
    settingsTab,
    openSettings,
    closeSettings: () => setIsSettingsOpen(false),

    // Entity modals — pass an item to edit, null to create.
    accountModal,
    categoryModal,
    templateModal,
    transactionModal,

    // Voice
    isVoiceModalOpen,
    openVoiceModal: () => setIsVoiceModalOpen(true),
    closeVoiceModal: () => setIsVoiceModalOpen(false),
    prefillKey,
    prefillData,
    applyVoicePrefill,
    clearPrefill,

    // Privacy
    isBalanceHidden,
    toggleHideBalance,
  };
}

export type UiState = ReturnType<typeof useUiState>;
