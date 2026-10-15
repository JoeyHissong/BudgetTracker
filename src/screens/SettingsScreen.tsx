import React, { useEffect } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CURRENCIES } from '../constants/currencies';
import { useCurrency } from '../contexts/CurrencyContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SettingsScreen: React.FC<Props> = ({ visible, onClose }) => {
  const { currencyCode, setCurrencyCode } = useCurrency();

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
            <Text style={styles.title}>Settings</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close settings"
              hitSlop={8}
            >
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>Currency</Text>
          <View style={styles.currencyList}>
            {CURRENCIES.map(currency => {
              const selected = currency.code === currencyCode;
              return (
                <Pressable
                  key={currency.code}
                  onPress={() => setCurrencyCode(currency.code)}
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

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#E5E7EB',
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
    color: '#111827',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  currencyList: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  currencyRowSelected: {
    backgroundColor: '#EFF6FF',
  },
  currencySymbol: {
    width: 36,
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  currencyTextWrap: {
    flex: 1,
  },
  currencyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  currencyCode: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
});

export default SettingsScreen;
