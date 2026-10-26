import { Bill } from '../../types';
import { estimateBillPayoff, estimateLoanPayoff, formatMonthsRemaining } from '../loan';

describe('estimateLoanPayoff', () => {
  it('returns null when remaining balance is missing', () => {
    expect(estimateLoanPayoff(undefined, 100, 5)).toBeNull();
  });

  it('returns null when monthly payment is missing', () => {
    expect(estimateLoanPayoff(1000, undefined, 5)).toBeNull();
  });

  it('returns null when remaining balance is zero or negative', () => {
    expect(estimateLoanPayoff(0, 100, 5)).toBeNull();
    expect(estimateLoanPayoff(-50, 100, 5)).toBeNull();
  });

  it('returns null when monthly payment is zero or negative', () => {
    expect(estimateLoanPayoff(1000, 0, 5)).toBeNull();
    expect(estimateLoanPayoff(1000, -10, 5)).toBeNull();
  });

  it('computes simple division when there is no interest rate', () => {
    const result = estimateLoanPayoff(1200, 100, undefined);
    expect(result).toEqual({ monthsRemaining: 12, totalInterestRemaining: 0 });
  });

  it('computes simple division when the interest rate is zero', () => {
    const result = estimateLoanPayoff(1000, 250, 0);
    expect(result).toEqual({ monthsRemaining: 4, totalInterestRemaining: 0 });
  });

  it('rounds up fractional months for the zero-interest case', () => {
    const result = estimateLoanPayoff(1000, 300, 0);
    expect(result?.monthsRemaining).toBe(4);
  });

  it('computes an amortized payoff estimate with a positive interest rate', () => {
    // $10,000 balance, 6% APR, $300/mo payment.
    // Exact payoff time is ~36.56 months, so it should round up to 37.
    const result = estimateLoanPayoff(10000, 300, 6);
    expect(result).not.toBeNull();
    expect(result?.monthsRemaining).toBe(37);
    expect(result?.totalInterestRemaining).toBeGreaterThan(0);
    // Sanity check: total paid roughly equals balance + interest.
    expect(result!.monthsRemaining * 300).toBeCloseTo(
      10000 + result!.totalInterestRemaining,
      0,
    );
  });

  it('returns null when the payment does not cover accruing interest', () => {
    // $50,000 at 24% APR accrues $1000/mo in interest; a $50 payment can't keep up.
    const result = estimateLoanPayoff(50000, 50, 24);
    expect(result).toBeNull();
  });

  it('returns null when payment exactly equals monthly interest (no progress)', () => {
    // 12% APR on $10,000 accrues exactly $100/mo in interest.
    const result = estimateLoanPayoff(10000, 100, 12);
    expect(result).toBeNull();
  });
});

describe('estimateBillPayoff', () => {
  const baseLoan: Bill = {
    id: 'loan-1',
    name: 'Car Payment',
    amount: 310,
    category: 'Loan/Debt',
    dueDay: 8,
    note: '',
  };

  it('uses minimumPayment when set, instead of amount', () => {
    const bill: Bill = {
      ...baseLoan,
      remainingBalance: 1000,
      minimumPayment: 250,
      interestRate: 0,
    };
    expect(estimateBillPayoff(bill)).toEqual({
      monthsRemaining: 4,
      totalInterestRemaining: 0,
    });
  });

  it('falls back to amount when minimumPayment is not set', () => {
    const bill: Bill = {
      ...baseLoan,
      amount: 500,
      remainingBalance: 1000,
      interestRate: 0,
    };
    expect(estimateBillPayoff(bill)).toEqual({
      monthsRemaining: 2,
      totalInterestRemaining: 0,
    });
  });

  it('returns null for a bill with no loan fields set', () => {
    expect(estimateBillPayoff(baseLoan)).toBeNull();
  });
});

describe('formatMonthsRemaining', () => {
  it('pluralizes "months" for values other than 1', () => {
    expect(formatMonthsRemaining(0)).toBe('0 months left');
    expect(formatMonthsRemaining(14)).toBe('14 months left');
  });

  it('uses singular "month" for exactly 1', () => {
    expect(formatMonthsRemaining(1)).toBe('1 month left');
  });
});
