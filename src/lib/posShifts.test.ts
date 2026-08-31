import { describe, it, expect } from 'vitest';
import { computeStationBreakdown } from './posShifts';

describe('computeStationBreakdown', () => {
  it('groups shifts by station and sums their sales', () => {
    const shiftsToday = [
      { station: 'Patio', cashSales: 100, cardSales: 50, totalSales: 150, paymentCount: 3 },
      { station: 'Patio', cashSales: 20, cardSales: 0, totalSales: 20, paymentCount: 1 },
      { station: 'Rooftop', cashSales: 10, cardSales: 90, totalSales: 100, paymentCount: 2 },
    ];

    const result = computeStationBreakdown(shiftsToday);

    expect(result).toEqual([
      { station: 'Patio', shiftsCount: 2, cashSales: 120, cardSales: 50, totalSales: 170, paymentCount: 4 },
      { station: 'Rooftop', shiftsCount: 1, cashSales: 10, cardSales: 90, totalSales: 100, paymentCount: 2 },
    ]);
  });

  it('omits stations with no shifts today', () => {
    const result = computeStationBreakdown([{ station: 'Patio', cashSales: 5, cardSales: 0, totalSales: 5, paymentCount: 1 }]);
    expect(result).toEqual([{ station: 'Patio', shiftsCount: 1, cashSales: 5, cardSales: 0, totalSales: 5, paymentCount: 1 }]);
  });

  it('returns an empty array when there are no shifts', () => {
    expect(computeStationBreakdown([])).toEqual([]);
  });

  it('coerces missing or non-numeric fields to 0', () => {
    const result = computeStationBreakdown([{ station: 'Rooftop' }]);
    expect(result).toEqual([{ station: 'Rooftop', shiftsCount: 1, cashSales: 0, cardSales: 0, totalSales: 0, paymentCount: 0 }]);
  });
});
