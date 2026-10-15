import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bill, PaymentRecord } from '../types';

const BILLS_KEY = '@budget_planner/bills';
const PAYMENTS_KEY = '@budget_planner/payments';

export const loadBills = async (): Promise<Bill[]> => {
  try {
    const raw = await AsyncStorage.getItem(BILLS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load bills from storage', error);
    return [];
  }
};

export const saveBills = async (bills: Bill[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(BILLS_KEY, JSON.stringify(bills));
  } catch (error) {
    console.warn('Failed to save bills to storage', error);
  }
};

export const loadPayments = async (): Promise<PaymentRecord[]> => {
  try {
    const raw = await AsyncStorage.getItem(PAYMENTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load payment records from storage', error);
    return [];
  }
};

export const savePayments = async (payments: PaymentRecord[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  } catch (error) {
    console.warn('Failed to save payment records to storage', error);
  }
};
