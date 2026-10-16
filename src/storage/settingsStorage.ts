import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENCY_KEY = '@budget_planner/currency';
const HIDE_NUMBERS_KEY = '@budget_planner/hide_numbers';
const BUDGET_START_DATE_KEY = '@budget_planner/budget_start_date';

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
