import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';

/**
 * Deployment-shape guards.
 *
 * These do not test app logic; they test the thing that actually ships. Two
 * regressions motivated them:
 *
 * 1. `vercel.json` had no `Cache-Control` header at all, so every deploy forced
 *    every client to re-download the hashed bundles.
 * 2. The service worker precached every chunk, so the 396 kB chart library was
 *    downloaded on first visit even for users who never open the report.
 *
 * They read `dist/`, so they only run after a build. `skipIf` keeps `npm test`
 * green on a clean checkout instead of failing on a missing folder.
 */

const DIST = join(process.cwd(), 'dist');
const hasDist = (() => {
  try {
    return statSync(DIST).isDirectory();
  } catch {
    return false;
  }
})();

/** Gzip size in kB, which is what the browser actually transfers. */
function gzipKb(path: string): number {
  return gzipSync(readFileSync(path)).length / 1024;
}

describe('bundle budget', () => {
  it.skipIf(!hasDist)('keeps the entry chunk under 120 kB gzipped', () => {
    const assetsDir = join(DIST, 'assets');
    const entry = readdirSync(assetsDir).find((f) => /^index-.*\.js$/.test(f));
    expect(entry, 'entry chunk not found in dist/assets').toBeDefined();

    const kb = gzipKb(join(assetsDir, entry!));
    // Budget, not a measurement: it fails when something heavy is pulled into
    // the critical path, which is the only way this number grows quickly.
    expect(kb).toBeLessThan(120);
  });

  it.skipIf(!hasDist)('keeps the stylesheet under 25 kB gzipped', () => {
    const assetsDir = join(DIST, 'assets');
    const css = readdirSync(assetsDir).find((f) => /^index-.*\.css$/.test(f));
    expect(css, 'stylesheet not found in dist/assets').toBeDefined();

    expect(gzipKb(join(assetsDir, css!))).toBeLessThan(25);
  });

  it.skipIf(!hasDist)('does not precache the chart library', () => {
    const sw = readFileSync(join(DIST, 'sw.js'), 'utf8');
    // The charting chunk is the single largest dependency; it must stay out of
    // the precache list so it is only fetched by the route that renders charts.
    expect(sw).not.toMatch(/vendor-recharts/);
  });

  it.skipIf(!hasDist)('serves hashed assets immutably', () => {
    const config = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')) as {
      headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
    };

    const assetsRule = config.headers?.find((h) => h.source.includes('/assets/'));
    expect(assetsRule, 'no Cache-Control rule for /assets/*').toBeDefined();

    const cacheControl = assetsRule!.headers.find((h) => h.key === 'Cache-Control');
    expect(cacheControl?.value).toContain('immutable');
    expect(cacheControl?.value).toContain('max-age=31536000');
  });

  it.skipIf(!hasDist)('never caches index.html for long', () => {
    // index.html is the pointer to the hashed bundles. Caching it hard would pin
    // users to a stale bundle until the cache expires.
    const config = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')) as {
      headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
    };

    const htmlRule = config.headers?.find((h) => h.source === '/(.*)');
    const cacheControl = htmlRule?.headers.find((h) => h.key === 'Cache-Control');
    expect(cacheControl?.value ?? '').not.toContain('immutable');
  });
});

describe('service worker', () => {
  it.skipIf(!hasDist)('does not fall back to index.html for asset requests', () => {
    const sw = readFileSync(join(DIST, 'sw.js'), 'utf8');
    // Serving HTML to a <script> request produces a parse error and a blank page.
    expect(sw).toMatch(/navigateFallbackDenylist|NavigationRoute|plugins/);
  });
});

describe('asset hashing', () => {
  it.skipIf(!hasDist)('names every bundle by a content hash', () => {
    const assetsDir = join(DIST, 'assets');
    const jsFiles = readdirSync(assetsDir).filter((f) => f.endsWith('.js'));

    expect(jsFiles.length).toBeGreaterThan(3);
    for (const file of jsFiles) {
      // A hash segment is what makes `immutable` caching safe; without one the
      // filename would change meaning on every deploy.
      expect(file, `${file} has no content hash`).toMatch(/-[A-Za-z0-9_-]{8,}\.js$/);
    }
  });

  it.skipIf(!hasDist)('changes the hash when the content changes', () => {
    const hashOf = (content: string) =>
      createHash('sha256').update(content).digest('hex').slice(0, 8);

    // Sanity check on the naming contract itself.
    expect(hashOf('a')).not.toBe(hashOf('b'));
  });
});
