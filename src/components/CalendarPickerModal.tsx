import React, { useMemo, useState, useEffect } from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { addMonths, daysInMonth, formatMonthLabel, parseISODate, toISODate } from '../utils/date';

interface Props {
  visible: boolean;
  /** Currently selected date, as an ISO "YYYY-MM-DD" string, or empty. */
  value: string;
  onClose: () => void;
  onSelect: (isoDate: string) => void;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const toStartOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const CalendarPickerModal: React.FC<Props> = ({ visible, value, onClose, onSelect }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const initialMonth = useMemo(() => {
    if (value) {
      const parsed = parseISODate(value);
      if (!Number.isNaN(parsed.getTime())) {
        return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
      }
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [value]);

  const [visibleMonth, setVisibleMonth] = useState(initialMonth);

  useEffect(() => {
    if (visible) {
      setVisibleMonth(initialMonth);
    }
  }, [visible, initialMonth]);

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

  const today = useMemo(() => toStartOfDay(new Date()), []);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const totalDays = daysInMonth(visibleMonth);
    const leadingBlanks = firstOfMonth.getDay();

    const cells: (number | null)[] = [
      ...Array(leadingBlanks).fill(null),
      ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [visibleMonth]);

  if (!visible) {
    return null;
  }

  const handleSelectDay = (day: number) => {
    const isoDate = toISODate(visibleMonth, day);
    onSelect(isoDate);
    onClose();
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropTouchable} onPress={onClose} />
      <View style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.monthRow}>
            <Pressable
              onPress={() => setVisibleMonth(prev => addMonths(prev, -1))}
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
            >
              <Text style={styles.navText}>‹</Text>
            </Pressable>
            <Text style={styles.monthLabel}>{formatMonthLabel(visibleMonth)}</Text>
            <Pressable
              onPress={() => setVisibleMonth(prev => addMonths(prev, 1))}
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel="Next month"
            >
              <Text style={styles.navText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label, index) => (
              <View key={`${label}-${index}`} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{label}</Text>
              </View>
            ))}
          </View>

          {weeks.map((week, rowIndex) => (
            <View key={`week-${rowIndex}`} style={styles.weekRow}>
              {week.map((day, colIndex) => {
                if (day === null) {
                  return <View key={`blank-${rowIndex}-${colIndex}`} style={styles.dayCell} />;
                }

                const isoDate = toISODate(visibleMonth, day);
                const isSelected = value === isoDate;
                const isToday = toStartOfDay(parseISODate(isoDate)).getTime() === today.getTime();

                return (
                  <Pressable
                    key={isoDate}
                    style={styles.dayCell}
                    onPress={() => handleSelectDay(day)}
                    accessibilityRole="button"
                    accessibilityLabel={isoDate}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        isToday && !isSelected && styles.dayCircleToday,
                        isSelected && styles.dayCircleSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && !isSelected && styles.dayTextToday,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

          <Pressable
            style={styles.todayButton}
            onPress={() => handleSelectDay(today.getDate())}
            accessibilityRole="button"
          >
            <Text style={styles.todayButtonText}>Jump to today</Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
            accessibilityRole="button"
          >
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
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    navButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navText: {
      fontSize: 28,
      color: colors.textMuted,
    },
    monthLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    weekdayRow: {
      flexDirection: 'row',
      marginTop: 8,
    },
    weekdayCell: {
      flex: 1,
      alignItems: 'center',
    },
    weekdayText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textFaint,
    },
    weekRow: {
      flexDirection: 'row',
      marginTop: 4,
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCircle: {
      width: '78%',
      height: '78%',
      maxWidth: 40,
      maxHeight: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCircleToday: {
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    dayCircleSelected: {
      backgroundColor: colors.success,
    },
    dayText: {
      fontSize: 14,
      color: colors.text,
    },
    dayTextToday: {
      color: colors.accent,
      fontWeight: '700',
    },
    dayTextSelected: {
      color: colors.onSuccess,
      fontWeight: '700',
    },
    todayButton: {
      marginTop: 16,
      paddingVertical: 12,
      alignItems: 'center',
    },
    todayButtonText: {
      color: colors.accent,
      fontWeight: '600',
      fontSize: 14,
    },
    cancelButton: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelText: {
      color: colors.textMuted,
      fontWeight: '600',
      fontSize: 15,
    },
  });

export default CalendarPickerModal;
