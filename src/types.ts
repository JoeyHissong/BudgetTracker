export type BillCategory =
  | 'Rent/Mortgage'
  | 'Utilities'
  | 'Internet/Phone'
  | 'Subscriptions'
  | 'Insurance'
  | 'Loan/Debt'
  | 'Other';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: BillCategory;
  /** Day of the month the bill is due, 1-31 (clamped to the month's actual length). */
  dueDay: number;
  note: string;
  /**
   * Loan-specific details, only meaningful when category is 'Loan/Debt'.
   * Kept optional so existing non-loan bills are unaffected.
   */
  /** Annual interest rate as a percentage, e.g. 5.25 for 5.25%. */
  interestRate?: number;
  /** Remaining principal balance owed on the loan. */
  remainingBalance?: number;
  /** Minimum required payment per period, if different from `amount`. */
  minimumPayment?: number;
  /** Name of the lender or institution the loan is with. */
  lender?: string;
}

/** Tracks that a given bill was marked paid for a given "YYYY-MM" month. */
export interface PaymentRecord {
  billId: string;
  monthKey: string;
}

export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

export interface PaySchedule {
  /** Take-home amount received on each payday. */
  amount: number;
  frequency: PayFrequency;
  /**
   * ISO "YYYY-MM-DD" date of a known past or upcoming payday. Used as the
   * recurrence anchor for 'weekly' and 'biweekly' schedules.
   */
  anchorDate: string;
  /**
   * Day of the month (1-31, clamped to the month's actual length) used for
   * 'monthly' schedules, and as the first payday of the month for
   * 'semimonthly' schedules.
   */
  dayOfMonth: number;
  /** Second day of the month (1-31) for 'semimonthly' schedules only. */
  secondDayOfMonth?: number;
}
