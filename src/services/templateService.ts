import { loadSupabase, isSupabaseConfigured } from '../lib/supabase';
import { isUuid, toUuidOrNull } from '../lib/uuid';
import type { QuickTemplate, TransactionType } from '../types';
import { INITIAL_TEMPLATES } from '../lib/constants';

const STORAGE_KEY = 'ft_quick_templates';

/** Trims first: a trailing space would make an otherwise valid uuid fail. */
function toValidUuidOrNull(val?: string | null): string | null {
  return toUuidOrNull(val?.trim());
}

/**
 * Maps a `quick_templates` row to the app model.
 * Account/category ids that are not UUIDs (legacy seed ids such as `gopay`)
 * are dropped, because they can never reference a Postgres uuid column.
 */
function mapTemplateRow(row: Record<string, unknown>): QuickTemplate {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    type: (row.type === 'pemasukan' || row.type === 'transfer' ? row.type : 'pengeluaran') as TransactionType,
    amount: Number(row.amount) || 0,
    sourceAccountId: row.source_account_id ? String(row.source_account_id) : '',
    destinationAccountId: row.destination_account_id ? String(row.destination_account_id) : undefined,
    categoryId: row.category_id ? String(row.category_id) : undefined,
    notes: row.notes ? String(row.notes) : '',
    emoji: row.emoji ? String(row.emoji) : '📌',
  };
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

  const db = await loadSupabase();
  if (!db) {
    return cached;
  }

  try {
    const { data, error } = await db
      .from('quick_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      const mapped: QuickTemplate[] = (data as Record<string, unknown>[]).map(mapTemplateRow);

      saveQuickTemplates(mapped);
      return mapped;
    }

    // If table is newly created and currently empty, migrate cached templates to Supabase.
    // Only templates with a real uuid can be seeded; legacy seed ids (e.g. `tpl_kopi`)
    // are skipped rather than sent to a uuid primary key and rejected.
    const seedable = cached.filter((t) => isUuid(t.id));
    if (seedable.length > 0) {
      try {
        const rowsToInsert = seedable.map((t) => ({
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

        const { error } = await db.from('quick_templates').insert(rowsToInsert);
        if (error) console.warn('Initial templates seed to Supabase skipped:', error.message);
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
    // Must be a uuid: the primary key is `uuid`, and Postgres rejects `tpl_...`.
    id: crypto.randomUUID(),
  };

  const updatedList = [newTemplate, ...currentTemplates];
  saveQuickTemplates(updatedList);

  if (isSupabaseConfigured) {
    try {
      const db = await loadSupabase();
      if (!db) return { newTemplate, updatedList };
      const { error } = await db.from('quick_templates').insert({
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
      if (error) {
        // Throwing (rather than logging) lets the hook roll the cache back and
        // tell the user. Swallowing it made the UI report success for a write
        // the server had rejected, and the next refresh silently deleted the
        // "saved" template.
        throw new Error(error.message || 'Insert template ditolak server');
      }
    } catch (err) {
      console.error('Error inserting quick template to Supabase:', err);
      saveQuickTemplates(currentTemplates);
      throw err;
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

  if (isSupabaseConfigured) {
    try {
      const db = await loadSupabase();
      if (!db) return updatedList;
      const { error } = await db
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
      if (error) {
        throw new Error(error.message || 'Update template ditolak server');
      }
    } catch (err) {
      console.error('Error updating quick template to Supabase:', err);
      saveQuickTemplates(currentTemplates);
      throw err;
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

  if (isSupabaseConfigured) {
    try {
      const db = await loadSupabase();
      if (!db) return updatedList;
      const { error } = await db.from('quick_templates').delete().eq('id', id);
      if (error) {
        throw new Error(error.message || 'Hapus template ditolak server');
      }
    } catch (err) {
      console.error('Error deleting quick template from Supabase:', err);
      saveQuickTemplates(currentTemplates);
      throw err;
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
