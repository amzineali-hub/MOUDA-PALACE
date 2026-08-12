import { describe, it, expect } from 'vitest';
import { resolveItemPrice } from './priceUtils';

describe('priceUtils - resolveItemPrice', () => {
  it('prefers averageCost when present', () => {
    expect(resolveItemPrice({ averageCost: 10, unitPrice: 20, price: 30, cost: 40 })).toBe(10);
  });

  it('falls back to unitPrice when averageCost is missing', () => {
    expect(resolveItemPrice({ unitPrice: 20, price: 30, cost: 40 })).toBe(20);
  });

  it('falls back to price when averageCost and unitPrice are missing', () => {
    expect(resolveItemPrice({ price: 30, cost: 40 })).toBe(30);
  });

  it('falls back to cost as a last resort', () => {
    expect(resolveItemPrice({ cost: 40 })).toBe(40);
  });

  it('treats 0 as missing and falls through to the next field', () => {
    expect(resolveItemPrice({ averageCost: 0, price: 15 })).toBe(15);
  });

  it('parses numeric strings', () => {
    expect(resolveItemPrice({ averageCost: '12.5' })).toBe(12.5);
  });

  it('returns 0 when nothing is set', () => {
    expect(resolveItemPrice({})).toBe(0);
    expect(resolveItemPrice(null)).toBe(0);
    expect(resolveItemPrice(undefined)).toBe(0);
  });
});
