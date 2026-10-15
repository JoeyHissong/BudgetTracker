import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_CURRENCY_CODE } from '../constants/currencies';
import { loadCurrencyCode, saveCurrencyCode } from '../storage/settingsStorage';
import { formatCurrency as formatCurrencyWithCode } from '../utils/currency';

interface CurrencyContextValue {
  currencyCode: string;
  isLoading: boolean;
  setCurrencyCode: (code: string) => void;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currencyCode, setCurrencyCodeState] = useState(DEFAULT_CURRENCY_CODE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    loadCurrencyCode().then(stored => {
      if (isMounted) {
        if (stored) {
          setCurrencyCodeState(stored);
        }
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setCurrencyCode = useCallback((code: string) => {
    setCurrencyCodeState(code);
    saveCurrencyCode(code);
  }, []);

  const formatCurrency = useCallback(
    (amount: number) => formatCurrencyWithCode(amount, currencyCode),
    [currencyCode],
  );

  const value = useMemo(
    () => ({ currencyCode, isLoading, setCurrencyCode, formatCurrency }),
    [currencyCode, isLoading, setCurrencyCode, formatCurrency],
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
