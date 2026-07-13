import { describe, it, expect } from 'vitest';
import { isCriticalStock, calculateStockStatus } from './inventory';

describe('Inventory Stock Calculations', () => {
  it('should return true for critical stock if quantity is less than threshold', () => {
    expect(isCriticalStock(5, 10)).toBe(true);
  });

  it('should return false for critical stock if quantity is equal to threshold', () => {
    expect(isCriticalStock(10, 10)).toBe(false);
  });

  it('should return false for critical stock if quantity is greater than threshold', () => {
    expect(isCriticalStock(15, 10)).toBe(false);
  });

  it('should return "critical" status when quantity is half or less of minStock', () => {
    expect(calculateStockStatus(2, 5)).toBe('critical');
    expect(calculateStockStatus(2.5, 5)).toBe('critical');
  });

  it('should return "alert" status when quantity is less than minStock but greater than half', () => {
    expect(calculateStockStatus(4, 5)).toBe('alert');
    expect(calculateStockStatus(15, 20)).toBe('alert');
  });

  it('should return "ok" status when quantity is equal to or greater than minStock', () => {
    expect(calculateStockStatus(5, 5)).toBe('ok');
    expect(calculateStockStatus(10, 5)).toBe('ok');
  });
});
