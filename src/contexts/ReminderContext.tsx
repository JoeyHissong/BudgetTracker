import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  loadBillReminderHour,
  loadBillRemindersEnabled,
  saveBillReminderHour,
  saveBillRemindersEnabled,
} from '../storage/settingsStorage';

const DEFAULT_REMINDER_HOUR = 9;

interface ReminderContextValue {
  /** Whether "bill due today" local notifications are turned on. */
  remindersEnabled: boolean;
  setRemindersEnabled: (enabled: boolean) => void;
  /** Hour of the day (0-23, local time) that bill-due-today reminders fire. */
  reminderHour: number;
  setReminderHour: (hour: number) => void;
  isLoading: boolean;
  /** Re-reads reminder settings from storage, e.g. after a data import. */
  reload: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextValue | undefined>(undefined);

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [remindersEnabled, setRemindersEnabledState] = useState(false);
  const [reminderHour, setReminderHourState] = useState(DEFAULT_REMINDER_HOUR);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const [storedEnabled, storedHour] = await Promise.all([
      loadBillRemindersEnabled(),
      loadBillReminderHour(),
    ]);
    setRemindersEnabledState(storedEnabled ?? false);
    setReminderHourState(storedHour ?? DEFAULT_REMINDER_HOUR);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([loadBillRemindersEnabled(), loadBillReminderHour()]).then(
      ([storedEnabled, storedHour]) => {
        if (isMounted) {
          setRemindersEnabledState(storedEnabled ?? false);
          setReminderHourState(storedHour ?? DEFAULT_REMINDER_HOUR);
          setIsLoading(false);
        }
      },
    );
    return () => {
      isMounted = false;
    };
  }, []);

  const setRemindersEnabled = useCallback((enabled: boolean) => {
    setRemindersEnabledState(enabled);
    saveBillRemindersEnabled(enabled);
  }, []);

  const setReminderHour = useCallback((hour: number) => {
    setReminderHourState(hour);
    saveBillReminderHour(hour);
  }, []);

  const value = useMemo(
    () => ({
      remindersEnabled,
      setRemindersEnabled,
      reminderHour,
      setReminderHour,
      isLoading,
      reload,
    }),
    [remindersEnabled, setRemindersEnabled, reminderHour, setReminderHour, isLoading, reload],
  );

  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>;
};

export const useReminders = (): ReminderContextValue => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};
