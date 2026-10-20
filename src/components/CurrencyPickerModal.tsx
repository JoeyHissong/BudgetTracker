import React, { useEffect, useMemo } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CURRENCIES } from '../constants/currencies';
import { ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  visible: boolean;
  currencyCode: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

/**
 * Full-list currency picker, opened from the "Currency" row in Settings.
 * Selecting a currency applies it immediately and closes the picker.
 */
const CurrencyPickerModal: React.FC<Props> = ({
  visible,
  currencyCode,
  onSelect,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropTouchable} onPress={onClose} />
      <View style={styles.sheetWrap}>
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>Currency</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close currency picker"
              hitSlop={8}
            >
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.currencyList}>
            {CURRENCIES.map(currency => {
              const selected = currency.code === currencyCode;
              return (
                <Pressable
                  key={currency.code}
                  onPress={() => {
                    onSelect(currency.code);
                    onClose();
                  }}
                  style={[styles.currencyRow, selected && styles.currencyRowSelected]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${currency.name} (${currency.code})`}
                >
                  <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                  <View style={styles.currencyTextWrap}>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                    <Text style={styles.currencyCode}>{currency.code}</Text>
                  </View>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
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
      zIndex: 20,
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
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    closeText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.accent,
    },
    currencyList: {
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    currencyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    currencyRowSelected: {
      backgroundColor: colors.surfaceAlt,
    },
    currencySymbol: {
      width: 36,
      fontSize: 16,
      fontWeight: '700',
      color: colors.textMuted,
    },
    currencyTextWrap: {
      flex: 1,
    },
    currencyName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    currencyCode: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    checkmark: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accent,
    },
  });

export default CurrencyPickerModal;
