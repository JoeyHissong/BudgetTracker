import { useMemo } from 'react';
import { BillWithStatus, useBills } from './useBills';
import { usePaySchedule } from './usePaySchedule';
import { useCurrency } from '../contexts/CurrencyContext';
import { addMonths, clampDueDay, getMonthKey, parseISODate } from '../utils/date';

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
    }
  | {
      type: 'carryover';
      id: string;
      day: number;
      /** Leftover income from last month, carried in to fund this month's early bills. */
      amount: number;
      /** Total amount of bills due before this month's first payday. */
      coveredAmount: number;
    };

/**
 * Combines the current month's bills and generated paydays into a single
 * date-sorted timeline, so paydays appear interleaved between the bills they
 * fund.
 *
 * Also carries forward any leftover income from last month (what was
 * received minus all bills owed that month, whether or not they were
 * actually marked paid) as a starting balance for this month, so a paycheck
 * landing near the end of one month is still available to cover bills due
 * at the start of the next.
 *
 * Carry-over never applies to the month the user started tracking their
 * budget (or any month before it), since there's no real history to base a
 * "leftover" on before that point.
 */
export const useTimeline = (selectedMonth: Date) => {
  const billsHook = useBills(selectedMonth);
  const payScheduleHook = usePaySchedule(selectedMonth);
  const { budgetStartDate } = useCurrency();

  const previousMonthHasHistory =
    getMonthKey(addMonths(selectedMonth, -1)) >= getMonthKey(parseISODate(budgetStartDate));

  const carryIn = previousMonthHasHistory
    ? Math.max(
        payScheduleHook.totalIncomePreviousMonth - billsHook.totalDuePreviousMonth,
        0,
      )
    : 0;

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
    const firstPaydayDay = paydayDays[0] ?? Infinity;

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

    const carryoverItems: TimelineItem[] = [];
    if (carryIn > 0) {
      // Leftover from last month funds bills due before this month's first
      // payday (or the whole month, if there's no payday at all).
      const coveredAmount = billsHook.billsForMonth
        .filter(bill => clampDueDay(selectedMonth, bill.dueDay) < firstPaydayDay)
        .reduce((sum, bill) => sum + bill.amount, 0);

      carryoverItems.push({
        type: 'carryover',
        id: 'carryover',
        day: 0,
        amount: carryIn,
        coveredAmount,
      });
    }

    return [...billItems, ...paydayItems, ...carryoverItems].sort((a, b) => {
      if (a.day !== b.day) {
        return a.day - b.day;
      }
      // On a tie, show income (payday/carryover) before bills, so it reads
      // as funding same-day bills.
      const aIsIncome = a.type !== 'bill';
      const bIsIncome = b.type !== 'bill';
      if (aIsIncome === bIsIncome) {
        return 0;
      }
      return aIsIncome ? -1 : 1;
    });
  }, [
    billsHook.billsForMonth,
    payScheduleHook.paydaysForMonth,
    selectedMonth,
    carryIn,
  ]);

  return {
    isLoading: billsHook.isLoading || payScheduleHook.isLoading,
    timeline,
    totalDue: billsHook.totalDue,
    totalPaid: billsHook.totalPaid,
    // "Remaining" is strictly what's left to pay on this month's bills.
    // carryIn is leftover cash, not a bill, so it belongs in totalIncome
    // (and in its own "Carried over" row in the timeline) rather than here.
    totalRemaining: billsHook.totalRemaining,
    totalIncome: payScheduleHook.totalIncome + carryIn,
    carryIn,
    addBill: billsHook.addBill,
    updateBill: billsHook.updateBill,
    deleteBill: billsHook.deleteBill,
    togglePaid: billsHook.togglePaid,
    paySchedule: payScheduleHook.schedule,
    setPaySchedule: payScheduleHook.setPaySchedule,
    removePaySchedule: payScheduleHook.removePaySchedule,
    /** Re-reads bills, payments, and pay schedule from storage, e.g. after a data import. */
    reload: async () => {
      await Promise.all([billsHook.reload(), payScheduleHook.reload()]);
    },
  };
};
