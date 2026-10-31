import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Guards the theme contract in `index.css`.
 *
 * These assertions exist because Sprint 2 replaced ~900 lines of
 * `[data-theme=x] .bg-\[\#7132f5\] { ... !important }` overrides with a single
 * token set. If someone reintroduces an override block, or a theme forgets to
 * define a token, the app silently falls back to the Kraken palette — so the
 * contract is checked, not assumed.
 */

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

const THEMES = ['coinbase', 'theverge', 'autumn', 'mongodb'] as const;

const REQUIRED_TOKENS = [
  '--brand-primary',
  '--brand-primary-hover',
  '--brand-primary-active',
  '--brand-soft',
  '--brand-soft-hover',
  '--brand-text',
  '--on-brand',
  '--bg-canvas',
  '--bg-surface',
  '--bg-surface-raised',
  '--bg-surface-sunken',
  '--text-primary',
  '--text-secondary',
  '--text-tertiary',
  '--border-default',
  '--border-strong',
];

/** Extracts the declaration block that follows a selector. */
function blockFor(selector: string): string {
  const start = css.indexOf(selector);
  if (start < 0) return '';
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return open < 0 || close < 0 ? '' : css.slice(open + 1, close);
}

describe('theme token contract', () => {
  it('declares the @theme inline mapping so utilities emit var()', () => {
    expect(css).toContain('@theme inline');
    expect(css).toContain('--color-brand: var(--brand-primary)');
    expect(css).toContain('--color-surface: var(--bg-surface)');
    expect(css).toContain('--color-ink: var(--text-primary)');
    expect(css).toContain('--color-hairline: var(--border-default)');
  });

  it('defines the full token set on :root (Kraken baseline)', () => {
    const root = blockFor(':root');
    REQUIRED_TOKENS.forEach((token) => {
      expect(root, `:root is missing ${token}`).toContain(`${token}:`);
    });
  });

  it('overrides every token in the dark baseline', () => {
    const dark = blockFor('.dark {');
    // --on-brand intentionally stays white in dark mode for every system.
    REQUIRED_TOKENS.filter((token) => token !== '--on-brand').forEach((token) => {
      expect(dark, `.dark is missing ${token}`).toContain(`${token}:`);
    });
  });

  it.each(THEMES)('%s defines the full token set for light mode', (theme) => {
    const block = blockFor(`[data-theme=${theme}] {`);
    expect(block.length, `missing base block for ${theme}`).toBeGreaterThan(0);
    REQUIRED_TOKENS.forEach((token) => {
      expect(block, `${theme} light is missing ${token}`).toContain(`${token}:`);
    });
  });

  it.each(THEMES)('%s defines the full token set for dark mode', (theme) => {
    const block = blockFor(`[data-theme=${theme}].dark {`);
    expect(block.length, `missing dark block for ${theme}`).toBeGreaterThan(0);
    REQUIRED_TOKENS.filter((token) => token !== '--on-brand').forEach((token) => {
      expect(block, `${theme} dark is missing ${token}`).toContain(`${token}:`);
    });
  });

  it('uses a readable text colour on each brand fill', () => {
    // Mint and MongoDB green are light fills: white text on them is unreadable.
    expect(blockFor('[data-theme=theverge] {')).toContain('--on-brand: #000000');
    expect(blockFor('[data-theme=mongodb] {')).toContain('--on-brand: #001e2b');
    // Coinbase blue and Kraken purple are dark fills: white text is correct.
    expect(blockFor('[data-theme=coinbase] {')).toContain('--on-brand: #ffffff');
  });
});

describe('legacy override cleanup', () => {
  it('no longer contains per-theme utility override blocks', () => {
    // The old pattern was `[data-theme=x] .bg-\[\#7132f5\]` — a theme selector
    // immediately followed by an escaped utility class.
    const overridePattern = /\[data-theme=\w+\][^{]*\.(?:bg|text|border|divide)-\\\[#/g;
    const matches = css.match(overridePattern) ?? [];
    expect(matches).toEqual([]);
  });

  it('keeps the stylesheet compact', () => {
    const lines = css.split('\n').length;
    // Was 1568 lines with 344 !important declarations before the refactor.
    expect(lines).toBeLessThan(900);
  });

  it('has far fewer !important declarations than before', () => {
    const count = (css.match(/!important/g) ?? []).length;
    expect(count).toBeLessThan(120);
  });
});

describe('compatibility bridge', () => {
  it('still maps the legacy brand utility onto the token', () => {
    // Until every hex utility is gone from the markup, this rule is what makes
    // `bg-[#7132f5]` follow the active theme.
    expect(css).toContain('.bg-\\[\\#7132f5\\]');
    expect(css).toContain('background-color: var(--brand-primary) !important');
  });
});
