import {
  Bill,
  BillCategory,
  PayFrequency,
  PaymentRecord,
  PaySchedule,
} from '../types';
import { ThemePreference } from '../constants/theme';
import {
  loadBills,
  loadPayments,
  saveBills,
  savePayments,
} from './billStorage';
import {
  loadPaySchedule,
  savePaySchedule,
  clearPaySchedule,
} from './payScheduleStorage';
import {
  loadBudgetStartDate,
  loadCurrencyCode,
  loadHideNumbers,
  loadThemePreference,
  saveBudgetStartDate,
  saveCurrencyCode,
  saveHideNumbers,
  saveThemePreference,
} from './settingsStorage';

/** Bumped whenever the shape of the exported data changes. */
export const BACKUP_FORMAT_VERSION = 1;

export interface BackupSettings {
  currencyCode: string | null;
  hideNumbers: boolean | null;
  budgetStartDate: string | null;
  themePreference: ThemePreference | null;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  bills: Bill[];
  payments: PaymentRecord[];
  paySchedule: PaySchedule | null;
  settings: BackupSettings;
}

const BILL_CATEGORIES: BillCategory[] = [
  'Rent/Mortgage',
  'Utilities',
  'Internet/Phone',
  'Subscriptions',
  'Insurance',
  'Loan/Debt',
  'Other',
];

const PAY_FREQUENCIES: PayFrequency[] = [
  'weekly',
  'biweekly',
  'semimonthly',
  'monthly',
];

/** Gathers every piece of app data currently in storage into one JSON-serializable object. */
export const buildBackupData = async (): Promise<BackupData> => {
  const [
    bills,
    payments,
    paySchedule,
    currencyCode,
    hideNumbers,
    budgetStartDate,
    themePreference,
  ] = await Promise.all([
    loadBills(),
    loadPayments(),
    loadPaySchedule(),
    loadCurrencyCode(),
    loadHideNumbers(),
    loadBudgetStartDate(),
    loadThemePreference(),
  ]);

  return {
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    bills,
    payments,
    paySchedule,
    settings: {
      currencyCode,
      hideNumbers,
      budgetStartDate,
      themePreference,
    },
  };
};

/** Serializes the current app data to a pretty-printed JSON string, ready to write to a file. */
export const exportBackupJSON = async (): Promise<string> => {
  const data = await buildBackupData();
  return JSON.stringify(data, null, 2);
};

const isBillCategory = (value: unknown): value is BillCategory =>
  typeof value === 'string' && (BILL_CATEGORIES as string[]).includes(value);

const isPayFrequency = (value: unknown): value is PayFrequency =>
  typeof value === 'string' && (PAY_FREQUENCIES as string[]).includes(value);

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'system' || value === 'light' || value === 'dark';

const isBill = (value: unknown): value is Bill => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const bill = value as Record<string, unknown>;
  return (
    typeof bill.id === 'string' &&
    typeof bill.name === 'string' &&
    typeof bill.amount === 'number' &&
    isBillCategory(bill.category) &&
    typeof bill.dueDay === 'number' &&
    typeof bill.note === 'string' &&
    (bill.interestRate === undefined || typeof bill.interestRate === 'number') &&
    (bill.remainingBalance === undefined || typeof bill.remainingBalance === 'number') &&
    (bill.minimumPayment === undefined || typeof bill.minimumPayment === 'number') &&
    (bill.lender === undefined || typeof bill.lender === 'string')
  );
};

const isPaymentRecord = (value: unknown): value is PaymentRecord => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const payment = value as Record<string, unknown>;
  return (
    typeof payment.billId === 'string' && typeof payment.monthKey === 'string'
  );
};

const isPaySchedule = (value: unknown): value is PaySchedule => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const schedule = value as Record<string, unknown>;
  return (
    typeof schedule.amount === 'number' &&
    isPayFrequency(schedule.frequency) &&
    typeof schedule.anchorDate === 'string' &&
    typeof schedule.dayOfMonth === 'number' &&
    (schedule.secondDayOfMonth === undefined ||
      typeof schedule.secondDayOfMonth === 'number')
  );
};

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupValidationError';
  }
}

