import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCurrency } from '../contexts/CurrencyContext';

interface Props {
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
}

const SummaryCard: React.FC<Props> = ({ totalDue, totalPaid, totalRemaining }) => {
  const { formatCurrency } = useCurrency();

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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 20,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  total: {
    color: '#FFFFFF',
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
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  subValue: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  paidValue: {
    color: '#34D399',
  },
});

export default SummaryCard;
