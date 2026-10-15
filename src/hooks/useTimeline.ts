import { useMemo } from 'react';
import { BillWithStatus, useBills } from './useBills';
import { usePaySchedule } from './usePaySchedule';
import { clampDueDay } from '../utils/date';

export type TimelineItem =
  | {
      type: 'bill';
      id: string;
      day: number;
      bill: BillWithStatus;
    }
  | {
      type: 'payday';
      id: string;
      day: number;
      isoDate: string;
      amount: number;
      /** Total amount of bills due on/after this payday and before the next. */
      coveredAmount: number;
    };

/**
 * Combines the current month's bills and generated paydays into a single
 * date-sorted timeline, so paydays appear interleaved between the bills they
 * fund.
 */
export const useTimeline = (selectedMonth: Date) => {
  const billsHook = useBills(selectedMonth);
  const payScheduleHook = usePaySchedule(selectedMonth);

  const timeline: TimelineItem[] = useMemo(() => {
    const billItems: TimelineItem[] = billsHook.billsForMonth.map(bill => ({
      type: 'bill',
      id: `bill-${bill.id}`,
      day: clampDueDay(selectedMonth, bill.dueDay),
      bill,
    }));

    const paydayDays = payScheduleHook.paydaysForMonth
      .map(payday => Number(payday.isoDate.slice(8, 10)))
      .sort((a, b) => a - b);

    const paydayItems: TimelineItem[] = payScheduleHook.paydaysForMonth.map(payday => {
      const day = Number(payday.isoDate.slice(8, 10));
      const nextPaydayDay = paydayDays.find(d => d > day) ?? Infinity;
      const coveredAmount = billsHook.billsForMonth
        .filter(bill => {
          const billDay = clampDueDay(selectedMonth, bill.dueDay);
          return billDay >= day && billDay < nextPaydayDay;
        })
        .reduce((sum, bill) => sum + bill.amount, 0);

      return {
        type: 'payday',
        id: payday.id,
        day,
        isoDate: payday.isoDate,
        amount: payday.amount,
        coveredAmount,
      };
    });

    return [...billItems, ...paydayItems].sort((a, b) => {
      if (a.day !== b.day) {
        return a.day - b.day;
      }
      // On a tie, show the payday first so it reads as funding same-day bills.
      return a.type === 'payday' ? -1 : 1;
    });
  }, [billsHook.billsForMonth, payScheduleHook.paydaysForMonth, selectedMonth]);

  return {
    isLoading: billsHook.isLoading || payScheduleHook.isLoading,
    timeline,
    totalDue: billsHook.totalDue,
    totalPaid: billsHook.totalPaid,
    totalRemaining: billsHook.totalRemaining,
    totalIncome: payScheduleHook.totalIncome,
    addBill: billsHook.addBill,
    updateBill: billsHook.updateBill,
    deleteBill: billsHook.deleteBill,
    togglePaid: billsHook.togglePaid,
    paySchedule: payScheduleHook.schedule,
    setPaySchedule: payScheduleHook.setPaySchedule,
    removePaySchedule: payScheduleHook.removePaySchedule,
  };
};
