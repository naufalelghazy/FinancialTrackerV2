import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Account, Category, Transaction } from '../types';
import {
  calculateAccountBalances,
  readLocalSnapshot,
  writeLocalSnapshot,
} from '../services/financialService';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES } from '../lib/constants';

export interface LedgerState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}

/**
 * A mutation of the ledger.
 *
 * Written as a function of the *current* state rather than a patch object on
 * purpose. Two writes can be in flight at once (a quick-template tap while a
 * manual save is still posting), and a patch computed from a snapshot taken
 * before an `await` would silently revert whatever landed in between. Updaters
 * always run against the freshest value, so concurrent writes compose instead of
 * clobbering each other.
 */
export type LedgerUpdater = (current: LedgerState) => Partial<LedgerState>;

/** Reads the offline snapshot, falling back to the seed data on a cold start. */
function readInitialLedger(): LedgerState {
  const snapshot = readLocalSnapshot();
  return {
    accounts: snapshot.accounts.length > 0 ? snapshot.accounts : INITIAL_ACCOUNTS,
    categories: snapshot.categories.length > 0 ? snapshot.categories : INITIAL_CATEGORIES,
    transactions: snapshot.transactions,
  };
}

/** Recomputes balances; the only place they are ever derived. */
function derive(state: LedgerState): LedgerState {
  return { ...state, accounts: calculateAccountBalances(state.accounts, state.transactions) };
}

/**
 * Owns the three data slices that must always change together.
 *
 * The previous implementation kept `accounts`, `categories` and `transactions`
 * as three independent `useState` hooks and re-derived balances by hand in
 * fourteen places. That made it possible to update one slice without the others,
 * which is how a balance could drift from the transactions behind it.
 *
 * Here a single `commit` writes all three slices in one update and derives the
 * balances, so an inconsistent intermediate state cannot be rendered.
 */
export function useLedger() {
  const [ledger, setLedger] = useState<LedgerState>(readInitialLedger);

  // Mirrors the committed value so a handler can read the latest state without
  // waiting for a re-render (and without a stale closure).
  const ledgerRef = useRef(ledger);
  useEffect(() => {
    ledgerRef.current = ledger;
  }, [ledger]);

  /**
   * Applies a mutation, recalculates balances, and persists the result.
   * Returns the state as it was immediately before this commit, which is the
   * token a caller passes to `restore` when the server rejects the write.
   */
  const commit = useCallback((updater: LedgerUpdater): LedgerState => {
    const previous = ledgerRef.current;
    const patch = updater(previous);
    const next = derive({
      accounts: patch.accounts ?? previous.accounts,
      categories: patch.categories ?? previous.categories,
      transactions: patch.transactions ?? previous.transactions,
    });

    ledgerRef.current = next;
    setLedger(next);
    writeLocalSnapshot(next);
    return previous;
  }, []);

  /** Replaces the whole ledger after a successful fetch. */
  const replace = useCallback((next: LedgerState) => {
    const resolved = derive(next);
    ledgerRef.current = resolved;
    setLedger(resolved);
    writeLocalSnapshot(resolved);
    return resolved;
  }, []);

  /**
   * Restores a snapshot captured by `commit()`.
   *
   * Balances are recomputed on the way back in so a restore can never reintroduce
   * a stale figure even if the token was somehow modified downstream.
   */
  const restore = useCallback((previous: LedgerState) => {
    const resolved = derive(previous);
    ledgerRef.current = resolved;
    setLedger(resolved);
    writeLocalSnapshot(resolved);
  }, []);

  /** Reads the current ledger without waiting for a re-render. */
  const getLedger = useCallback(() => ledgerRef.current, []);

  return useMemo(
    () => ({ ...ledger, commit, replace, restore, getLedger }),
    [ledger, commit, replace, restore, getLedger]
  );
}

export type Ledger = ReturnType<typeof useLedger>;
