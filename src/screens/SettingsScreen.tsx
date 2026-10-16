import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getCurrencyOption } from '../constants/currencies';
import { useCurrency } from '../contexts/CurrencyContext';
import CurrencyPickerModal from '../components/CurrencyPickerModal';

const DEVELOPER_URL = 'https://www.joeyhissong.com';
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SettingsScreen: React.FC<Props> = ({ visible, onClose }) => {
  const {
    currencyCode,
    setCurrencyCode,
    hideNumbers,
    setHideNumbers,
    budgetStartDate,
    setBudgetStartDate,
  } = useCurrency();
  const [startDateInput, setStartDateInput] = useState(budgetStartDate);
  const [startDateError, setStartDateError] = useState('');
  const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);
  const selectedCurrency = getCurrencyOption(currencyCode);

  useEffect(() => {
    if (visible) {
      setStartDateInput(budgetStartDate);
      setStartDateError('');
    }
  }, [visible, budgetStartDate]);

  const commitStartDate = () => {
    if (!ISO_DATE_PATTERN.test(startDateInput)) {
      setStartDateError('Enter a date as YYYY-MM-DD.');
      return;
    }
    const [year, month, day] = startDateInput.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      setStartDateError('Enter a valid calendar date.');
      return;
    }
    setStartDateError('');
    setBudgetStartDate(startDateInput);
  };

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

          <Pressable
            style={styles.linkRow}
            onPress={() => setIsCurrencyPickerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Currency, currently ${selectedCurrency.name} (${selectedCurrency.code})`}
          >
            <Text style={styles.linkRowLabel}>Currency</Text>
            <View style={styles.linkRowValueWrap}>
              <Text style={styles.linkRowValue}>
                {selectedCurrency.symbol} {selectedCurrency.code}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>

          <Text style={[styles.fieldLabel, styles.sectionSpacing]}>Privacy</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleLabel}>Hide numbers</Text>
              <Text style={styles.toggleSubtext}>Blur amounts shown throughout the app</Text>
            </View>
            <Switch
              value={hideNumbers}
              onValueChange={setHideNumbers}
              accessibilityRole="switch"
              accessibilityLabel="Hide numbers"
              accessibilityState={{ checked: hideNumbers }}
              trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Text style={[styles.fieldLabel, styles.sectionSpacing]}>Budget tracking</Text>
          <View style={styles.startDateCard}>
            <Text style={styles.toggleLabel}>Start date</Text>
            <Text style={styles.toggleSubtext}>
              The date you started tracking with this app. Bills and paychecks
              before this date aren't counted as a carried-over balance.
            </Text>
            <TextInput
              value={startDateInput}
              onChangeText={text => {
                setStartDateInput(text);
                setStartDateError('');
              }}
              onBlur={commitStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              style={styles.startDateInput}
              accessibilityLabel="Budget start date"
              maxLength={10}
            />
            {!!startDateError && <Text style={styles.error}>{startDateError}</Text>}
          </View>

          <Pressable
            style={styles.aboutLink}
            onPress={() => Linking.openURL(DEVELOPER_URL)}
            accessibilityRole="link"
            accessibilityLabel="Visit joeyhissong.com"
          >
            <Text style={styles.aboutLinkText}>Made by Joey Hissong · joeyhissong.com</Text>
          </Pressable>
        </ScrollView>
      </View>

      <CurrencyPickerModal
        visible={isCurrencyPickerVisible}
        currencyCode={currencyCode}
        onSelect={setCurrencyCode}
        onClose={() => setIsCurrencyPickerVisible(false)}
      />
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
  sectionSpacing: {
    marginTop: 20,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  linkRowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  linkRowValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkRowValue: {
    fontSize: 15,
    color: '#6B7280',
    marginRight: 6,
  },
  chevron: {
    fontSize: 18,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  toggleSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  startDateCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  startDateInput: {
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 6,
  },
  aboutLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  aboutLinkText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default SettingsScreen;
