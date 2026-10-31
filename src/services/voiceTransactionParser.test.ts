import { describe, expect, it } from 'vitest';
import {
  deduplicateRepeatingPhrases,
  extractAmountFromVoiceText,
  levenshteinDistance,
  parseVoiceTransaction,
  stringSimilarity,
} from './voiceTransactionParser';
import { shiftLocalDays, todayLocalISO } from '../lib/date';
import type { Account, Category, QuickTemplate, Transaction } from '../types';

function account(id: string, name: string, type: Account['type'] = 'bank'): Account {
  return { id, name, type, balance: 0, initialBalance: 0 };
}

function category(id: string, name: string, type: Category['type'] = 'pengeluaran'): Category {
  return { id, name, type, emoji: '🏷️' };
}

const accounts: Account[] = [
  account('a-bca', 'BCA'),
  account('a-gopay', 'GoPay', 'ewallet'),
  account('a-cash', 'CASH', 'cash'),
  account('a-jago', 'Jago'),
];

const categories: Category[] = [
  category('c-makan', 'Makan'),
  category('c-transport', 'Transport'),
  category('c-tagihan', 'Tagihan'),
  category('c-gaji', 'Gaji', 'pemasukan'),
];

describe('levenshteinDistance', () => {
  it('is zero for identical strings', () => {
    expect(levenshteinDistance('bca', 'bca')).toBe(0);
  });

  it('counts a substitution', () => {
    expect(levenshteinDistance('bca', 'bce')).toBe(1);
  });

  it('counts an insertion', () => {
    expect(levenshteinDistance('bc', 'bca')).toBe(1);
  });

  it('counts a deletion', () => {
    expect(levenshteinDistance('bca', 'bc')).toBe(1);
  });

  it('equals the other length when one side is empty', () => {
    expect(levenshteinDistance('', 'mandiri')).toBe(7);
    expect(levenshteinDistance('mandiri', '')).toBe(7);
  });
});

describe('stringSimilarity', () => {
  it('is 1 for identical strings ignoring case', () => {
    expect(stringSimilarity('BCA', 'bca')).toBe(1);
  });

  it('is 0 when either side is empty', () => {
    expect(stringSimilarity('', 'bca')).toBe(0);
  });

  it('is high for a one-letter typo', () => {
    expect(stringSimilarity('mandiri', 'mandri')).toBeGreaterThan(0.8);
  });

  it('is low for unrelated words', () => {
    expect(stringSimilarity('bca', 'makan')).toBeLessThan(0.4);
  });
});

describe('deduplicateRepeatingPhrases', () => {
  it('collapses a repeated single word', () => {
    expect(deduplicateRepeatingPhrases('kopi kopi')).toBe('kopi');
  });

  it('collapses a repeated two-word phrase', () => {
    expect(deduplicateRepeatingPhrases('beli kopi beli kopi')).toBe('beli kopi');
  });

  it('leaves a clean sentence untouched', () => {
    expect(deduplicateRepeatingPhrases('beli kopi susu')).toBe('beli kopi susu');
  });

  it('handles empty input', () => {
    expect(deduplicateRepeatingPhrases('')).toBe('');
  });

  it('normalises the whitespace of a one-word input', () => {
    expect(deduplicateRepeatingPhrases('  kopi  ')).toBe('kopi');
  });
});

