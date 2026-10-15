import { DEFAULT_CURRENCY_CODE } from '../constants/currencies';

export const formatCurrency = (
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
