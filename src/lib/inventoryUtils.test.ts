import { describe, it, expect } from 'vitest';
import { calculateStockStatus } from './inventoryUtils';

describe('Inventory Module - Stock Status Calculation', () => {
  it('should return "ok" when quantity is strictly greater than minStock', () => {
    expect(calculateStockStatus(250, 100)).toBe('ok');
    expect(calculateStockStatus(21, 20)).toBe('ok');
    expect(calculateStockStatus(45, 20)).toBe('ok');
  });

  it('should return "alert" when quantity is less than or equal to minStock but above critical threshold', () => {
    // Critical threshold is <= 50% of minStock
    expect(calculateStockStatus(15, 20)).toBe('alert');
    expect(calculateStockStatus(20, 20)).toBe('alert');
    expect(calculateStockStatus(100, 100)).toBe('alert');
    expect(calculateStockStatus(51, 100)).toBe('alert');
  });

  it('should return "critical" when quantity is less than or equal to 50% of minStock', () => {
    expect(calculateStockStatus(2, 5)).toBe('critical');
    expect(calculateStockStatus(50, 100)).toBe('critical');
    expect(calculateStockStatus(0, 50)).toBe('critical');
    expect(calculateStockStatus(-5, 10)).toBe('critical');
  });
});