describe('extractAmountFromVoiceText', () => {
  it('reads an explicit Rp prefix', () => {
    expect(extractAmountFromVoiceText('bayar rp35.000 di indomaret')?.amount).toBe(35000);
  });

  it('reads an Rp prefix without a space', () => {
    expect(extractAmountFromVoiceText('rp50000')?.amount).toBe(50000);
  });

  it('reads IDR', () => {
    expect(extractAmountFromVoiceText('idr 25.000')?.amount).toBe(25000);
  });

  it('reads a "juta" suffix', () => {
    expect(extractAmountFromVoiceText('bayar 1,5 juta')?.amount).toBe(1500000);
  });

  it('reads "jt"', () => {
    expect(extractAmountFromVoiceText('2jt')?.amount).toBe(2000000);
  });

  it('reads a "miliar" suffix', () => {
    expect(extractAmountFromVoiceText('2 miliar')?.amount).toBe(2000000000);
  });

  it('reads "ribu"', () => {
    expect(extractAmountFromVoiceText('35 ribu')?.amount).toBe(35000);
  });

  it('reads "rb"', () => {
    expect(extractAmountFromVoiceText('25rb')?.amount).toBe(25000);
  });

  it('reads "k"', () => {
    expect(extractAmountFromVoiceText('50k')?.amount).toBe(50000);
  });

  it('reads "rebu"', () => {
    expect(extractAmountFromVoiceText('10 rebu')?.amount).toBe(10000);
  });

  it.each([
    ['ceban', 10000],
    ['goceng', 5000],
    ['gocap', 50000],
    ['noban', 20000],
    ['cepek', 100000],
    ['seceng', 1000],
    ['gopek', 500],
  ])('reads the slang word %s', (word, expected) => {
    expect(extractAmountFromVoiceText(`bayar ${word}`)?.amount).toBe(expected);
  });

  it('reads a dot-grouped number', () => {
    expect(extractAmountFromVoiceText('makan 50.000')?.amount).toBe(50000);
  });

  it('reads a "rupiah" suffix', () => {
    expect(extractAmountFromVoiceText('50000 rupiah')?.amount).toBe(50000);
  });

  it('reads a "perak" suffix', () => {
    expect(extractAmountFromVoiceText('2000 perak')?.amount).toBe(2000);
  });

  it.each([
    ['tiga puluh lima ribu', 35000],
    ['seratus ribu', 100000],
    ['dua juta', 2000000],
    ['seribu', 1000],
    ['empat puluh lima ribu', 45000],
    ['satu juta lima ratus ribu', 1500000],
  ])('spells out %s', (text, expected) => {
    expect(extractAmountFromVoiceText(text)?.amount).toBe(expected);
  });

  it('reads a plain four-digit number', () => {
    expect(extractAmountFromVoiceText('bayar 15000')?.amount).toBe(15000);
  });

  it('returns null when there is no amount', () => {
    expect(extractAmountFromVoiceText('beli kopi')).toBeNull();
  });

  it('ignores a zero amount', () => {
    expect(extractAmountFromVoiceText('rp0')).toBeNull();
  });

  it('reports the matched fragment for note cleanup', () => {
    expect(extractAmountFromVoiceText('kopi 25rb')?.matchedText).toBe('25rb');
  });
});

