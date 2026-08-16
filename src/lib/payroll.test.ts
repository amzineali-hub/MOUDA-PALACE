import { describe, it, expect } from 'vitest';
import { computePayroll, computeAbsenceDeduction } from './payroll';

describe('payroll - computePayroll', () => {
  it('computes CNSS at 4.48% below the ceiling', () => {
    const { cnss } = computePayroll(4000);
    expect(cnss).toBeCloseTo(4000 * 0.0448);
  });

  it('caps CNSS at the 6000 MAD ceiling for higher salaries', () => {
    const { cnss } = computePayroll(10000);
    expect(cnss).toBeCloseTo(6000 * 0.0448);
  });

  it('computes AMO at 2.26% with no ceiling', () => {
    const { amo } = computePayroll(10000);
    expect(amo).toBeCloseTo(10000 * 0.0226);
  });

  it('never returns a negative IGR', () => {
    const { igr } = computePayroll(2000); // low salary, SNI likely under the first bracket
    expect(igr).toBeGreaterThanOrEqual(0);
  });

  it('net salary is base minus CNSS, AMO and IGR', () => {
    const result = computePayroll(5000);
    expect(result.netSalary).toBeCloseTo(result.baseSalary - result.cnss - result.amo - result.igr);
  });

  it('net salary decreases as base salary increases into a higher IGR bracket (progressive tax)', () => {
    const low = computePayroll(3000);
    const high = computePayroll(8000);
    expect(high.netSalary).toBeGreaterThan(low.netSalary);
    // the net/base ratio should shrink as salary grows (progressive taxation)
    expect(high.netSalary / high.baseSalary).toBeLessThan(low.netSalary / low.baseSalary);
  });
});

describe('payroll - computeAbsenceDeduction', () => {
  it('charges a full daily rate (base / 26) for an absence with no hours specified', () => {
    const deduction = computeAbsenceDeduction(5200, [{}]);
    expect(deduction).toBeCloseTo(5200 / 26);
  });

  it('charges the hourly rate (base / 191) when hours are specified (partial absence)', () => {
    const deduction = computeAbsenceDeduction(5200, [{ hours: 3 }]);
    expect(deduction).toBeCloseTo((5200 / 191) * 3);
  });

  it('sums a mix of full-day and partial-hour absences', () => {
    const deduction = computeAbsenceDeduction(5200, [{}, { hours: 4 }]);
    expect(deduction).toBeCloseTo(5200 / 26 + (5200 / 191) * 4);
  });

  it('returns 0 for no absences', () => {
    expect(computeAbsenceDeduction(5200, [])).toBe(0);
  });
});
