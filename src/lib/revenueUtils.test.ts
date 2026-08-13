import { describe, it, expect } from 'vitest';
import { parseAmount, resolveEntryDate, groupAmountsByMonth, groupAmountsByDay, sumAmountsInMonth } from './revenueUtils';

describe('revenueUtils - parseAmount', () => {
  it('returns numbers as-is', () => {
    expect(parseAmount(150)).toBe(150);
  });

  it('parses currency-formatted strings', () => {
    expect(parseAmount('1 250.50 MAD')).toBeCloseTo(1250.50);
    expect(parseAmount('170.00 MAD')).toBeCloseTo(170);
  });

  it('returns 0 for empty/undefined values', () => {
    expect(parseAmount(undefined)).toBe(0);
    expect(parseAmount(null)).toBe(0);
    expect(parseAmount('')).toBe(0);
  });
});

describe('revenueUtils - resolveEntryDate', () => {
  it('prefers a Firestore Timestamp-like createdAt over the date string', () => {
    const fakeTimestamp = { toDate: () => new Date('2026-03-01T00:00:00Z') };
    const d = resolveEntryDate({ createdAt: fakeTimestamp, date: '01/01/2020' });
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(2);
  });

  it('falls back to the date string when no createdAt is present', () => {
    const d = resolveEntryDate({ date: '2026-05-10' });
    expect(d.getUTCFullYear()).toBe(2026);
  });
});

describe('revenueUtils - groupAmountsByMonth', () => {
  it('aggregates entries into the correct month bucket, sorted chronologically', () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15);
    const entries = [
      { amount: 100, createdAt: { toDate: () => thisMonth } },
      { amount: '50.00 MAD', createdAt: { toDate: () => thisMonth } }
    ];
    const result = groupAmountsByMonth(entries, 3);
    expect(result).toHaveLength(3);
    expect(result[result.length - 1].total).toBeCloseTo(150);
    // chronological order
    expect(result[0].sortKey).toBeLessThan(result[1].sortKey);
    expect(result[1].sortKey).toBeLessThan(result[2].sortKey);
  });

  it('ignores entries outside the requested window', () => {
    const oldEntry = [{ amount: 999, date: '2000-01-01' }];
    const result = groupAmountsByMonth(oldEntry, 3);
    const total = result.reduce((sum, m) => sum + m.total, 0);
    expect(total).toBe(0);
  });
});

describe('revenueUtils - groupAmountsByDay', () => {
  it('sums amounts per day and sorts chronologically', () => {
    const entries = [
      { amount: 100, date: '02/01/2026' },
      { amount: 50, date: '01/01/2026' },
      { amount: 25, date: '01/01/2026' }
    ];
    const result = groupAmountsByDay(entries);
    expect(result.map(r => r.total)).toEqual([75, 100]);
  });
});

describe('revenueUtils - sumAmountsInMonth', () => {
  it('sums only entries in the given month/year', () => {
    const entries = [
      { amount: 100, createdAt: { toDate: () => new Date(2026, 2, 5) } },
      { amount: 200, createdAt: { toDate: () => new Date(2026, 3, 5) } }
    ];
    expect(sumAmountsInMonth(entries, 2, 2026)).toBe(100);
    expect(sumAmountsInMonth(entries, 3, 2026)).toBe(200);
    expect(sumAmountsInMonth(entries, 5, 2026)).toBe(0);
  });
});
