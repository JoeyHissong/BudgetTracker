import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bill, BillCategory, PaymentRecord } from '../types';
import {
  loadBills,
  loadPayments,
  saveBills,
  savePayments,
} from '../storage/billStorage';
import { getMonthKey } from '../utils/date';

export interface NewBillInput {
  name: string;
  amount: number;
  category: BillCategory;
  dueDay: number;
  note: string;
}

export interface BillWithStatus extends Bill {
  isPaid: boolean;
}

export const useBills = (selectedMonth: Date) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([loadBills(), loadPayments()]).then(([storedBills, storedPayments]) => {
      if (isMounted) {
        setBills(storedBills);
        setPayments(storedPayments);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const persistBills = useCallback((next: Bill[]) => {
    setBills(next);
    saveBills(next);
  }, []);

  const persistPayments = useCallback((next: PaymentRecord[]) => {
    setPayments(next);
    savePayments(next);
  }, []);

  const addBill = useCallback(
    (input: NewBillInput) => {
      const bill: Bill = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        ...input,
      };
      persistBills([bill, ...bills]);
    },
    [bills, persistBills],
  );

  const updateBill = useCallback(
    (id: string, input: NewBillInput) => {
      persistBills(bills.map(bill => (bill.id === id ? { ...bill, ...input } : bill)));
    },
    [bills, persistBills],
  );

  const deleteBill = useCallback(
    (id: string) => {
      persistBills(bills.filter(bill => bill.id !== id));
      persistPayments(payments.filter(payment => payment.billId !== id));
    },
    [bills, payments, persistBills, persistPayments],
  );

  const monthKey = useMemo(() => getMonthKey(selectedMonth), [selectedMonth]);

  const paidBillIdsForMonth = useMemo(
    () =>
      new Set(
        payments.filter(payment => payment.monthKey === monthKey).map(p => p.billId),
      ),
    [payments, monthKey],
  );

  const togglePaid = useCallback(
    (billId: string) => {
      const isPaid = paidBillIdsForMonth.has(billId);
      if (isPaid) {
        persistPayments(
          payments.filter(
            payment => !(payment.billId === billId && payment.monthKey === monthKey),
          ),
        );
      } else {
        persistPayments([...payments, { billId, monthKey }]);
      }
    },
    [payments, paidBillIdsForMonth, monthKey, persistPayments],
  );

  const billsForMonth: BillWithStatus[] = useMemo(
    () =>
      bills
        .map(bill => ({ ...bill, isPaid: paidBillIdsForMonth.has(bill.id) }))
        .sort((a, b) => a.dueDay - b.dueDay),
    [bills, paidBillIdsForMonth],
  );

  const totalDue = useMemo(
    () => billsForMonth.reduce((sum, bill) => sum + bill.amount, 0),
    [billsForMonth],
  );

  const totalPaid = useMemo(
    () => billsForMonth.filter(bill => bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0),
    [billsForMonth],
  );

  const totalRemaining = totalDue - totalPaid;

  return {
    isLoading,
    billsForMonth,
    totalDue,
    totalPaid,
    totalRemaining,
    addBill,
    updateBill,
    deleteBill,
    togglePaid,
  };
};
