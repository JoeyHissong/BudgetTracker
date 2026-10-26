import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BillWithStatus } from '../hooks/useBills';
import { getCategoryInfo } from '../constants/categories';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatDueDate, isPastDue } from '../utils/date';
import { estimateBillPayoff, formatMonthsRemaining } from '../utils/loan';
import { ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  bill: BillWithStatus;
  month: Date;
  onTogglePaid: (id: string) => void;
  onPress: (bill: BillWithStatus) => void;
}

const BillListItem: React.FC<Props> = ({ bill, month, onTogglePaid, onPress }) => {
  const { formatCurrency } = useCurrency();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const categoryInfo = getCategoryInfo(bill.category);
  const overdue = !bill.isPaid && isPastDue(month, bill.dueDay);
  const payoff = bill.category === 'Loan/Debt' ? estimateBillPayoff(bill) : null;

  return (
    <Pressable
      style={styles.row}
      onPress={() => onPress(bill)}
      accessibilityRole="button"
      accessibilityLabel={`${bill.name}, ${formatCurrency(bill.amount)}, ${
        bill.isPaid ? 'paid' : 'unpaid'
      }`}
    >
      <View style={[styles.iconWrap, { backgroundColor: categoryInfo.color + '22' }]}>
        <Text style={styles.icon}>{categoryInfo.emoji}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {bill.name}
        </Text>
        <Text style={[styles.meta, overdue && styles.overdueMeta]}>
          {formatDueDate(month, bill.dueDay)}
          {overdue ? ' · Overdue' : ''}
        </Text>
        {bill.category === 'Loan/Debt' &&
          (bill.remainingBalance !== undefined || bill.interestRate !== undefined) && (
            <Text style={styles.loanMeta} numberOfLines={1}>
              {bill.remainingBalance !== undefined
                ? `${formatCurrency(bill.remainingBalance)} left`
                : ''}
              {bill.remainingBalance !== undefined && bill.interestRate !== undefined
                ? ' · '
                : ''}
              {bill.interestRate !== undefined
                ? `${bill.interestRate}% APR`
                : ''}
              {payoff ? ` · ${formatMonthsRemaining(payoff.monthsRemaining)}` : ''}
            </Text>
          )}
      </View>
      <Text style={styles.amount}>{formatCurrency(bill.amount)}</Text>
      <Pressable
        onPress={() => onTogglePaid(bill.id)}
        style={[styles.checkbox, bill.isPaid && styles.checkboxChecked]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: bill.isPaid }}
        accessibilityLabel={`Mark ${bill.name} as ${bill.isPaid ? 'unpaid' : 'paid'}`}
        hitSlop={8}
      >
        {bill.isPaid && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>
    </Pressable>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    icon: {
      fontSize: 18,
    },
    details: {
      flex: 1,
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    meta: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    overdueMeta: {
      color: colors.danger,
      fontWeight: '600',
    },
    loanMeta: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    amount: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginRight: 12,
    },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    checkmark: {
      color: colors.onSuccess,
      fontSize: 15,
      fontWeight: '700',
    },
  });

export default BillListItem;
