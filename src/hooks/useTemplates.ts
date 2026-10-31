import { useCallback, useEffect, useState } from 'react';
import type { QuickTemplate } from '../types';
import {
  addQuickTemplate,
  deleteQuickTemplate,
  loadCachedQuickTemplates,
  loadQuickTemplates,
  resolveTemplateAccount,
  resolveTemplateCategory,
  updateQuickTemplate,
} from '../services/templateService';
import { todayLocalISO } from '../lib/date';
import { formatCurrency } from '../lib/formatters';
import type { WriteResult, TransactionInput } from './useTransactionActions';
import type { LedgerState } from './useLedger';

interface TemplateActionOptions {
  getLedger: () => LedgerState;
  addTransaction: (data: TransactionInput) => Promise<WriteResult>;
  deleteTransaction: (id: string) => Promise<void>;
  onError: (message: string) => void;
  /** Shows the "recorded" toast, with an undo action wired to delete the row. */
  onRecorded: (info: { title: string; subtitle: string; undo: () => void }) => void;
  /** Shows a plain informational toast. */
  onInfo: (title: string, subtitle?: string) => void;
}

/**
 * Quick-template CRUD plus one-tap recording from the dashboard.
 *
 * Templates are cached separately from the ledger because they can be edited
 * without touching money. `resolveTemplateAccount` maps a stored id onto a live
 * account, so a template survives the account being renamed or re-created.
 */
export function useTemplates(options: TemplateActionOptions) {
  const { getLedger, addTransaction, deleteTransaction, onError, onRecorded, onInfo } = options;
  const [templates, setTemplates] = useState<QuickTemplate[]>(() => loadCachedQuickTemplates());

  /** Hydrates from the server once on mount. */
  useEffect(() => {
    let cancelled = false;
    void loadQuickTemplates()
      .then((list) => {
        if (!cancelled) setTemplates(list);
      })
      .catch((err) => {
        console.error('Failed to load templates:', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Re-reads templates from the server, used by the manual refresh path. */
  const refreshTemplates = useCallback(async () => {
    try {
      const list = await loadQuickTemplates();
      setTemplates(list);
    } catch (err) {
      console.error('Failed to refresh templates:', err);
    }
  }, []);

  const saveTemplate = useCallback(
    async (data: Omit<QuickTemplate, 'id'> & { id?: string }) => {
      try {
        if (data.id) {
          setTemplates(await updateQuickTemplate(data as QuickTemplate, templates));
        } else {
          const { updatedList } = await addQuickTemplate(data, templates);
          setTemplates(updatedList);
        }
      } catch (err) {
        console.error('Failed to save template:', err);
        onError('Template gagal disimpan');
      }
    },
    [templates, onError]
  );

  const removeTemplate = useCallback(
    async (id: string) => {
      try {
        setTemplates(await deleteQuickTemplate(id, templates));
      } catch (err) {
        console.error('Failed to delete template:', err);
        onError('Template gagal dihapus');
      }
    },
    [templates, onError]
  );

  /** Saves the current form as a new template. */
  const saveAsTemplate = useCallback(
    async (data: Omit<QuickTemplate, 'id'>) => {
      try {
        const { newTemplate, updatedList } = await addQuickTemplate(data, templates);
        setTemplates(updatedList);
        onInfo(`Template "${newTemplate.name}" berhasil disimpan!`, 'Dapat digunakan kapan saja di Dashboard atau Form');
      } catch (err) {
        console.error('Failed to save template from form:', err);
        onError('Template gagal disimpan');
      }
    },
    [templates, onInfo, onError]
  );

  /** Records a transaction straight from a template, then offers undo. */
  const useTemplateDirectly = useCallback(
    async (tpl: QuickTemplate) => {
      const { accounts, categories } = getLedger();

      const resolvedSrc = resolveTemplateAccount(accounts, tpl.sourceAccountId) ?? accounts[0];
      const resolvedDst = tpl.destinationAccountId
        ? resolveTemplateAccount(accounts, tpl.destinationAccountId)
        : undefined;
      const resolvedCat = tpl.categoryId
        ? resolveTemplateCategory(categories, tpl.categoryId)
        : undefined;

      const result = await addTransaction({
        type: tpl.type,
        amount: tpl.amount,
        sourceAccountId: resolvedSrc?.id ?? tpl.sourceAccountId,
        destinationAccountId: resolvedDst?.id,
        categoryId: resolvedCat?.id,
        date: todayLocalISO(),
        notes: tpl.notes || tpl.name,
      });

      if (!result.ok || !result.tx) return;

      navigator.vibrate?.([35, 35]);

      const createdId = result.tx.id;
      const accountName = resolvedSrc?.name ?? 'Akun';
      const categoryLabel =
        resolvedCat?.name ?? (tpl.type === 'transfer' ? 'Transfer' : 'Transaksi');

      onRecorded({
        title: `${tpl.emoji || '⚡'} ${tpl.name} (${formatCurrency(tpl.amount)}) berhasil dicatat!`,
        subtitle: result.queued
          ? `${accountName} • Tersimpan offline, akan disinkronkan`
          : `${accountName} • ${categoryLabel}`,
        undo: () => void deleteTransaction(createdId),
      });
    },
    [getLedger, addTransaction, deleteTransaction, onRecorded]
  );

  return {
    templates,
    refreshTemplates,
    saveTemplate,
    removeTemplate,
    saveAsTemplate,
    useTemplateDirectly,
  };
}
