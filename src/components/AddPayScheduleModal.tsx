import React, { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PayFrequency, PaySchedule } from '../types';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  visible: boolean;
  schedule: PaySchedule | null;
  onClose: () => void;
  onSubmit: (schedule: PaySchedule) => void;
  onDelete: () => void;
}

const FREQUENCIES: { value: PayFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'semimonthly', label: 'Twice a month' },
  { value: 'monthly', label: 'Monthly' },
];

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const AddPayScheduleModal: React.FC<Props> = ({
  visible,
  schedule,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<PayFrequency>('biweekly');
  const [anchorDate, setAnchorDate] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [secondDayOfMonth, setSecondDayOfMonth] = useState('15');
  const [error, setError] = useState('');
  const keyboardHeight = useKeyboardHeight();

  useEffect(() => {
    if (visible && schedule) {
      setAmount(String(schedule.amount));
      setFrequency(schedule.frequency);
      setAnchorDate(schedule.anchorDate);
      setDayOfMonth(String(schedule.dayOfMonth));
      setSecondDayOfMonth(String(schedule.secondDayOfMonth ?? 15));
    } else if (visible) {
      setAmount('');
      setFrequency('biweekly');
      setAnchorDate('');
      setDayOfMonth('1');
      setSecondDayOfMonth('15');
    }
    setError('');
  }, [visible, schedule]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  const usesAnchorDate = frequency === 'weekly' || frequency === 'biweekly';
  const usesDayOfMonth = frequency === 'monthly' || frequency === 'semimonthly';

  const handleSubmit = () => {
    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid pay amount greater than 0.');
      return;
    }

    if (usesAnchorDate) {
      if (!ISO_DATE_PATTERN.test(anchorDate)) {
        setError('Enter a payday date as YYYY-MM-DD.');
        return;
      }
      const [year, month, day] = anchorDate.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
      ) {
        setError('Enter a valid calendar date as YYYY-MM-DD.');
        return;
      }
    }

    let parsedDayOfMonth = 1;
    let parsedSecondDay: number | undefined;
    if (usesDayOfMonth) {
      parsedDayOfMonth = Number(dayOfMonth);
      if (
        !dayOfMonth ||
        Number.isNaN(parsedDayOfMonth) ||
        parsedDayOfMonth < 1 ||
        parsedDayOfMonth > 31
      ) {
        setError('Enter a day of month between 1 and 31.');
        return;
      }
      if (frequency === 'semimonthly') {
        parsedSecondDay = Number(secondDayOfMonth);
        if (
          !secondDayOfMonth ||
          Number.isNaN(parsedSecondDay) ||
          parsedSecondDay < 1 ||
          parsedSecondDay > 31
        ) {
          setError('Enter a second day of month between 1 and 31.');
          return;
        }
      }
    }

    onSubmit({
      amount: parsedAmount,
      frequency,
      anchorDate: usesAnchorDate
        ? anchorDate
        : schedule?.anchorDate ?? (anchorDate || '2025-01-03'),
      dayOfMonth: parsedDayOfMonth,
      secondDayOfMonth: parsedSecondDay,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropTouchable} onPress={onClose} />
      <View style={[styles.sheetWrap, { paddingBottom: keyboardHeight }]}>
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.handle} />
          <Text style={styles.title}>
            {schedule ? 'Edit Pay Schedule' : 'Add Pay Schedule'}
          </Text>

          <Text style={styles.fieldLabel}>Pay amount (take-home)</Text>
          <TextInput
            value={amount}
            onChangeText={text => {
              setAmount(text);
              setError('');
            }}
            placeholder="0.00"
            keyboardType="decimal-pad"
            style={styles.amountInput}
            placeholderTextColor={colors.textFaint}
            accessibilityLabel="Pay amount"
          />

          <Text style={styles.fieldLabel}>How often do you get paid?</Text>
          <View style={styles.frequencyRow}>
            {FREQUENCIES.map(f => {
              const selected = f.value === frequency;
              return (
                <Pressable
                  key={f.value}
                  onPress={() => {
                    setFrequency(f.value);
                    setError('');
                  }}
                  style={[styles.frequencyChip, selected && styles.frequencyChipSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={`Frequency ${f.label}`}
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.frequencyLabel,
                      selected && styles.frequencyLabelSelected,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {usesAnchorDate && (
            <>
              <Text style={styles.fieldLabel}>A recent or upcoming payday</Text>
              <TextInput
                value={anchorDate}
                onChangeText={text => {
                  setAnchorDate(text);
                  setError('');
                }}
                placeholder="YYYY-MM-DD"
                style={styles.textInput}
                placeholderTextColor={colors.textFaint}
                accessibilityLabel="Payday anchor date"
                maxLength={10}
              />
              <Text style={styles.helperText}>
                We use this date to figure out the rest of your paydays.
              </Text>
            </>
          )}

          {usesDayOfMonth && (
            <>
              <Text style={styles.fieldLabel}>
                {frequency === 'semimonthly' ? 'First payday, day of month' : 'Payday, day of month'}
              </Text>
              <TextInput
                value={dayOfMonth}
                onChangeText={text => {
                  setDayOfMonth(text.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                placeholder="1-31"
                keyboardType="number-pad"
                style={styles.textInput}
                placeholderTextColor={colors.textFaint}
                accessibilityLabel="Day of month"
                maxLength={2}
              />
            </>
          )}

          {frequency === 'semimonthly' && (
            <>
              <Text style={styles.fieldLabel}>Second payday, day of month</Text>
              <TextInput
                value={secondDayOfMonth}
                onChangeText={text => {
                  setSecondDayOfMonth(text.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                placeholder="1-31"
                keyboardType="number-pad"
                style={styles.textInput}
                placeholderTextColor={colors.textFaint}
                accessibilityLabel="Second day of month"
                maxLength={2}
              />
            </>
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSubmit}
              accessibilityRole="button"
            >
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>

          {schedule && (
            <Pressable
              style={styles.deleteButton}
              onPress={handleDelete}
              accessibilityRole="button"
            >
              <Text style={styles.deleteText}>Remove pay schedule</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.backdrop,
      justifyContent: 'flex-end',
      zIndex: 10,
    },
    backdropTouchable: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    sheetWrap: {
      width: '100%',
      maxHeight: '88%',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    sheetContent: {
      padding: 20,
      paddingBottom: 32,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.handle,
      alignSelf: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 6,
      marginTop: 12,
    },
    textInput: {
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.handle,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    amountInput: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      paddingVertical: 4,
      borderBottomWidth: 2,
      borderBottomColor: colors.handle,
    },
    helperText: {
      fontSize: 12,
      color: colors.textFaint,
      marginTop: 6,
    },
    error: {
      color: colors.danger,
      fontSize: 13,
      marginTop: 6,
    },
    frequencyRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    frequencyChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.handle,
      backgroundColor: colors.surface,
    },
    frequencyChipSelected: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    frequencyLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    frequencyLabelSelected: {
      color: colors.onSuccess,
    },
    actions: {
      flexDirection: 'row',
      marginTop: 24,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.surfaceAlt,
    },
    cancelText: {
      color: colors.textMuted,
      fontWeight: '600',
      fontSize: 15,
    },
    saveButton: {
      backgroundColor: colors.success,
    },
    saveText: {
      color: colors.onSuccess,
      fontWeight: '700',
      fontSize: 15,
    },
    deleteButton: {
      marginTop: 16,
      paddingVertical: 12,
      alignItems: 'center',
    },
    deleteText: {
      color: colors.danger,
      fontWeight: '600',
      fontSize: 14,
    },
  });

export default AddPayScheduleModal;
