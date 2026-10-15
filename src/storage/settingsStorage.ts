import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENCY_KEY = '@budget_planner/currency';

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
