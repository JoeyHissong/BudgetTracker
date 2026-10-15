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
}

/** Tracks that a given bill was marked paid for a given "YYYY-MM" month. */
export interface PaymentRecord {
  billId: string;
  monthKey: string;
}
