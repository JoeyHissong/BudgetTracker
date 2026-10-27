import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemePreference } from '../constants/theme';

const CURRENCY_KEY = '@budget_planner/currency';
const HIDE_NUMBERS_KEY = '@budget_planner/hide_numbers';
const BUDGET_START_DATE_KEY = '@budget_planner/budget_start_date';
const THEME_PREFERENCE_KEY = '@budget_planner/theme_preference';
const BILL_REMINDERS_ENABLED_KEY = '@budget_planner/bill_reminders_enabled';
const BILL_REMINDER_HOUR_KEY = '@budget_planner/bill_reminder_hour';

export const loadCurrencyCode = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(CURRENCY_KEY);
  } catch (error) {
    console.warn('Failed to load currency setting from storage', error);
    return null;
  }
};

export const saveCurrencyCode = async (currencyCode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(CURRENCY_KEY, currencyCode);
  } catch (error) {
    console.warn('Failed to save currency setting to storage', error);
  }
};

export const loadHideNumbers = async (): Promise<boolean | null> => {
  try {
    const stored = await AsyncStorage.getItem(HIDE_NUMBERS_KEY);
    return stored === null ? null : stored === 'true';
  } catch (error) {
    console.warn('Failed to load hide numbers setting from storage', error);
    return null;
  }
};

export const saveHideNumbers = async (hideNumbers: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(HIDE_NUMBERS_KEY, hideNumbers ? 'true' : 'false');
  } catch (error) {
    console.warn('Failed to save hide numbers setting to storage', error);
  }
};

/**
 * ISO "YYYY-MM-DD" date the user started tracking their budget in this app.
 * Used to avoid treating months before the user ever used the app as having
 * a real, spendable leftover balance.
 */
export const loadBudgetStartDate = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(BUDGET_START_DATE_KEY);
  } catch (error) {
    console.warn('Failed to load budget start date from storage', error);
    return null;
  }
};

export const saveBudgetStartDate = async (isoDate: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(BUDGET_START_DATE_KEY, isoDate);
  } catch (error) {
    console.warn('Failed to save budget start date to storage', error);
  }
};

export const loadThemePreference = async (): Promise<ThemePreference | null> => {
  try {
    const stored = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return null;
  } catch (error) {
    console.warn('Failed to load theme preference from storage', error);
    return null;
  }
};

export const saveThemePreference = async (preference: ThemePreference): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
  } catch (error) {
    console.warn('Failed to save theme preference to storage', error);
  }
};

/** Whether "bill due today" local notifications are turned on. */
export const loadBillRemindersEnabled = async (): Promise<boolean | null> => {
  try {
    const stored = await AsyncStorage.getItem(BILL_REMINDERS_ENABLED_KEY);
    return stored === null ? null : stored === 'true';
  } catch (error) {
    console.warn('Failed to load bill reminders setting from storage', error);
    return null;
  }
};

export const saveBillRemindersEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(BILL_REMINDERS_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.warn('Failed to save bill reminders setting to storage', error);
  }
};

/** Hour of the day (0-23, local time) that bill-due-today reminders fire. */
export const loadBillReminderHour = async (): Promise<number | null> => {
  try {
    const stored = await AsyncStorage.getItem(BILL_REMINDER_HOUR_KEY);
    if (stored === null) {
      return null;
    }
    const parsed = Number(stored);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 23 ? parsed : null;
  } catch (error) {
    console.warn('Failed to load bill reminder hour from storage', error);
    return null;
  }
};

export const saveBillReminderHour = async (hour: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(BILL_REMINDER_HOUR_KEY, String(hour));
  } catch (error) {
    console.warn('Failed to save bill reminder hour to storage', error);
  }
};
