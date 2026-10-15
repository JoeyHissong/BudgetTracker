import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatMonthLabel } from '../utils/date';

interface Props {
  month: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const MonthHeader: React.FC<Props> = ({ month, onPrevMonth, onNextMonth }) => (
  <View style={styles.container}>
    <Pressable
      onPress={onPrevMonth}
      style={styles.navButton}
      accessibilityRole="button"
      accessibilityLabel="Previous month"
    >
      <Text style={styles.navText}>‹</Text>
    </Pressable>
    <Text style={styles.monthLabel}>{formatMonthLabel(month)}</Text>
    <Pressable
      onPress={onNextMonth}
      style={styles.navButton}
      accessibilityRole="button"
      accessibilityLabel="Next month"
    >
      <Text style={styles.navText}>›</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 28,
    color: '#374151',
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
});

export default MonthHeader;
