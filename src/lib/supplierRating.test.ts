import { describe, it, expect } from 'vitest';
import { computeDeliveryQualityScore, computeUpdatedSupplierRating } from './supplierRating';

describe('supplierRating - computeDeliveryQualityScore', () => {
  it('returns 5 when every item is quality-OK', () => {
    expect(computeDeliveryQualityScore([{ qualityOk: true }, { qualityOk: true }])).toBe(5);
  });

  it('returns 0 when every item fails quality control', () => {
    expect(computeDeliveryQualityScore([{ qualityOk: false }, { qualityOk: false }])).toBe(0);
  });

  it('treats a missing qualityOk field as OK (existing default behavior)', () => {
    expect(computeDeliveryQualityScore([{}, { qualityOk: true }])).toBe(5);
  });

  it('returns a proportional score for mixed results', () => {
    expect(computeDeliveryQualityScore([{ qualityOk: true }, { qualityOk: false }])).toBe(2.5);
  });

  it('returns null for an empty delivery', () => {
    expect(computeDeliveryQualityScore([])).toBeNull();
  });
});

describe('supplierRating - computeUpdatedSupplierRating', () => {
  it('blends a perfect delivery upward from a low previous rating', () => {
    const items = [{ qualityOk: true }, { qualityOk: true }];
    const result = computeUpdatedSupplierRating(3, items);
    // 3*0.7 + 5*0.3 = 2.1 + 1.5 = 3.6
    expect(result).toBeCloseTo(3.6);
  });

  it('blends a bad delivery downward without collapsing the rating in one shot', () => {
    const items = [{ qualityOk: false }, { qualityOk: false }];
    const result = computeUpdatedSupplierRating(5, items);
    // 5*0.7 + 0*0.3 = 3.5
    expect(result).toBeCloseTo(3.5);
  });

  it('defaults the previous rating to 5 when unset', () => {
    const items = [{ qualityOk: true }];
    expect(computeUpdatedSupplierRating(undefined, items)).toBe(5);
    expect(computeUpdatedSupplierRating(null, items)).toBe(5);
  });

  it('leaves the rating untouched when the delivery has no items', () => {
    expect(computeUpdatedSupplierRating(4.2, [])).toBe(4.2);
  });
});
