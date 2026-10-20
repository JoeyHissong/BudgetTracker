import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCurrency } from '../contexts/CurrencyContext';
import { ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  amount: number;
  coveredAmount: number;
}

/**
 * Shows the leftover balance carried in from last month (income actually
 * received minus bills actually paid), and how much of it is earmarked for
 * bills due before this month's first payday.
 */
const CarryoverListItem: React.FC<Props> = ({ amount, coveredAmount }) => {
  const { formatCurrency } = useCurrency();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const leftOver = amount - coveredAmount;

  return (
    <View
      style={styles.row}
      accessibilityLabel={`Starting balance carried over from last month, ${formatCurrency(
        amount,
      )}`}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>↪️</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>Carried over from last month</Text>
        <Text style={styles.meta}>
          Covers {formatCurrency(coveredAmount)} in bills
          {leftOver > 0 ? ` · ${formatCurrency(leftOver)} left over` : ''}
        </Text>
      </View>
      <Text style={styles.amount}>+{formatCurrency(amount)}</Text>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.carryoverBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.carryoverBorder,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      backgroundColor: colors.carryoverIconBackground,
    },
    icon: {
      fontSize: 18,
    },
    details: {
      flex: 1,
    },
    name: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.carryoverText,
    },
    meta: {
      fontSize: 12,
      color: colors.carryoverTextMuted,
      marginTop: 2,
    },
    amount: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.carryoverAmount,
      marginRight: 12,
    },
  });

export default CarryoverListItem;
