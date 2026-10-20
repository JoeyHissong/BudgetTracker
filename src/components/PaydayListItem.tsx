import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatPaydayLabel } from '../utils/date';
import { ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  isoDate: string;
  amount: number;
  coveredAmount: number;
  onPress: () => void;
}

const PaydayListItem: React.FC<Props> = ({ isoDate, amount, coveredAmount, onPress }) => {
  const { formatCurrency } = useCurrency();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const leftOver = amount - coveredAmount;

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${formatPaydayLabel(isoDate)}, ${formatCurrency(amount)}`}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>💰</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>{formatPaydayLabel(isoDate)}</Text>
        <Text style={styles.meta}>
          Covers {formatCurrency(coveredAmount)} in bills
          {leftOver > 0 ? ` · ${formatCurrency(leftOver)} left over` : ''}
        </Text>
      </View>
      <Text style={styles.amount}>+{formatCurrency(amount)}</Text>
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
      backgroundColor: colors.paydayBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.paydayBorder,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      backgroundColor: colors.paydayIconBackground,
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
      color: colors.paydayText,
    },
    meta: {
      fontSize: 12,
      color: colors.paydayTextMuted,
      marginTop: 2,
    },
    amount: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.paydayAmount,
      marginRight: 12,
    },
  });

export default PaydayListItem;