/**
 * Validates that a parsed JSON value matches the shape produced by
 * {@link buildBackupData}. Throws {@link BackupValidationError} with a
 * user-presentable message if it doesn't.
 */
export const validateBackupData = (value: unknown): BackupData => {
  if (!value || typeof value !== 'object') {
    throw new BackupValidationError('This file is not a valid backup.');
  }
  const data = value as Record<string, unknown>;

  if (typeof data.version !== 'number') {
    throw new BackupValidationError('This file is not a valid backup.');
  }
  if (data.version > BACKUP_FORMAT_VERSION) {
    throw new BackupValidationError(
      'This backup was created by a newer version of the app. Please update the app and try again.',
    );
  }

  if (!Array.isArray(data.bills) || !data.bills.every(isBill)) {
    throw new BackupValidationError('This file is not a valid backup.');
  }
  if (!Array.isArray(data.payments) || !data.payments.every(isPaymentRecord)) {
    throw new BackupValidationError('This file is not a valid backup.');
  }
  if (data.paySchedule !== null && !isPaySchedule(data.paySchedule)) {
    throw new BackupValidationError('This file is not a valid backup.');
  }

  const settings = data.settings as Record<string, unknown> | undefined;
  if (!settings || typeof settings !== 'object') {
    throw new BackupValidationError('This file is not a valid backup.');
  }
  if (
    settings.currencyCode !== null &&
    typeof settings.currencyCode !== 'string'
  ) {
    throw new BackupValidationError('This file is not a valid backup.');
  }
  if (
    settings.hideNumbers !== null &&
    typeof settings.hideNumbers !== 'boolean'
  ) {
    throw new BackupValidationError('This file is not a valid backup.');
  }
  if (
    settings.budgetStartDate !== null &&
    typeof settings.budgetStartDate !== 'string'
  ) {
    throw new BackupValidationError('This file is not a valid backup.');
  }
  if (
    settings.themePreference !== null &&
    !isThemePreference(settings.themePreference)
  ) {
    throw new BackupValidationError('This file is not a valid backup.');
  }

  return {
    version: data.version,
    exportedAt:
      typeof data.exportedAt === 'string'
        ? data.exportedAt
        : new Date().toISOString(),
    bills: data.bills as Bill[],
    payments: data.payments as PaymentRecord[],
    paySchedule: data.paySchedule as PaySchedule | null,
    settings: {
      currencyCode: settings.currencyCode as string | null,
      hideNumbers: settings.hideNumbers as boolean | null,
      budgetStartDate: settings.budgetStartDate as string | null,
      themePreference: settings.themePreference as ThemePreference | null,
    },
  };
};

/** Parses and validates a raw JSON string as backup data. */
export const parseBackupJSON = (raw: string): BackupData => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BackupValidationError('This file is not valid JSON.');
  }
  return validateBackupData(parsed);
};

/**
 * Overwrites all app storage with the given backup data. Entirely replaces
 * bills/payments/pay schedule/settings - this is a restore, not a merge.
 */
export const restoreBackupData = async (data: BackupData): Promise<void> => {
  const tasks: Promise<void>[] = [
    saveBills(data.bills),
    savePayments(data.payments),
  ];

  if (data.paySchedule) {
    tasks.push(savePaySchedule(data.paySchedule));
  } else {
    tasks.push(clearPaySchedule());
  }

  if (data.settings.currencyCode) {
    tasks.push(saveCurrencyCode(data.settings.currencyCode));
  }
  if (data.settings.hideNumbers !== null) {
    tasks.push(saveHideNumbers(data.settings.hideNumbers));
  }
  if (data.settings.budgetStartDate) {
    tasks.push(saveBudgetStartDate(data.settings.budgetStartDate));
  }
  if (data.settings.themePreference) {
    tasks.push(saveThemePreference(data.settings.themePreference));
  }

  await Promise.all(tasks);
};
