import React, { useEffect, useMemo } from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  visible: boolean;
  title?: string;
  /** Currently selected day of month (1-31), or null if none selected yet. */
  value: number | null;
  onClose: () => void;
  onSelect: (day: number) => void;
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const DayOfMonthPickerModal: React.FC<Props> = ({
  visible,
  title = 'Select day of month',
  value,
  onClose,
  onSelect,
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

  const rows = useMemo(() => {
    const cells: (number | null)[] = [...DAYS];
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    const result: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7));
    }
    return result;
  }, []);

  if (!visible) {
    return null;
  }

  const handleSelectDay = (day: number) => {
    onSelect(day);
    onClose();
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropTouchable} onPress={onClose} />
      <View style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>

          {rows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((day, colIndex) => {
                if (day === null) {
                  return <View key={`blank-${rowIndex}-${colIndex}`} style={styles.cell} />;
                }

                const isSelected = value === day;

                return (
                  <Pressable
                    key={day}
                    style={styles.cell}
                    onPress={() => handleSelectDay(day)}
                    accessibilityRole="button"
                    accessibilityLabel={`Day ${day}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={[styles.circle, isSelected && styles.circleSelected]}>
                      <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

          <Pressable style={styles.cancelButton} onPress={onClose} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
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
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
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
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      marginTop: 4,
    },
    cell: {
      flex: 1,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle: {
      width: '78%',
      height: '78%',
      maxWidth: 40,
      maxHeight: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleSelected: {
      backgroundColor: colors.success,
    },
    dayText: {
      fontSize: 14,
      color: colors.text,
    },
    dayTextSelected: {
      color: colors.onSuccess,
      fontWeight: '700',
    },
    cancelButton: {
      marginTop: 16,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelText: {
      color: colors.textMuted,
      fontWeight: '600',
      fontSize: 15,
    },
  });

export default DayOfMonthPickerModal;
