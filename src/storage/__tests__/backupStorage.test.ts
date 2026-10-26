import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BACKUP_FORMAT_VERSION,
  BackupData,
  BackupValidationError,
  buildBackupData,
  exportBackupJSON,
  parseBackupJSON,
  restoreBackupData,
  validateBackupData,
} from '../backupStorage';
import { Bill, PaySchedule } from '../../types';

const sampleBill: Bill = {
  id: 'bill-1',
  name: 'Rent',
  amount: 1200,
  category: 'Rent/Mortgage',
  dueDay: 1,
  note: '',
};

const sampleLoanBill: Bill = {
  id: 'bill-2',
  name: 'Car Loan',
  amount: 350,
  category: 'Loan/Debt',
  dueDay: 15,
  note: '',
  lender: 'Chase',
  interestRate: 5.25,
  remainingBalance: 8400,
  minimumPayment: 300,
};

const samplePaySchedule: PaySchedule = {
  amount: 2000,
  frequency: 'monthly',
  anchorDate: '2026-01-01',
  dayOfMonth: 1,
};

const validBackup: BackupData = {
  version: BACKUP_FORMAT_VERSION,
  exportedAt: '2026-10-20T00:00:00.000Z',
  bills: [sampleBill],
  payments: [{ billId: 'bill-1', monthKey: '2026-10' }],
  paySchedule: samplePaySchedule,
  settings: {
    currencyCode: 'USD',
    hideNumbers: false,
    budgetStartDate: '2026-01-01',
    themePreference: 'system',
  },
};

describe('validateBackupData', () => {
  it('accepts a well-formed backup object', () => {
    expect(validateBackupData(validBackup)).toEqual(validBackup);
  });

  it('accepts a null paySchedule and null settings fields', () => {
    const backup: BackupData = {
      ...validBackup,
      paySchedule: null,
      settings: {
        currencyCode: null,
        hideNumbers: null,
        budgetStartDate: null,
        themePreference: null,
      },
    };
    expect(validateBackupData(backup)).toEqual(backup);
  });

  it.each([null, undefined, 42, 'a string', []])(
    'rejects non-object top-level value %p',
    value => {
      expect(() => validateBackupData(value)).toThrow(BackupValidationError);
    },
  );

  it('rejects a missing version field', () => {
    const rest: Record<string, unknown> = { ...validBackup };
    delete rest.version;
    expect(() => validateBackupData(rest)).toThrow(BackupValidationError);
  });

  it('rejects a version newer than this app supports', () => {
    expect(() =>
      validateBackupData({
        ...validBackup,
        version: BACKUP_FORMAT_VERSION + 1,
      }),
    ).toThrow(/newer version of the app/);
  });

  it('rejects a bill with an invalid category', () => {
    const backup = {
      ...validBackup,
      bills: [{ ...sampleBill, category: 'Not A Real Category' }],
    };
    expect(() => validateBackupData(backup)).toThrow(BackupValidationError);
  });

  it('accepts a loan bill with interest rate, remaining balance, minimum payment, and lender', () => {
    const backup = { ...validBackup, bills: [sampleLoanBill] };
    expect(validateBackupData(backup)).toEqual(backup);
  });

  it('accepts a loan bill with the optional loan fields omitted', () => {
    const { interestRate, remainingBalance, minimumPayment, lender, ...rest } =
      sampleLoanBill;
    const backup = { ...validBackup, bills: [rest] };
    expect(validateBackupData(backup)).toEqual(backup);
  });

  it('rejects a loan bill with a non-numeric interest rate', () => {
    const backup = {
      ...validBackup,
      bills: [{ ...sampleLoanBill, interestRate: '5.25' }],
    };
    expect(() => validateBackupData(backup)).toThrow(BackupValidationError);
  });

  it('rejects a loan bill with a non-numeric remaining balance', () => {
    const backup = {
      ...validBackup,
      bills: [{ ...sampleLoanBill, remainingBalance: 'a lot' }],
    };
    expect(() => validateBackupData(backup)).toThrow(BackupValidationError);
  });

  it('rejects a loan bill with a non-string lender', () => {
    const backup = {
      ...validBackup,
      bills: [{ ...sampleLoanBill, lender: 12345 }],
    };
    expect(() => validateBackupData(backup)).toThrow(BackupValidationError);
  });

  it('rejects a bill missing required fields', () => {
    const incompleteBill: Record<string, unknown> = { ...sampleBill };
    delete incompleteBill.name;
    expect(() =>
      validateBackupData({ ...validBackup, bills: [incompleteBill] }),
    ).toThrow(BackupValidationError);
  });

  it('rejects payments that are not an array', () => {
    expect(() => validateBackupData({ ...validBackup, payments: {} })).toThrow(
      BackupValidationError,
    );
  });

  it('rejects an invalid pay schedule frequency', () => {
    const backup = {
      ...validBackup,
      paySchedule: { ...samplePaySchedule, frequency: 'yearly' },
    };
    expect(() => validateBackupData(backup)).toThrow(BackupValidationError);
  });

  it('rejects a missing settings object', () => {
    const rest: Record<string, unknown> = { ...validBackup };
    delete rest.settings;
    expect(() => validateBackupData(rest)).toThrow(BackupValidationError);
  });

  it('rejects an invalid theme preference', () => {
    const backup = {
      ...validBackup,
      settings: { ...validBackup.settings, themePreference: 'neon' },
    };
    expect(() => validateBackupData(backup)).toThrow(BackupValidationError);
  });
});

describe('parseBackupJSON', () => {
  it('parses and validates valid JSON', () => {
    expect(parseBackupJSON(JSON.stringify(validBackup))).toEqual(validBackup);
  });

  it('throws a BackupValidationError for invalid JSON text', () => {
    expect(() => parseBackupJSON('{ not valid json')).toThrow(
      BackupValidationError,
    );
    expect(() => parseBackupJSON('{ not valid json')).toThrow(/not valid JSON/);
  });

  it('throws a BackupValidationError for well-formed JSON with the wrong shape', () => {
    expect(() => parseBackupJSON(JSON.stringify({ foo: 'bar' }))).toThrow(
      BackupValidationError,
    );
  });
});

describe('buildBackupData / exportBackupJSON', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('gathers empty defaults when nothing has been stored', async () => {
    const data = await buildBackupData();
    expect(data.version).toBe(BACKUP_FORMAT_VERSION);
    expect(data.bills).toEqual([]);
    expect(data.payments).toEqual([]);
    expect(data.paySchedule).toBeNull();
    expect(data.settings).toEqual({
      currencyCode: null,
      hideNumbers: null,
      budgetStartDate: null,
      themePreference: null,
    });
    expect(typeof data.exportedAt).toBe('string');
  });

  it('round-trips through restoreBackupData', async () => {
    await restoreBackupData(validBackup);
    const data = await buildBackupData();
    expect(data.bills).toEqual(validBackup.bills);
    expect(data.payments).toEqual(validBackup.payments);
    expect(data.paySchedule).toEqual(validBackup.paySchedule);
    expect(data.settings).toEqual(validBackup.settings);
  });

  it('produces valid, parseable JSON from exportBackupJSON', async () => {
    await restoreBackupData(validBackup);
    const json = await exportBackupJSON();
    const reparsed = parseBackupJSON(json);
    expect(reparsed.bills).toEqual(validBackup.bills);
  });

  it('clears the pay schedule on restore when the backup has none', async () => {
    await restoreBackupData(validBackup);
    await restoreBackupData({ ...validBackup, paySchedule: null });
    const data = await buildBackupData();
    expect(data.paySchedule).toBeNull();
  });
});
