import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_CURRENCY_CODE } from '../constants/currencies';
import {
  loadBudgetStartDate,
  loadCurrencyCode,
  loadHideNumbers,
  saveBudgetStartDate,
  saveCurrencyCode,
  saveHideNumbers,
} from '../storage/settingsStorage';
import {
  formatCurrency as formatCurrencyWithCode,
  maskCurrency,
} from '../utils/currency';
import { getTodayISODate } from '../utils/date';

interface CurrencyContextValue {
  currencyCode: string;
  isLoading: boolean;
  setCurrencyCode: (code: string) => void;
  formatCurrency: (amount: number) => string;
  hideNumbers: boolean;
  setHideNumbers: (hide: boolean) => void;
  /** ISO "YYYY-MM-DD" date the user started tracking their budget. */
  budgetStartDate: string;
  setBudgetStartDate: (isoDate: string) => void;
  /** Re-reads currency/privacy/start-date settings from storage, e.g. after a data import. */
  reload: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currencyCode, setCurrencyCodeState] = useState(DEFAULT_CURRENCY_CODE);
  const [hideNumbers, setHideNumbersState] = useState(false);
  const [budgetStartDate, setBudgetStartDateState] = useState(getTodayISODate());
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const [storedCurrency, storedHideNumbers, storedStartDate] = await Promise.all([
      loadCurrencyCode(),
      loadHideNumbers(),
      loadBudgetStartDate(),
    ]);
    if (storedCurrency) {
      setCurrencyCodeState(storedCurrency);
    }
    setHideNumbersState(storedHideNumbers !== null ? storedHideNumbers : false);
    if (storedStartDate) {
      setBudgetStartDateState(storedStartDate);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([loadCurrencyCode(), loadHideNumbers(), loadBudgetStartDate()]).then(
      ([storedCurrency, storedHideNumbers, storedStartDate]) => {
        if (isMounted) {
          if (storedCurrency) {
            setCurrencyCodeState(storedCurrency);
          }
          if (storedHideNumbers !== null) {
            setHideNumbersState(storedHideNumbers);
          }
          if (storedStartDate) {
            setBudgetStartDateState(storedStartDate);
          } else {
            // First launch: default to today and persist it, so historical
            // months (before the user ever used the app) are never treated
            // as having a real carried-over balance.
            const today = getTodayISODate();
            setBudgetStartDateState(today);
            saveBudgetStartDate(today);
          }
          setIsLoading(false);
        }
      },
    );
    return () => {
      isMounted = false;
    };
  }, []);

  const setCurrencyCode = useCallback((code: string) => {
    setCurrencyCodeState(code);
    saveCurrencyCode(code);
  }, []);

  const setHideNumbers = useCallback((hide: boolean) => {
    setHideNumbersState(hide);
    saveHideNumbers(hide);
  }, []);

  const setBudgetStartDate = useCallback((isoDate: string) => {
    setBudgetStartDateState(isoDate);
    saveBudgetStartDate(isoDate);
  }, []);

  const formatCurrency = useCallback(
    (amount: number) =>
      hideNumbers
        ? maskCurrency(currencyCode)
        : formatCurrencyWithCode(amount, currencyCode),
    [currencyCode, hideNumbers],
  );

  const value = useMemo(
    () => ({
      currencyCode,
      isLoading,
      setCurrencyCode,
      formatCurrency,
      hideNumbers,
      setHideNumbers,
      budgetStartDate,
      setBudgetStartDate,
      reload,
    }),
    [
      currencyCode,
      isLoading,
      setCurrencyCode,
      formatCurrency,
      hideNumbers,
      setHideNumbers,
      budgetStartDate,
      setBudgetStartDate,
      reload,
    ],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextValue => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
