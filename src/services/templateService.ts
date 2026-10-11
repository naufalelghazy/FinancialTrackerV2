import type { QuickTemplate } from '../types';
import { INITIAL_TEMPLATES } from '../lib/constants';

const STORAGE_KEY = 'ft_quick_templates';

/**
 * Loads quick templates from localStorage, or returns initial defaults.
 */
export function loadQuickTemplates(): QuickTemplate[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load quick templates:', err);
  }
  return INITIAL_TEMPLATES;
}

/**
 * Saves quick templates to localStorage.
 */
export function saveQuickTemplates(templates: QuickTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to save quick templates:', err);
  }
}

/**
 * Adds a new quick template and returns updated list.
 */
export function addQuickTemplate(
  data: Omit<QuickTemplate, 'id'>,
  currentTemplates: QuickTemplate[]
): { newTemplate: QuickTemplate; updatedList: QuickTemplate[] } {
  const newTemplate: QuickTemplate = {
    ...data,
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };
  const updatedList = [newTemplate, ...currentTemplates];
  saveQuickTemplates(updatedList);
  return { newTemplate, updatedList };
}

/**
 * Updates an existing quick template and returns updated list.
 */
export function updateQuickTemplate(
  updated: QuickTemplate,
  currentTemplates: QuickTemplate[]
): QuickTemplate[] {
  const updatedList = currentTemplates.map((t) => (t.id === updated.id ? updated : t));
  saveQuickTemplates(updatedList);
  return updatedList;
}

/**
 * Deletes a quick template by ID and returns updated list.
 */
export function deleteQuickTemplate(
  id: string,
  currentTemplates: QuickTemplate[]
): QuickTemplate[] {
  const updatedList = currentTemplates.filter((t) => t.id !== id);
  saveQuickTemplates(updatedList);
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
