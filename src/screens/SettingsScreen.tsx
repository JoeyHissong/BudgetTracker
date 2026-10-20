import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { ThemeColors, ThemePreference } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import {
  exportBackupToFile,
  pickAndParseBackupFile,
} from '../storage/backupFile';
import { restoreBackupData } from '../storage/backupStorage';

const DEVELOPER_URL = 'https://www.joeyhissong.com';
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  hasPaySchedule: boolean;
  onEditPaySchedule: () => void;
  /** Called after a successful data import, so other screens can reload from storage. */
  onDataImported: () => Promise<void>;
}

const SettingsScreen: React.FC<Props> = ({
  visible,
  onClose,
  hasPaySchedule,
  onEditPaySchedule,
  onDataImported,
}) => {
  const {
    currencyCode,
    setCurrencyCode,
    hideNumbers,
    setHideNumbers,
    budgetStartDate,
    setBudgetStartDate,
    reload: reloadCurrency,
  } = useCurrency();
  const {
    colors,
    themePreference,
    setThemePreference,
    reload: reloadTheme,
  } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [startDateInput, setStartDateInput] = useState(budgetStartDate);
  const [startDateError, setStartDateError] = useState('');
  const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const selectedCurrency = getCurrencyOption(currencyCode);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const savedFileName = await exportBackupToFile();
      if (savedFileName) {
        Alert.alert('Data exported', `Saved as ${savedFileName}.`);
      }
    } catch (error) {
      console.warn('Failed to export app data', error);
      Alert.alert(
        'Export failed',
        'Something went wrong while exporting your data.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    Alert.alert(
      'Import data',
      'This will replace all bills, pay schedule, and settings currently in the app with the contents of the file you choose. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose file',
          style: 'destructive',
          onPress: async () => {
            setIsImporting(true);
            try {
              const backup = await pickAndParseBackupFile();
              if (!backup) {
                return;
              }
              await restoreBackupData(backup);
              await Promise.all([
                reloadCurrency(),
                reloadTheme(),
                onDataImported(),
              ]);
              Alert.alert('Data imported', 'Your data has been restored.');
            } catch (error) {
              console.warn('Failed to import app data', error);
              const message =
                error instanceof Error
                  ? error.message
                  : 'Something went wrong while importing your data.';
              Alert.alert('Import failed', message);
            } finally {
              setIsImporting(false);
            }
          },
        },
      ],
    );
  };

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
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      },
    );
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

          <Pressable
            style={[styles.linkRow, styles.sectionSpacing]}
            onPress={onEditPaySchedule}
            accessibilityRole="button"
            accessibilityLabel={
              hasPaySchedule ? 'Edit pay schedule' : 'Add pay schedule'
            }
          >
            <Text style={styles.linkRowLabel}>Pay schedule</Text>
            <View style={styles.linkRowValueWrap}>
              <Text style={styles.linkRowValue}>
                {hasPaySchedule ? 'Edit' : 'Add'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>

          <Text style={[styles.fieldLabel, styles.sectionSpacing]}>
            Appearance
          </Text>
          <View style={styles.segmentedControl}>
            {THEME_OPTIONS.map(option => {
              const selected = option.value === themePreference;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.segment, selected && styles.segmentSelected]}
                  onPress={() => setThemePreference(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.label} appearance`}
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      selected && styles.segmentLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.fieldLabel, styles.sectionSpacing]}>
            Privacy
          </Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleLabel}>Hide numbers</Text>
              <Text style={styles.toggleSubtext}>
                Blur amounts shown throughout the app
              </Text>
            </View>
            <Switch
              value={hideNumbers}
              onValueChange={setHideNumbers}
              accessibilityRole="switch"
              accessibilityLabel="Hide numbers"
              accessibilityState={{ checked: hideNumbers }}
              trackColor={{ false: colors.handle, true: colors.accent }}
              thumbColor={colors.surface}
            />
          </View>

          <Text style={[styles.fieldLabel, styles.sectionSpacing]}>
            Budget tracking
          </Text>
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
              placeholderTextColor={colors.textFaint}
              style={styles.startDateInput}
              accessibilityLabel="Budget start date"
              maxLength={10}
            />
            {!!startDateError && (
              <Text style={styles.error}>{startDateError}</Text>
            )}
          </View>

          <Text style={[styles.fieldLabel, styles.sectionSpacing]}>Data</Text>
          <Pressable
            style={styles.linkRow}
            onPress={handleExport}
            disabled={isExporting || isImporting}
            accessibilityRole="button"
            accessibilityLabel="Export data as a JSON file"
          >
            <Text style={styles.linkRowLabel}>Export data</Text>
            {isExporting ? (
              <ActivityIndicator size="small" color={colors.textMuted} />
            ) : (
              <Text style={styles.chevron}>›</Text>
            )}
          </Pressable>
          <Pressable
            style={[styles.linkRow, styles.sectionSpacing]}
            onPress={handleImport}
            disabled={isExporting || isImporting}
            accessibilityRole="button"
            accessibilityLabel="Import data from a JSON file"
          >
            <Text style={styles.linkRowLabel}>Import data</Text>
            {isImporting ? (
              <ActivityIndicator size="small" color={colors.textMuted} />
            ) : (
              <Text style={styles.chevron}>›</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.aboutLink}
            onPress={() => Linking.openURL(DEVELOPER_URL)}
            accessibilityRole="link"
            accessibilityLabel="Visit joeyhissong.com"
          >
            <Text style={styles.aboutLinkText}>
              Made by Joey Hissong · joeyhissong.com
            </Text>
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
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
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
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    linkRowLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    linkRowValueWrap: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    linkRowValue: {
      fontSize: 15,
      color: colors.textMuted,
      marginRight: 6,
    },
    chevron: {
      fontSize: 18,
      color: colors.borderStrong,
      fontWeight: '600',
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      padding: 4,
      gap: 4,
    },
    segment: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 9,
      alignItems: 'center',
    },
    segmentSelected: {
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    segmentLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
    },
    segmentLabelSelected: {
      color: colors.text,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleTextWrap: {
      flex: 1,
      marginRight: 12,
    },
    toggleLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    toggleSubtext: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    startDateCard: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    startDateInput: {
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.handle,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 10,
    },
    error: {
      color: colors.danger,
      fontSize: 13,
      marginTop: 6,
    },
    aboutLink: {
      marginTop: 24,
      alignItems: 'center',
    },
    aboutLinkText: {
      fontSize: 13,
      color: colors.textFaint,
    },
  });

export default SettingsScreen;
