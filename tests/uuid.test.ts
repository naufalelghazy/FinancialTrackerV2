import { describe, expect, it } from 'vitest';
import { isUuid, toUuidOrNull } from '../src/lib/uuid';

describe('isUuid', () => {
  it('accepts a canonical uuid', () => {
    expect(isUuid('3f2b8c1e-9d4a-4b6f-8e2c-1a7b3c5d9e0f')).toBe(true);
  });

  it('accepts uppercase', () => {
    expect(isUuid('3F2B8C1E-9D4A-4B6F-8E2C-1A7B3C5D9E0F')).toBe(true);
  });

  it('rejects the seeded ids that caused 22P02', () => {
    // These are the real ids from `lib/constants`; the database column is uuid,
    // so writing one of them is rejected permanently.
    expect(isUuid('cash')).toBe(false);
    expect(isUuid('bca')).toBe(false);
    expect(isUuid('makan')).toBe(false);
    expect(isUuid('tpl_kopi')).toBe(false);
  });

  it('rejects near-miss formats', () => {
    expect(isUuid('3f2b8c1e9d4a4b6f8e2c1a7b3c5d9e0f')).toBe(false); // no dashes
    expect(isUuid('3f2b8c1e-9d4a-4b6f-8e2c-1a7b3c5d9e0')).toBe(false); // short
    expect(isUuid('3f2b8c1e-9d4a-4b6f-8e2c-1a7b3c5d9e0fg')).toBe(false); // non-hex
    expect(isUuid('')).toBe(false);
  });

  it('rejects non-strings without throwing', () => {
    // Row ids come from `localStorage` JSON, so the type is not guaranteed.
    expect(isUuid(undefined)).toBe(false);
    expect(isUuid(null)).toBe(false);
    expect(isUuid(42)).toBe(false);
    expect(isUuid({})).toBe(false);
  });
});

describe('toUuidOrNull', () => {
  it('passes a uuid through', () => {
    expect(toUuidOrNull('3f2b8c1e-9d4a-4b6f-8e2c-1a7b3c5d9e0f')).toBe(
      '3f2b8c1e-9d4a-4b6f-8e2c-1a7b3c5d9e0f'
    );
  });

  it('turns a seed id into NULL instead of sending it', () => {
    // A foreign key pointing at a seeded account must be NULL, not the string
    // 'gopay', which would fail the same way the primary key did.
    expect(toUuidOrNull('gopay')).toBeNull();
    expect(toUuidOrNull(undefined)).toBeNull();
    expect(toUuidOrNull(null)).toBeNull();
  });
});
