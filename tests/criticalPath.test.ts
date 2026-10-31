import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guards the "offline-first means no backend on the critical path" rule.
 *
 * The Supabase SDK used to be a static import of `lib/supabase`, so every page
 * downloaded 55 kB gzipped of client code before painting — even though the
 * first screen renders entirely from the `localStorage` snapshot. Lazy-loading
 * it is easy to undo by accident: one `import { supabase }` anywhere in the
 * entry graph silently puts it back.
 *
 * A static import is easy to reintroduce, so this test inspects the built entry
 * chunk for a static reference to the vendor chunk that holds the SDK.
 */

const DIST = join(process.cwd(), 'dist');

const hasDist = (() => {
  try {
    return statSync(DIST).isDirectory();
  } catch {
    return false;
  }
})();

function entrySource(): string {
  const assetsDir = join(DIST, 'assets');
  const entry = readdirSync(assetsDir).find((f) => /^index-.*\.js$/.test(f));
  if (!entry) throw new Error('entry chunk not found');
  return readFileSync(join(assetsDir, entry), 'utf8');
}

/** Every static `import ... from "./x.js"` target in a chunk. */
function staticImports(source: string): string[] {
  return Array.from(source.matchAll(/import\{[^}]*\}from"\.\/([^"]+\.js)"/g)).map((m) => m[1]);
}

describe('critical path', () => {
  it.skipIf(!hasDist)('does not statically import the Supabase SDK from the entry', () => {
    const imports = staticImports(entrySource());
    expect(imports.filter((i) => i.includes('vendor-supabase'))).toEqual([]);
  });

  it.skipIf(!hasDist)('does not statically import recharts from the entry', () => {
    // Charts are only rendered by the lazily-loaded report route.
    const imports = staticImports(entrySource());
    expect(imports.filter((i) => i.includes('vendor-recharts'))).toEqual([]);
  });

  it.skipIf(!hasDist)('still ships the SDK, just lazily', () => {
    // Removing it from the critical path must not mean removing it: the sync
    // feature would break silently.
    const chunks = readdirSync(join(DIST, 'assets')).filter((f) => f.includes('vendor-supabase'));
    expect(chunks.length).toBe(1);
  });

  it.skipIf(!hasDist)('keeps React in its own long-lived chunk', () => {
    // React changes far less often than app code; separate chunks mean a deploy
    // does not invalidate the framework download.
    const chunks = readdirSync(join(DIST, 'assets')).filter((f) => f.startsWith('vendor-react'));
    expect(chunks.length).toBe(1);
  });
});
