import { useCallback, useEffect, useMemo, useState } from 'react';
import { PaySchedule } from '../types';
import {
  clearPaySchedule,
  loadPaySchedule,
  savePaySchedule,
} from '../storage/payScheduleStorage';
import { addMonths, getPaydaysInMonth } from '../utils/date';

export interface PaydayForMonth {
  id: string;
  isoDate: string;
  amount: number;
}

export const usePaySchedule = (selectedMonth: Date) => {
  const [schedule, setSchedule] = useState<PaySchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const stored = await loadPaySchedule();
    setSchedule(stored);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    loadPaySchedule().then(stored => {
      if (isMounted) {
        setSchedule(stored);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setPaySchedule = useCallback((next: PaySchedule) => {
    setSchedule(next);
    savePaySchedule(next);
  }, []);

  const removePaySchedule = useCallback(() => {
    setSchedule(null);
    clearPaySchedule();
  }, []);

  const paydaysForMonth: PaydayForMonth[] = useMemo(() => {
    if (!schedule) {
      return [];
    }
    return getPaydaysInMonth(schedule, selectedMonth).map(isoDate => ({
      id: `payday-${isoDate}`,
      isoDate,
      amount: schedule.amount,
    }));
  }, [schedule, selectedMonth]);

  const totalIncome = useMemo(
    () => paydaysForMonth.reduce((sum, payday) => sum + payday.amount, 0),
    [paydaysForMonth],
  );

  const previousMonth = useMemo(() => addMonths(selectedMonth, -1), [selectedMonth]);

  const totalIncomePreviousMonth = useMemo(() => {
    if (!schedule) {
      return 0;
    }
    return getPaydaysInMonth(schedule, previousMonth).length * schedule.amount;
  }, [schedule, previousMonth]);

  return {
    isLoading,
    schedule,
    setPaySchedule,
    removePaySchedule,
    paydaysForMonth,
    totalIncome,
    totalIncomePreviousMonth,
    /** Re-reads the pay schedule from storage, e.g. after a data import. */
    reload,
  };
};
