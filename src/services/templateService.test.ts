import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * A rejected remote write used to be logged and swallowed, which made the UI
 * report success and then silently drop the template on the next refresh.
 * These tests pin the opposite behaviour: throw, and leave the cache untouched.
 */
const loadSupabaseMock = vi.fn();

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  loadSupabase: () => loadSupabaseMock(),
}));

const REMOTE_ERROR = { message: 'ditolak server' };

/**
 * Minimal PostgREST stand-in. `insert/update/delete/eq/select` are chainable
 * and the chain is awaitable, exactly like the real client.
 */
function makeDb(error: typeof REMOTE_ERROR | null) {
  const chain: Record<string, unknown> = {};
  const passthrough = () => chain;
  chain.insert = passthrough;
  chain.update = passthrough;
  chain.delete = passthrough;
  chain.eq = passthrough;
  chain.select = passthrough;
  chain.order = () => Promise.resolve({ data: [], error });
  // Awaiting the chain yields { error }. This mirrors the real Supabase
  // client, which is itself a thenable builder; the lint rule is about
  // accident, and here the thenable is deliberate and awaited once.
  // eslint-disable-next-line unicorn/no-thenable
  Object.defineProperty(chain, 'then', {
    value: (resolve: (value: { error: typeof REMOTE_ERROR | null }) => void) =>
      resolve({ error }),
    enumerable: false,
  });
  return { from: () => chain };
}

const template = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Kopi',
  type: 'pengeluaran' as const,
  amount: 20000,
  sourceAccountId: '22222222-2222-4222-8222-222222222222',
  categoryId: '33333333-3333-4333-8333-333333333333',
  notes: '',
  emoji: '☕',
};

beforeEach(() => {
  // `src/services/**/*.test.ts` runs in the node project, which has no
  // localStorage. The service uses it as an offline cache, so give it one.
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  });
  loadSupabaseMock.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('templateService remote failures', () => {
  it('addQuickTemplate throws when the insert is rejected', async () => {
    loadSupabaseMock.mockResolvedValue(makeDb(REMOTE_ERROR));
    const { addQuickTemplate } = await import('./templateService');

    await expect(addQuickTemplate(template, [])).rejects.toThrow('ditolak server');
  });

  it('addQuickTemplate rolls the cache back so a phantom template never appears', async () => {
    loadSupabaseMock.mockResolvedValue(makeDb(REMOTE_ERROR));
    const { addQuickTemplate, loadCachedQuickTemplates } = await import('./templateService');

    await expect(addQuickTemplate(template, [])).rejects.toThrow();
    // An empty cache reloads the built-in starter templates, which is exactly
    // what an untouched install shows — the point is that the rejected
    // template is not among them.
    const cached = loadCachedQuickTemplates();
    expect(cached.some((t) => t.id === template.id)).toBe(false);
  });

  it('updateQuickTemplate throws and restores the previous list', async () => {
    loadSupabaseMock.mockResolvedValue(makeDb(REMOTE_ERROR));
    const { updateQuickTemplate, loadCachedQuickTemplates } = await import('./templateService');

    await expect(
      updateQuickTemplate({ ...template, name: 'Kopi Susu' }, [template])
    ).rejects.toThrow('ditolak server');
    expect(loadCachedQuickTemplates()).toEqual([template]);
  });

  it('deleteQuickTemplate throws and keeps the template in the cache', async () => {
    loadSupabaseMock.mockResolvedValue(makeDb(REMOTE_ERROR));
    const { deleteQuickTemplate, loadCachedQuickTemplates } = await import('./templateService');

    await expect(deleteQuickTemplate(template.id, [template])).rejects.toThrow('ditolak server');
    expect(loadCachedQuickTemplates()).toEqual([template]);
  });

  it('succeeds quietly when Supabase is not configured', async () => {
    loadSupabaseMock.mockResolvedValue(null);
    const { addQuickTemplate, loadCachedQuickTemplates } = await import('./templateService');

    const { updatedList } = await addQuickTemplate(template, []);
    expect(updatedList).toHaveLength(1);
    expect(loadCachedQuickTemplates()).toHaveLength(1);
  });
});
