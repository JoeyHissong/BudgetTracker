import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BillWithStatus } from '../hooks/useBills';
import { getCategoryInfo } from '../constants/categories';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatDueDate, isPastDue } from '../utils/date';

interface Props {
  bill: BillWithStatus;
  month: Date;
  onTogglePaid: (id: string) => void;
  onPress: (bill: BillWithStatus) => void;
}

const BillListItem: React.FC<Props> = ({ bill, month, onTogglePaid, onPress }) => {
  const { formatCurrency } = useCurrency();
  const categoryInfo = getCategoryInfo(bill.category);
  const overdue = !bill.isPaid && isPastDue(month, bill.dueDay);

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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    color: '#111827',
  },
  meta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  overdueMeta: {
    color: '#DC2626',
    fontWeight: '600',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginRight: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default BillListItem;
