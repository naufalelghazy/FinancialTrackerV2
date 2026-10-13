import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { QuickTemplate, TransactionType } from '../types';
import { INITIAL_TEMPLATES } from '../lib/constants';

const STORAGE_KEY = 'ft_quick_templates';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toValidUuidOrNull(val?: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

/**
 * Loads quick templates synchronously from localStorage cache for instant UI rendering.
 */
export function loadCachedQuickTemplates(): QuickTemplate[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load cached quick templates:', err);
  }
  return INITIAL_TEMPLATES;
}

/**
 * Saves quick templates to localStorage cache.
 */
export function saveQuickTemplates(templates: QuickTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to save quick templates:', err);
  }
}

/**
 * Loads quick templates from Supabase with automatic fallback to localStorage cache.
 * If Supabase table is empty on first sync, automatically seeds current local templates.
 */
export async function loadQuickTemplates(): Promise<QuickTemplate[]> {
  const cached = loadCachedQuickTemplates();

  if (!isSupabaseConfigured || !supabase) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('quick_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      const mapped: QuickTemplate[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type as TransactionType,
        amount: Number(row.amount) || 0,
        sourceAccountId: row.source_account_id || '',
        destinationAccountId: row.destination_account_id || undefined,
        categoryId: row.category_id || undefined,
        notes: row.notes || '',
        emoji: row.emoji || '📌',
      }));

      saveQuickTemplates(mapped);
      return mapped;
    }

    // If table is newly created and currently empty, migrate cached templates to Supabase
    if (cached.length > 0) {
      try {
        const rowsToInsert = cached.map((t) => ({
          id: t.id,
          name: t.name,
          type: t.type,
          amount: Number(t.amount) || 0,
          source_account_id: toValidUuidOrNull(t.sourceAccountId),
          destination_account_id: toValidUuidOrNull(t.destinationAccountId),
          category_id: toValidUuidOrNull(t.categoryId),
          notes: t.notes || '',
          emoji: t.emoji || '📌',
        }));

        await supabase.from('quick_templates').insert(rowsToInsert);
      } catch (seedErr) {
        console.warn('Initial templates seed to Supabase skipped:', seedErr);
      }
    }

    return cached;
  } catch (err) {
    console.error('Failed to load quick templates from Supabase:', err);
    return cached;
  }
}

/**
 * Adds a new quick template to Supabase and local cache.
 */
export async function addQuickTemplate(
  data: Omit<QuickTemplate, 'id'>,
  currentTemplates: QuickTemplate[]
): Promise<{ newTemplate: QuickTemplate; updatedList: QuickTemplate[] }> {
  const newTemplate: QuickTemplate = {
    ...data,
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };

  const updatedList = [newTemplate, ...currentTemplates];
  saveQuickTemplates(updatedList);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('quick_templates').insert({
        id: newTemplate.id,
        name: newTemplate.name,
        type: newTemplate.type,
        amount: newTemplate.amount,
        source_account_id: toValidUuidOrNull(newTemplate.sourceAccountId),
        destination_account_id: toValidUuidOrNull(newTemplate.destinationAccountId),
        category_id: toValidUuidOrNull(newTemplate.categoryId),
        notes: newTemplate.notes || '',
        emoji: newTemplate.emoji || '📌',
      });
      if (error) console.error('Failed to insert quick template to Supabase:', error);
    } catch (err) {
      console.error('Error inserting quick template to Supabase:', err);
    }
  }

  return { newTemplate, updatedList };
}

/**
 * Updates an existing quick template in Supabase and local cache.
 */
export async function updateQuickTemplate(
  updated: QuickTemplate,
  currentTemplates: QuickTemplate[]
): Promise<QuickTemplate[]> {
  const updatedList = currentTemplates.map((t) => (t.id === updated.id ? updated : t));
  saveQuickTemplates(updatedList);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('quick_templates')
        .update({
          name: updated.name,
          type: updated.type,
          amount: updated.amount,
          source_account_id: toValidUuidOrNull(updated.sourceAccountId),
          destination_account_id: toValidUuidOrNull(updated.destinationAccountId),
          category_id: toValidUuidOrNull(updated.categoryId),
          notes: updated.notes || '',
          emoji: updated.emoji || '📌',
        })
        .eq('id', updated.id);
      if (error) console.error('Failed to update quick template in Supabase:', error);
    } catch (err) {
      console.error('Error updating quick template in Supabase:', err);
    }
  }

  return updatedList;
}

/**
 * Deletes a quick template from Supabase and local cache.
 */
export async function deleteQuickTemplate(
  id: string,
  currentTemplates: QuickTemplate[]
): Promise<QuickTemplate[]> {
  const updatedList = currentTemplates.filter((t) => t.id !== id);
  saveQuickTemplates(updatedList);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('quick_templates').delete().eq('id', id);
      if (error) console.error('Failed to delete quick template from Supabase:', error);
    } catch (err) {
      console.error('Error deleting quick template from Supabase:', err);
    }
  }

  return updatedList;
}

/**
 * Resolves an account from template source/destination ID or fallback by name.
 */
export function resolveTemplateAccount<T extends { id: string; name: string }>(
  accounts: T[],
  idOrName?: string
): T | undefined {
  if (!idOrName) return undefined;
  const direct = accounts.find((a) => a.id === idOrName);
  if (direct) return direct;
  const lower = idOrName.toLowerCase().trim();
  return accounts.find(
    (a) => a.name.toLowerCase().trim() === lower || a.id.toLowerCase().trim() === lower
  );
}

/**
 * Resolves a category from template category ID or fallback by name.
 */
export function resolveTemplateCategory<T extends { id: string; name: string }>(
  categories: T[],
  idOrName?: string
): T | undefined {
  if (!idOrName) return undefined;
  const direct = categories.find((c) => c.id === idOrName);
  if (direct) return direct;
  const lower = idOrName.toLowerCase().trim();
  return categories.find(
    (c) => c.name.toLowerCase().trim() === lower || c.id.toLowerCase().trim() === lower
  );
}
