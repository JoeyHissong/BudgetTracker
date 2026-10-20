import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCurrency } from '../contexts/CurrencyContext';
import { ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
  totalIncome?: number;
}

const SummaryCard: React.FC<Props> = ({
  totalDue,
  totalPaid,
  totalRemaining,
  totalIncome,
}) => {
  const { formatCurrency } = useCurrency();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Remaining this month</Text>
      <Text style={styles.total}>{formatCurrency(totalRemaining)}</Text>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.subLabel}>Total due</Text>
          <Text style={styles.subValue}>{formatCurrency(totalDue)}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.subLabel}>Paid</Text>
          <Text style={[styles.subValue, styles.paidValue]}>
            {formatCurrency(totalPaid)}
          </Text>
        </View>
        {!!totalIncome && (
          <View style={styles.column}>
            <Text style={styles.subLabel}>Income</Text>
            <Text style={[styles.subValue, styles.incomeValue]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.summaryCardBackground,
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 8,
      padding: 20,
    },
    label: {
      color: colors.summaryCardTextMuted,
      fontSize: 13,
      fontWeight: '500',
    },
    total: {
      color: colors.summaryCardText,
      fontSize: 36,
      fontWeight: '800',
      marginTop: 4,
    },
    row: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 24,
    },
    column: {
      flex: 1,
    },
    subLabel: {
      color: colors.summaryCardTextMuted,
      fontSize: 12,
      fontWeight: '500',
    },
    subValue: {
      color: colors.summaryCardText,
      fontSize: 16,
      fontWeight: '700',
      marginTop: 2,
      opacity: 0.9,
    },
    paidValue: {
      color: colors.success,
      opacity: 1,
    },
    incomeValue: {
      color: colors.summaryCardIncome,
      opacity: 1,
    },
  });

export default SummaryCard;
