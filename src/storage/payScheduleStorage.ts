import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaySchedule } from '../types';

const PAY_SCHEDULE_KEY = '@budget_planner/pay_schedule';

export const loadPaySchedule = async (): Promise<PaySchedule | null> => {
  try {
    const raw = await AsyncStorage.getItem(PAY_SCHEDULE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as PaySchedule;
  } catch (error) {
    console.warn('Failed to load pay schedule from storage', error);
    return null;
  }
};

export const savePaySchedule = async (schedule: PaySchedule): Promise<void> => {
  try {
    await AsyncStorage.setItem(PAY_SCHEDULE_KEY, JSON.stringify(schedule));
  } catch (error) {
    console.warn('Failed to save pay schedule to storage', error);
  }
};

export const clearPaySchedule = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PAY_SCHEDULE_KEY);
  } catch (error) {
    console.warn('Failed to clear pay schedule from storage', error);
  }
};
