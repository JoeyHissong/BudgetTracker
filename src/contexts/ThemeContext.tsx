import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ThemeColors, ThemePreference } from '../constants/theme';
import { loadThemePreference, saveThemePreference } from '../storage/settingsStorage';

interface ThemeContextValue {
  /** User's stored preference: 'system' follows the OS setting. */
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  /** Resolved light/dark state, taking the system scheme into account. */
  isDark: boolean;
  /** Resolved color tokens for the current theme. */
  colors: ThemeColors;
  isLoading: boolean;
  /** Re-reads the theme preference from storage, e.g. after a data import. */
  reload: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const stored = await loadThemePreference();
    setThemePreferenceState(stored ?? 'system');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    loadThemePreference().then(stored => {
      if (isMounted) {
        if (stored) {
          setThemePreferenceState(stored);
        }
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
    saveThemePreference(preference);
  }, []);

  const isDark =
    themePreference === 'system' ? systemScheme === 'dark' : themePreference === 'dark';

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      themePreference,
      setThemePreference,
      isDark,
      colors,
      isLoading,
      reload,
    }),
    [themePreference, setThemePreference, isDark, colors, isLoading, reload],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
