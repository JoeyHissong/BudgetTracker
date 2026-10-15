import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import MonthHeader from '../components/MonthHeader';
import SummaryCard from '../components/SummaryCard';
import BillListItem from '../components/BillListItem';
import AddBillModal from '../components/AddBillModal';
import SettingsScreen from './SettingsScreen';
import { useBills, BillWithStatus } from '../hooks/useBills';
import { addMonths } from '../utils/date';

const HomeScreen: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState<BillWithStatus | null>(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const {
    isLoading,
    billsForMonth,
    totalDue,
    totalPaid,
    totalRemaining,
    addBill,
    updateBill,
    deleteBill,
    togglePaid,
  } = useBills(selectedMonth);

  const openAddModal = () => {
    setEditingBill(null);
    setIsModalVisible(true);
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
      />

      {isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading…</Text>
        </View>
      ) : billsForMonth.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🧾</Text>
          <Text style={styles.emptyText}>No recurring bills yet.</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to add your first one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={billsForMonth}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <BillListItem
              bill={item}
              month={selectedMonth}
              onTogglePaid={togglePaid}
              onPress={openEditModal}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={openAddModal}
        accessibilityRole="button"
        accessibilityLabel="Add recurring bill"
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topBar: {
    flexDirection: 'row',
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
    color: '#374151',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
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
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '400',
    marginTop: -2,
  },
});

export default HomeScreen;
