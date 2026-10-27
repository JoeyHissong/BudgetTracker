/**
 * Budget Planner
 * Local-only monthly expense tracker
 *
 * @format
 */

import React, { useMemo } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import { CurrencyProvider } from './src/contexts/CurrencyContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { ReminderProvider } from './src/contexts/ReminderContext';

const AppContent = () => {
  const { isDark, colors } = useTheme();
  const styles = useMemo(
    () => StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background } }),
    [colors],
  );

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <HomeScreen />
      </SafeAreaView>
    </>
  );
};

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <ReminderProvider>
            <AppContent />
          </ReminderProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
