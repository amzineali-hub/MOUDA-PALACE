import { describe, expect, it } from 'vitest';
import {
  calculatePosSubtotal,
  createPosOrderId,
  getLineTotal,
  parsePosPrice
} from './posUtils';

describe('POS utilities', () => {
  it('parses numeric and formatted prices safely', () => {
    expect(parsePosPrice('25 MAD')).toBe(25);
    expect(parsePosPrice('12,50 MAD')).toBe(12.5);
    expect(parsePosPrice('invalid')).toBe(0);
    expect(parsePosPrice(18)).toBe(18);
  });

  it('calculates line and cart totals from formatted prices', () => {
    expect(getLineTotal({ price: '25 MAD', qty: 2 })).toBe(50);
    expect(calculatePosSubtotal([
      { price: '25 MAD', qty: 2 },
      { numPrice: 12.5, qty: 1 }
    ])).toBe(62.5);
  });

  it('creates non-colliding order identifiers', () => {
    const first = createPosOrderId();
    const second = createPosOrderId();
    expect(first).toMatch(/^CMD-/);
    expect(second).toMatch(/^CMD-/);
    expect(first).not.toBe(second);
  });
});
