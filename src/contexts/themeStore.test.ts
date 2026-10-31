import { describe, expect, it } from 'vitest';
import { DESIGN_SYSTEMS, DESIGN_SYSTEM_ORDER, type DesignSystem } from './themeStore';

const ALL: DesignSystem[] = ['coinbase', 'theverge', 'kraken', 'autumn', 'mongodb'];

describe('DESIGN_SYSTEMS registry', () => {
  it('has an entry for every design system', () => {
    ALL.forEach((id) => expect(DESIGN_SYSTEMS[id]).toBeDefined());
  });

  it('keys every entry by its own id', () => {
    ALL.forEach((id) => expect(DESIGN_SYSTEMS[id].id).toBe(id));
  });

  it('orders exactly the five design systems, without duplicates', () => {
    expect(DESIGN_SYSTEM_ORDER).toHaveLength(5);
    expect(new Set(DESIGN_SYSTEM_ORDER).size).toBe(5);
    DESIGN_SYSTEM_ORDER.forEach((id) => expect(ALL).toContain(id));
  });

  it.each(ALL)('%s defines the fields the Theme Studio renders', (id) => {
    const config = DESIGN_SYSTEMS[id];
    expect(config.name.length).toBeGreaterThan(0);
    expect(config.tagline.length).toBeGreaterThan(0);
    expect(config.badge.length).toBeGreaterThan(0);
    expect(config.description.length).toBeGreaterThan(0);
    expect(config.buttonStyle.length).toBeGreaterThan(0);
    expect(config.previewLabel.length).toBeGreaterThan(0);
  });

  it.each(ALL)('%s uses valid hex colours', (id) => {
    const config = DESIGN_SYSTEMS[id];
    const hex = /^#[0-9a-fA-F]{6}$/;
    expect(config.primaryColor).toMatch(hex);
    expect(config.accentColor).toMatch(hex);
    expect(config.canvasBg.light).toMatch(hex);
    expect(config.canvasBg.dark).toMatch(hex);
  });

  it.each(ALL)('%s declares display, body and mono families', (id) => {
    const config = DESIGN_SYSTEMS[id];
    expect(config.fontDisplay.length).toBeGreaterThan(0);
    expect(config.fontSans.length).toBeGreaterThan(0);
    expect(config.fontMono.length).toBeGreaterThan(0);
  });

  it.each(ALL)('%s has a distinct light and dark canvas', (id) => {
    const config = DESIGN_SYSTEMS[id];
    // The Verge is dark-first but still has a separate light canvas value.
    expect(config.canvasBg.light).not.toBe(config.canvasBg.dark);
  });
});