describe('parseVoiceTransaction', () => {
  it('parses a simple expense', () => {
    const parsed = parseVoiceTransaction('beli kopi 25rb pakai bca', accounts, categories);

    expect(parsed.type).toBe('pengeluaran');
    expect(parsed.amount).toBe(25000);
    expect(parsed.sourceAccountId).toBe('a-bca');
    expect(parsed.notes.toLowerCase()).toContain('kopi');
  });

  it('detects income from a salary keyword', () => {
    const parsed = parseVoiceTransaction('terima gaji 5 juta', accounts, categories);
    expect(parsed.type).toBe('pemasukan');
    expect(parsed.amount).toBe(5000000);
  });

  it('detects a transfer from the "transfer" keyword', () => {
    const parsed = parseVoiceTransaction('transfer 100rb dari bca ke gopay', accounts, categories);
    expect(parsed.type).toBe('transfer');
    expect(parsed.amount).toBe(100000);
    expect(parsed.sourceAccountId).toBe('a-bca');
    expect(parsed.destinationAccountId).toBe('a-gopay');
  });

  it('detects a transfer from the "pindah" keyword', () => {
    expect(parseVoiceTransaction('pindah 50rb ke jago', accounts, categories).type).toBe('transfer');
  });

  it('detects a transfer from the "top up" keyword', () => {
    expect(parseVoiceTransaction('top up gopay 100rb', accounts, categories).type).toBe('transfer');
  });

  it('never assigns a category to a transfer', () => {
    const parsed = parseVoiceTransaction('transfer 100rb dari bca ke gopay', accounts, categories);
    expect(parsed.categoryId).toBeUndefined();
    expect(parsed.confidence.category).toBe(true);
  });

  it('matches a category through a synonym', () => {
    const parsed = parseVoiceTransaction('beli bakso 20rb', accounts, categories);
    expect(parsed.categoryId).toBe('c-makan');
  });

  it('matches the "Tagihan" category from "listrik"', () => {
    const parsed = parseVoiceTransaction('bayar listrik 200rb', accounts, categories);
    expect(parsed.categoryId).toBe('c-tagihan');
  });

  it('falls back to CASH when no account is spoken', () => {
    expect(parseVoiceTransaction('beli kopi 10rb', accounts, categories).sourceAccountId).toBe(
      'a-cash'
    );
  });

  it('tolerates a mis-heard account name', () => {
    const parsed = parseVoiceTransaction('beli kopi 20rb pakai mandri', accounts, categories);
    // No "mandiri" account exists; the parser must still pick a valid account.
    expect(accounts.some((a) => a.id === parsed.sourceAccountId)).toBe(true);
  });

  it('parses a date as today in local time', () => {
    expect(parseVoiceTransaction('beli kopi 10rb', accounts, categories).date).toBe(todayLocalISO());
  });

  it('parses "kemarin" as yesterday in local time', () => {
    expect(parseVoiceTransaction('kemarin beli kopi 10rb', accounts, categories).date).toBe(
      shiftLocalDays(-1)
    );
  });

  it('never returns a UTC-shifted date', () => {
    const parsed = parseVoiceTransaction('beli kopi 10rb', accounts, categories);
    // The bug produced a date one day behind between 00:00 and 06:59 WIB.
    expect(parsed.date).toBe(todayLocalISO());
  });

  it('removes the amount and account words from the notes', () => {
    const parsed = parseVoiceTransaction('beli kopi 25rb pakai bca', accounts, categories);
    expect(parsed.notes.toLowerCase()).not.toContain('25rb');
    expect(parsed.notes.toLowerCase()).not.toContain('bca');
  });

  it('capitalises the notes', () => {
    const parsed = parseVoiceTransaction('beli kopi 10rb', accounts, categories);
    expect(parsed.notes.charAt(0)).toBe(parsed.notes.charAt(0).toUpperCase());
  });

  it('falls back to the category name when the notes end up empty', () => {
    const parsed = parseVoiceTransaction('makan 20rb', accounts, categories);
    expect(parsed.notes.length).toBeGreaterThan(0);
  });

  it('leaves the amount null when nothing is spoken', () => {
    const parsed = parseVoiceTransaction('beli kopi', accounts, categories);
    expect(parsed.amount).toBeNull();
    expect(parsed.confidence.amount).toBe(false);
  });

  it('collapses a stuttered transcript', () => {
    const parsed = parseVoiceTransaction('beli kopi beli kopi 25rb', accounts, categories);
    expect(parsed.amount).toBe(25000);
    expect(parsed.notes.toLowerCase().match(/kopi/g)?.length).toBe(1);
  });

  it('uses a matching quick template', () => {
    const templates: QuickTemplate[] = [
      {
        id: 'tpl-1',
        name: 'Kopi Kenangan',
        type: 'pengeluaran',
        amount: 22000,
        sourceAccountId: 'a-gopay',
        categoryId: 'c-makan',
        emoji: '☕',
      },
    ];

    const parsed = parseVoiceTransaction('kopi kenangan', accounts, categories, templates);
    expect(parsed.matchedTemplate).toMatchObject({ id: 'tpl-1', name: 'Kopi Kenangan' });
    expect(parsed.amount).toBe(22000);
    expect(parsed.sourceAccountId).toBe('a-gopay');
  });

  it('prefers a spoken amount over the template amount', () => {
    const templates: QuickTemplate[] = [
      {
        id: 'tpl-1',
        name: 'Kopi Kenangan',
        type: 'pengeluaran',
        amount: 22000,
        sourceAccountId: 'a-gopay',
      },
    ];

    const parsed = parseVoiceTransaction('kopi kenangan 30rb', accounts, categories, templates);
    expect(parsed.amount).toBe(30000);
  });

  it('predicts the account from transaction history', () => {
    const history: Transaction[] = [
      {
        id: 'h1',
        date: '2026-01-01',
        type: 'pengeluaran',
        amount: 20000,
        sourceAccountId: 'a-jago',
        categoryId: 'c-makan',
        notes: 'beli bakso',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const parsed = parseVoiceTransaction('bakso 25rb', accounts, categories, [], history);
    expect(parsed.sourceAccountId).toBe('a-jago');
    expect(parsed.predictedFromHistory?.account).toBe(true);
  });

  it('ignores history that points at a deleted account', () => {
    const history: Transaction[] = [
      {
        id: 'h1',
        date: '2026-01-01',
        type: 'pengeluaran',
        amount: 20000,
        sourceAccountId: 'a-hilang',
        notes: 'beli bakso',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const parsed = parseVoiceTransaction('bakso 25rb', accounts, categories, [], history);
    expect(accounts.some((a) => a.id === parsed.sourceAccountId)).toBe(true);
  });

  it('keeps the raw transcript', () => {
    const transcript = 'beli kopi 10rb';
    expect(parseVoiceTransaction(transcript, accounts, categories).rawTranscript).toBe(transcript);
  });

  it('has a complete confidence object', () => {
    const parsed = parseVoiceTransaction('beli kopi 10rb', accounts, categories);
    expect(parsed.confidence).toEqual({
      amount: true,
      account: true,
      category: true,
      type: true,
    });
  });

  it('survives an empty transcript', () => {
    const parsed = parseVoiceTransaction('', accounts, categories);
    expect(parsed.type).toBe('pengeluaran');
    expect(parsed.amount).toBeNull();
  });

  it('survives empty account and category lists', () => {
    const parsed = parseVoiceTransaction('beli kopi 10rb', [], []);
    expect(parsed.amount).toBe(10000);
    expect(parsed.sourceAccountId).toBeUndefined();
  });
});
