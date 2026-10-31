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

/**
 * Tokens that only need to exist once, on `:root` and `.dark`.
 *
 * Semantic colours are global on purpose: money in must read as positive in
 * every design system rather than being re-tuned per theme. The bills-card
 * gradient works the same way -- a theme that wants a different card overrides
 * these four values instead of re-declaring the whole gradient. All of them
 * inherit into every `[data-theme]` scope, so requiring them per theme would
 * only add copy-paste.
 */
const GLOBAL_ONLY_TOKENS = [
  '--positive',
  '--positive-bright',
  '--positive-soft',
  '--negative',
  '--negative-bright',
  '--negative-soft',
  '--warning',
  '--warning-bright',
  '--warning-soft',
  '--debt-from',
  '--debt-to',
  '--debt-border',
  '--debt-shadow',
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
    [...REQUIRED_TOKENS, ...GLOBAL_ONLY_TOKENS].forEach((token) => {
      expect(root, `:root is missing ${token}`).toContain(`${token}:`);
    });
  });

  it('overrides every token in the dark baseline', () => {
    const dark = blockFor('.dark {');
    // --on-brand intentionally stays white in dark mode for every system.
    [...REQUIRED_TOKENS, ...GLOBAL_ONLY_TOKENS]
      .filter((token) => token !== '--on-brand')
      .forEach((token) => {
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
    // Mint is a light fill: white text on it is unreadable.
    expect(blockFor('[data-theme=theverge] {')).toContain('--on-brand: #000000');
    // MongoDB's fill is a deep teal-green now, so white text is correct.
    expect(blockFor('[data-theme=mongodb] {')).toContain('--on-brand: #ffffff');
    // Coinbase blue and Kraken purple are dark fills: white text is correct.
    expect(blockFor('[data-theme=coinbase] {')).toContain('--on-brand: #ffffff');
  });

  it('keeps MongoDB brand fills dark enough for white text', () => {
    // Regression: #00ed64 as a large fill glares against a white canvas.
    const block = blockFor('[data-theme=mongodb] {');
    expect(block).toContain('--brand-primary: #00684a');
    expect(block).not.toContain('--brand-primary: #00ed64');

    // Dark mode cannot use such a deep green on a dark canvas.
    expect(blockFor('[data-theme=mongodb].dark {')).toContain('--brand-primary: #00a845');
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

  it('no longer needs !important to beat hard-coded utilities', () => {
    // The bridge carried ~34 `!important` declarations to force theme tokens
    // over hex utilities in the markup. Once the markup uses the tokens
    // directly, none of it is needed. Two remain in explanatory comments.
    const count = (css.match(/!important/g) ?? []).length;
    expect(count).toBeLessThanOrEqual(2);
  });
});

describe('compatibility bridge', () => {
  it('is gone: the markup no longer relies on a hex-to-token override layer', () => {
    // Regression guard in the opposite direction. If a hex utility is ever
    // reintroduced *and* relied upon for theming, this fails and points at the
    // block that used to paper over it.
    const escapedHexSelectors = css.match(/^[^{}\n]*\.(?:bg|text|border|ring|divide|outline|focus)[^{}\n]*\\\[\\#/gm) ?? [];
    expect(escapedHexSelectors).toEqual([]);
    expect(css).not.toContain('LEGACY COMPATIBILITY BRIDGE');
  });

  it('has no per-theme override blocks competing with utilities', () => {
    // `[data-theme=x] .some-class { … !important }` was the original problem.
    const overrides = css.match(/\[data-theme=\w+\][^{]*\{[^}]*!important[^}]*\}/g) ?? [];
    expect(overrides).toHaveLength(0);
  });
});
