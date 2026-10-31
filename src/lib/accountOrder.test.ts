import { describe, expect, it } from 'vitest';
import {
  applyAccountOrder,
  compareAccountsByDisplayOrder,
  moveId,
  sortAccountsForDisplay,
} from './accountOrder';
import type { Account } from '../types';

function acc(name: string, sortOrder?: number): Account {
  return { id: name.toLowerCase(), name, type: 'bank', balance: 0, sortOrder };
}

describe('compareAccountsByDisplayOrder', () => {
  it('orders by sortOrder when both sides have one', () => {
    const list = [acc('C', 2), acc('A', 0), acc('B', 1)];
    expect(sortAccountsForDisplay(list).map((a) => a.name)).toEqual(['A', 'B', 'C']);
  });

  it('places accounts without sortOrder after those with one', () => {
    const list = [acc('Zebra'), acc('Bravo', 1), acc('Alpha')];
    expect(sortAccountsForDisplay(list).map((a) => a.name)).toEqual([
      'Bravo',
      'Alpha',
      'Zebra',
    ]);
  });

  it('breaks ties alphabetically, case-insensitively', () => {
    const list = [acc('bca'), acc('BCA Digital'), acc('Anchor')];
    expect(sortAccountsForDisplay(list).map((a) => a.name)).toEqual([
      'Anchor',
      'bca',
      'BCA Digital',
    ]);
  });

  it('treats a non-finite sortOrder as absent', () => {
    const list = [acc('Zeta', Number.NaN), acc('Alpha', 0)];
    expect(sortAccountsForDisplay(list).map((a) => a.name)).toEqual(['Alpha', 'Zeta']);
    expect(compareAccountsByDisplayOrder(acc('Zeta', Number.NaN), acc('Alpha', 0))).toBeGreaterThan(0);
  });

  it('does not mutate the input array', () => {
    const list = [acc('B', 1), acc('A', 0)];
    const snapshot = [...list];
    sortAccountsForDisplay(list);
    expect(list).toEqual(snapshot);
  });
});

describe('applyAccountOrder', () => {
  it('renumbers every account 0..n-1 following the given ids', () => {
    const accounts = [acc('A'), acc('B'), acc('C')];
    const next = applyAccountOrder(accounts, ['c', 'a', 'b']);
    const order = next.map((a) => [a.name, a.sortOrder]);
    expect(order).toEqual([
      ['A', 1],
      ['B', 2],
      ['C', 0],
    ]);
  });

  it('leaves accounts missing from the list untouched', () => {
    const accounts = [acc('A', 5), acc('B')];
    const next = applyAccountOrder(accounts, ['b']);
    expect(next.find((a) => a.name === 'A')?.sortOrder).toBe(5);
    expect(next.find((a) => a.name === 'B')?.sortOrder).toBe(0);
  });

  it('overwrites stale numbers so no duplicates remain', () => {
    const accounts = [acc('A', 0), acc('B', 0), acc('C', 0)];
    const next = applyAccountOrder(accounts, ['b', 'c', 'a']);
    expect(next.map((a) => a.sortOrder)).toEqual([2, 0, 1]);
    expect(new Set(next.map((a) => a.sortOrder)).size).toBe(3);
  });
});

describe('moveId', () => {
  it('moves an id down', () => {
    expect(moveId(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('moves an id up', () => {
    expect(moveId(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('is a no-op when from equals to', () => {
    const ids = ['a', 'b', 'c'];
    expect(moveId(ids, 1, 1)).toEqual(ids);
  });

  it('never loses or duplicates an id', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const moved = moveId(ids, 3, 0);
    expect([...moved].sort()).toEqual([...ids].sort());
  });
});
