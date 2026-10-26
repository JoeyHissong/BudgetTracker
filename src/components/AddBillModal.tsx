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
import { CATEGORIES } from '../constants/categories';
import { BillCategory } from '../types';
import { NewBillInput, BillWithStatus } from '../hooks/useBills';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { estimateLoanPayoff, formatMonthsRemaining } from '../utils/loan';
import DayOfMonthPickerModal from './DayOfMonthPickerModal';

interface Props {
  visible: boolean;
  /** When set, the modal edits this bill instead of creating a new one. */
  editingBill: BillWithStatus | null;
  onClose: () => void;
  onSubmit: (input: NewBillInput) => void;
  onDelete: (id: string) => void;
}

const AddBillModal: React.FC<Props> = ({
  visible,
  editingBill,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const { formatCurrency } = useCurrency();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<BillCategory>('Rent/Mortgage');
  const [interestRate, setInterestRate] = useState('');
  const [remainingBalance, setRemainingBalance] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [lender, setLender] = useState('');
  const [error, setError] = useState('');
  const [isDayPickerVisible, setIsDayPickerVisible] = useState(false);
  const keyboardHeight = useKeyboardHeight();

  const isLoan = category === 'Loan/Debt';

  const payoffEstimate = useMemo(() => {
    if (!isLoan) {
      return null;
    }
    const balance = Number(remainingBalance);
    const payment = Number(minimumPayment || amount);
    const rate = interestRate ? Number(interestRate) : undefined;
    if (!remainingBalance.trim() || Number.isNaN(balance) || Number.isNaN(payment)) {
      return null;
    }
    return estimateLoanPayoff(balance, payment, rate);
  }, [isLoan, remainingBalance, minimumPayment, amount, interestRate]);

  useEffect(() => {
    if (visible && editingBill) {
      setName(editingBill.name);
      setAmount(String(editingBill.amount));
      setDueDay(String(editingBill.dueDay));
      setNote(editingBill.note);
      setCategory(editingBill.category);
      setInterestRate(
        editingBill.interestRate !== undefined ? String(editingBill.interestRate) : '',
      );
      setRemainingBalance(
        editingBill.remainingBalance !== undefined
          ? String(editingBill.remainingBalance)
          : '',
      );
      setMinimumPayment(
        editingBill.minimumPayment !== undefined
          ? String(editingBill.minimumPayment)
          : '',
      );
      setLender(editingBill.lender ?? '');
    } else if (visible) {
      setName('');
      setAmount('');
      setDueDay('1');
      setNote('');
      setCategory('Rent/Mortgage');
      setInterestRate('');
      setRemainingBalance('');
      setMinimumPayment('');
      setLender('');
    }
    setError('');
    setIsDayPickerVisible(false);
  }, [visible, editingBill]);

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

  const handleSubmit = () => {
    const parsedAmount = Number(amount);
    const parsedDueDay = Number(dueDay);

    if (!name.trim()) {
      setError('Enter a bill name.');
      return;
    }
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }
    if (
      !dueDay ||
      Number.isNaN(parsedDueDay) ||
      parsedDueDay < 1 ||
      parsedDueDay > 31
    ) {
      setError('Enter a due day between 1 and 31.');
      return;
    }

    let parsedInterestRate: number | undefined;
    let parsedRemainingBalance: number | undefined;
    let parsedMinimumPayment: number | undefined;

    if (isLoan) {
      if (interestRate.trim()) {
        parsedInterestRate = Number(interestRate);
        if (Number.isNaN(parsedInterestRate) || parsedInterestRate < 0) {
          setError('Enter a valid interest rate (0 or greater).');
          return;
        }
      }
      if (remainingBalance.trim()) {
        parsedRemainingBalance = Number(remainingBalance);
        if (Number.isNaN(parsedRemainingBalance) || parsedRemainingBalance < 0) {
          setError('Enter a valid remaining balance (0 or greater).');
          return;
        }
      }
      if (minimumPayment.trim()) {
        parsedMinimumPayment = Number(minimumPayment);
        if (Number.isNaN(parsedMinimumPayment) || parsedMinimumPayment < 0) {
          setError('Enter a valid minimum payment (0 or greater).');
          return;
        }
      }
    }

    onSubmit({
      name: name.trim(),
      amount: parsedAmount,
      category,
      dueDay: parsedDueDay,
      note: note.trim(),
      interestRate: isLoan ? parsedInterestRate : undefined,
      remainingBalance: isLoan ? parsedRemainingBalance : undefined,
      minimumPayment: isLoan ? parsedMinimumPayment : undefined,
      lender: isLoan ? lender.trim() || undefined : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (editingBill) {
      onDelete(editingBill.id);
      onClose();
    }
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
            {editingBill ? 'Edit Bill' : 'Add Recurring Bill'}
          </Text>

          <Text style={styles.fieldLabel}>Bill name</Text>
          <TextInput
            value={name}
            onChangeText={text => {
              setName(text);
              setError('');
            }}
            placeholder="e.g. Rent"
            style={styles.textInput}
            placeholderTextColor={colors.textFaint}
            accessibilityLabel="Bill name"
          />

          <Text style={styles.fieldLabel}>Amount</Text>
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
            accessibilityLabel="Bill amount"
          />

          <Text style={styles.fieldLabel}>Due day of month</Text>
          <Pressable
            style={styles.textInput}
            onPress={() => setIsDayPickerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Choose due day of month"
          >
            <Text style={[styles.dateFieldText, !dueDay && styles.dateFieldPlaceholder]}>
              {dueDay || 'Select a day'}
            </Text>
          </Pressable>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {CATEGORIES.map(c => {
              const selected = c.label === category;
              return (
                <Pressable
                  key={c.label}
                  onPress={() => setCategory(c.label)}
                  style={[
                    styles.categoryChip,
                    selected && {
                      backgroundColor: c.color,
                      borderColor: c.color,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Category ${c.label}`}
                  accessibilityState={{ selected }}
                >
                  <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      selected && styles.categoryLabelSelected,
                    ]}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {isLoan && (
            <>
              <Text style={styles.fieldLabel}>Lender (optional)</Text>
              <TextInput
                value={lender}
                onChangeText={text => {
                  setLender(text);
                  setError('');
                }}
                placeholder="e.g. Chase, Sallie Mae"
                style={styles.textInput}
                placeholderTextColor={colors.textFaint}
                accessibilityLabel="Lender"
              />

              <Text style={styles.fieldLabel}>Interest rate (APR %, optional)</Text>
              <TextInput
                value={interestRate}
                onChangeText={text => {
                  setInterestRate(text.replace(/[^0-9.]/g, ''));
                  setError('');
                }}
                placeholder="e.g. 5.25"
                keyboardType="decimal-pad"
                style={styles.textInput}
                placeholderTextColor={colors.textFaint}
                accessibilityLabel="Interest rate"
              />

              <Text style={styles.fieldLabel}>Remaining balance (optional)</Text>
              <TextInput
                value={remainingBalance}
                onChangeText={text => {
                  setRemainingBalance(text.replace(/[^0-9.]/g, ''));
                  setError('');
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                style={styles.textInput}
                placeholderTextColor={colors.textFaint}
                accessibilityLabel="Remaining balance"
              />

              <Text style={styles.fieldLabel}>Minimum payment (optional)</Text>
              <TextInput
                value={minimumPayment}
                onChangeText={text => {
                  setMinimumPayment(text.replace(/[^0-9.]/g, ''));
                  setError('');
                }}
                placeholder="Leave blank to use the amount above"
                keyboardType="decimal-pad"
                style={styles.textInput}
                placeholderTextColor={colors.textFaint}
                accessibilityLabel="Minimum payment"
              />

              {payoffEstimate && (
                <Text style={styles.payoffEstimate}>
                  Estimated payoff: {formatMonthsRemaining(payoffEstimate.monthsRemaining)}
                  {payoffEstimate.totalInterestRemaining > 0
                    ? ` · ~${formatCurrency(payoffEstimate.totalInterestRemaining)} interest`
                    : ''}
                </Text>
              )}
            </>
          )}

          <Text style={styles.fieldLabel}>Note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Autopay from checking"
            style={styles.textInput}
            placeholderTextColor={colors.textFaint}
            accessibilityLabel="Bill note"
          />

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

          {editingBill && (
            <Pressable
              style={styles.deleteButton}
              onPress={handleDelete}
              accessibilityRole="button"
            >
              <Text style={styles.deleteText}>Delete bill</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      <DayOfMonthPickerModal
        visible={isDayPickerVisible}
        title="Due day of month"
        value={dueDay ? Number(dueDay) : null}
        onClose={() => setIsDayPickerVisible(false)}
        onSelect={day => {
          setDueDay(String(day));
          setError('');
        }}
      />
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
    dateFieldText: {
      fontSize: 15,
      color: colors.text,
    },
    dateFieldPlaceholder: {
      color: colors.textFaint,
    },
    error: {
      color: colors.danger,
      fontSize: 13,
      marginTop: 6,
    },
    payoffEstimate: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 8,
    },
    categoryScroll: {
      flexGrow: 0,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.handle,
      marginRight: 8,
      backgroundColor: colors.surface,
    },
    categoryEmoji: {
      fontSize: 15,
      marginRight: 6,
    },
    categoryLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    categoryLabelSelected: {
      color: colors.onAccent,
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
      backgroundColor: colors.text,
    },
    saveText: {
      color: colors.background,
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

export default AddBillModal;
