import { useEffect } from 'react';
import { Bill } from '../types';
import { useReminders } from '../contexts/ReminderContext';
import { cancelAllBillReminders, scheduleBillReminders } from '../notifications/billReminders';

/**
 * Keeps scheduled "bill due today" local notifications in sync with the
 * current bill list and reminder settings. Mount this once near the app
 * root - it cancels and recreates every bill reminder whenever `bills` or
 * the reminder settings change, so it shouldn't be mounted more than once.
 */
export const useBillReminderScheduler = (bills: Bill[], billsLoading: boolean): void => {
  const { remindersEnabled, reminderHour, isLoading: settingsLoading } = useReminders();

  useEffect(() => {
    if (billsLoading || settingsLoading) {
      return;
    }
    if (!remindersEnabled) {
      cancelAllBillReminders().catch(error =>
        console.warn('Failed to cancel bill reminders', error),
      );
      return;
    }
    scheduleBillReminders(bills, reminderHour).catch(error =>
      console.warn('Failed to schedule bill reminders', error),
    );
  }, [bills, billsLoading, remindersEnabled, reminderHour, settingsLoading]);
};
