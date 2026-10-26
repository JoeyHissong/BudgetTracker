import { Bill } from '../types';

export interface LoanPayoffEstimate {
  /** Number of months until the loan is paid off, rounded up to the next whole month. */
  monthsRemaining: number;
  /** Total interest paid over the remaining life of the loan, given a fixed payment and rate. */
  totalInterestRemaining: number;
}

/**
 * Estimates how many months are left to pay off a loan, given its remaining
 * balance, a fixed monthly payment, and an annual interest rate.
 *
 * Returns `null` when there isn't enough data to compute an estimate, or
 * when the monthly payment doesn't even cover the interest accruing each
 * month (the balance would never go down, so "months remaining" isn't a
 * meaningful finite number).
 *
 * This assumes a fixed payment and a fixed rate for the life of the loan
 * (standard monthly-compounding amortization). Real-world loans with
 * variable rates, fees, or irregular extra payments will drift from this
 * estimate over time.
 */
export const estimateLoanPayoff = (
  remainingBalance: number | undefined,
  monthlyPayment: number | undefined,
  annualInterestRate: number | undefined,
): LoanPayoffEstimate | null => {
  if (
    remainingBalance === undefined ||
    monthlyPayment === undefined ||
    remainingBalance <= 0 ||
    monthlyPayment <= 0
  ) {
    return null;
  }

  const rate = annualInterestRate ?? 0;
  const monthlyRate = rate / 100 / 12;

  if (monthlyRate <= 0) {
    const monthsRemaining = Math.ceil(remainingBalance / monthlyPayment);
    return { monthsRemaining, totalInterestRemaining: 0 };
  }

  // The payment must cover at least the interest accruing each month,
  // otherwise the balance never decreases (negative amortization).
  const monthlyInterest = monthlyRate * remainingBalance;
  if (monthlyPayment <= monthlyInterest) {
    return null;
  }

  const monthsExact =
    -Math.log(1 - (monthlyRate * remainingBalance) / monthlyPayment) /
    Math.log(1 + monthlyRate);

  if (!Number.isFinite(monthsExact)) {
    return null;
  }

  const monthsRemaining = Math.ceil(monthsExact);
  const totalInterestRemaining = Math.max(
    monthsRemaining * monthlyPayment - remainingBalance,
    0,
  );

  return { monthsRemaining, totalInterestRemaining };
};

/**
 * Convenience wrapper that pulls the relevant fields off a {@link Bill},
 * using `minimumPayment` as the monthly payment when set, falling back to
 * the bill's regular `amount` otherwise.
 */
export const estimateBillPayoff = (bill: Bill): LoanPayoffEstimate | null =>
  estimateLoanPayoff(
    bill.remainingBalance,
    bill.minimumPayment ?? bill.amount,
    bill.interestRate,
  );

/** e.g. "14 months left" or "1 month left" */
export const formatMonthsRemaining = (monthsRemaining: number): string =>
  `${monthsRemaining} ${monthsRemaining === 1 ? 'month' : 'months'} left`;
