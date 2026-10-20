import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import MonthHeader from '../components/MonthHeader';
import SummaryCard from '../components/SummaryCard';
import BillListItem from '../components/BillListItem';
import PaydayListItem from '../components/PaydayListItem';
import CarryoverListItem from '../components/CarryoverListItem';
import AddBillModal from '../components/AddBillModal';
import AddPayScheduleModal from '../components/AddPayScheduleModal';
import SettingsScreen from './SettingsScreen';
import { BillWithStatus } from '../hooks/useBills';
import { useTimeline } from '../hooks/useTimeline';
import { addMonths } from '../utils/date';
import { ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState<BillWithStatus | null>(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isPayScheduleModalVisible, setIsPayScheduleModalVisible] = useState(false);
  const [isAddChoiceVisible, setIsAddChoiceVisible] = useState(false);

  const {
    isLoading,
    timeline,
    totalDue,
    totalPaid,
    totalRemaining,
    totalIncome,
    addBill,
    updateBill,
    deleteBill,
    togglePaid,
    paySchedule,
    setPaySchedule,
    removePaySchedule,
    reload,
  } = useTimeline(selectedMonth);

  const openAddModal = () => {
    setEditingBill(null);
    setIsModalVisible(true);
  };

  const handleFabPress = () => {
    if (paySchedule) {
      openAddModal();
    } else {
      setIsAddChoiceVisible(true);
    }
  };

  const chooseAddPaySchedule = () => {
    setIsAddChoiceVisible(false);
    setIsPayScheduleModalVisible(true);
  };

  const chooseAddBill = () => {
    setIsAddChoiceVisible(false);
    openAddModal();
  };

  const openEditModal = (bill: BillWithStatus) => {
    setEditingBill(bill);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingBill(null);
  };

  const handleSubmit: Parameters<typeof AddBillModal>[0]['onSubmit'] = input => {
    if (editingBill) {
      updateBill(editingBill.id, input);
    } else {
      addBill(input);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.settingsButton}
          onPress={() => setIsSettingsVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          hitSlop={8}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>
      <MonthHeader
        month={selectedMonth}
        onPrevMonth={() => setSelectedMonth(prev => addMonths(prev, -1))}
        onNextMonth={() => setSelectedMonth(prev => addMonths(prev, 1))}
      />
      <SummaryCard
        totalDue={totalDue}
        totalPaid={totalPaid}
        totalRemaining={totalRemaining}
        totalIncome={totalIncome}
      />

      {isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading…</Text>
        </View>
      ) : timeline.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🧾</Text>
          <Text style={styles.emptyText}>No recurring bills yet.</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to add your first one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={timeline}
          keyExtractor={item => item.id}
          renderItem={({ item }) =>
            item.type === 'bill' ? (
              <BillListItem
                bill={item.bill}
                month={selectedMonth}
                onTogglePaid={togglePaid}
                onPress={openEditModal}
              />
            ) : item.type === 'payday' ? (
              <PaydayListItem
                isoDate={item.isoDate}
                amount={item.amount}
                coveredAmount={item.coveredAmount}
                onPress={() => setIsPayScheduleModalVisible(true)}
              />
            ) : (
              <CarryoverListItem amount={item.amount} coveredAmount={item.coveredAmount} />
            )
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={handleFabPress}
        accessibilityRole="button"
        accessibilityLabel={paySchedule ? 'Add recurring bill' : 'Add pay schedule or bill'}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {isAddChoiceVisible && (
        <View style={styles.choiceBackdrop}>
          <Pressable
            style={styles.choiceBackdropTouchable}
            onPress={() => setIsAddChoiceVisible(false)}
          />
          <View style={styles.choiceSheet}>
            <View style={styles.handle} />
            <Text style={styles.choiceTitle}>What would you like to add?</Text>
            <Pressable
              style={styles.choiceRow}
              onPress={chooseAddPaySchedule}
              accessibilityRole="button"
              accessibilityLabel="Add pay schedule"
            >
              <Text style={styles.choiceRowIcon}>💰</Text>
              <View style={styles.choiceRowTextWrap}>
                <Text style={styles.choiceRowLabel}>Add Pay Schedule</Text>
                <Text style={styles.choiceRowSubtext}>
                  Set up when and how much you get paid
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.choiceRow}
              onPress={chooseAddBill}
              accessibilityRole="button"
              accessibilityLabel="Add expense"
            >
              <Text style={styles.choiceRowIcon}>🧾</Text>
              <View style={styles.choiceRowTextWrap}>
                <Text style={styles.choiceRowLabel}>Add Expense</Text>
                <Text style={styles.choiceRowSubtext}>
                  Track a recurring bill or expense
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.choiceCancel}
              onPress={() => setIsAddChoiceVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.choiceCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      <AddBillModal
        visible={isModalVisible}
        editingBill={editingBill}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={deleteBill}
      />

      <SettingsScreen
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        hasPaySchedule={!!paySchedule}
        onEditPaySchedule={() => {
          setIsSettingsVisible(false);
          setIsPayScheduleModalVisible(true);
        }}
        onDataImported={reload}
      />

      <AddPayScheduleModal
        visible={isPayScheduleModalVisible}
        schedule={paySchedule}
        onClose={() => setIsPayScheduleModalVisible(false)}
        onSubmit={setPaySchedule}
        onDelete={removePaySchedule}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 12,
      paddingTop: 4,
    },
    settingsButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsIcon: {
      fontSize: 20,
    },
    listContent: {
      paddingBottom: 100,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyEmoji: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 13,
      color: colors.textFaint,
      marginTop: 4,
      textAlign: 'center',
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 28,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.text,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    fabIcon: {
      color: colors.background,
      fontSize: 30,
      fontWeight: '400',
      marginTop: -2,
    },
    choiceBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.backdrop,
      justifyContent: 'flex-end',
      zIndex: 10,
    },
    choiceBackdropTouchable: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    choiceSheet: {
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
    choiceTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    choiceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 14,
      backgroundColor: colors.background,
      borderRadius: 14,
      marginBottom: 12,
    },
    choiceRowIcon: {
      fontSize: 24,
      marginRight: 14,
    },
    choiceRowTextWrap: {
      flex: 1,
    },
    choiceRowLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    choiceRowSubtext: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    choiceCancel: {
      alignItems: 'center',
      paddingVertical: 10,
      marginTop: 4,
    },
    choiceCancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textMuted,
    },
  });

export default HomeScreen;
