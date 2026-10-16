import { DEFAULT_CURRENCY_CODE, getCurrencyOption } from '../constants/currencies';

export const formatCurrency = (
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);

/** Masked placeholder shown instead of a real amount when "Hide numbers" is on. */
export const maskCurrency = (currencyCode: string = DEFAULT_CURRENCY_CODE): string =>
  `${getCurrencyOption(currencyCode).symbol}••••`;
