export type ThemePreference = 'system' | 'light' | 'dark';

export interface ThemeColors {
  /** Main screen background. */
  background: string;
  /** Raised surfaces: cards, rows, modals. */
  surface: string;
  /** Subtly different surface, used for chips/pills/secondary buttons. */
  surfaceAlt: string;
  /** Hairline borders/dividers. */
  border: string;
  /** Slightly stronger border, used for unchecked checkboxes/controls. */
  borderStrong: string;
  /** Primary text. */
  text: string;
  /** Secondary/muted text (labels, metadata). */
  textMuted: string;
  /** Faint placeholder/disabled text. */
  textFaint: string;
  /** Modal/sheet drag handle. */
  handle: string;
  /** Accent/brand color (links, selected states). */
  accent: string;
  /** Color to place text/icons on top of `accent`. */
  onAccent: string;
  /** Destructive actions (delete, errors, overdue). */
  danger: string;
  /** Success/positive color (paid, checkmarks). */
  success: string;
  /** Color to place text/icons on top of `success`. */
  onSuccess: string;
  /** Backdrop behind modals/sheets. */
  backdrop: string;
  /** Shadow color used on elevated elements. */
  shadow: string;
  /** Always-dark summary card background (same in both themes, by design). */
  summaryCardBackground: string;
  summaryCardText: string;
  summaryCardTextMuted: string;
  summaryCardIncome: string;
  /** Payday row (green-tinted) colors. */
  paydayBackground: string;
  paydayBorder: string;
  paydayIconBackground: string;
  paydayText: string;
  paydayTextMuted: string;
  paydayAmount: string;
  /** Carryover row (blue-tinted) colors. */
  carryoverBackground: string;
  carryoverBorder: string;
  carryoverIconBackground: string;
  carryoverText: string;
  carryoverTextMuted: string;
  carryoverAmount: string;
}

export const lightColors: ThemeColors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F4F6',
  border: '#F3F4F6',
  borderStrong: '#D1D5DB',
  text: '#111827',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
  handle: '#E5E7EB',
  accent: '#2563EB',
  onAccent: '#FFFFFF',
  danger: '#DC2626',
  success: '#10B981',
  onSuccess: '#FFFFFF',
  backdrop: 'rgba(0,0,0,0.4)',
  shadow: '#000000',
  summaryCardBackground: '#111827',
  summaryCardText: '#FFFFFF',
  summaryCardTextMuted: '#9CA3AF',
  summaryCardIncome: '#60A5FA',
  paydayBackground: '#ECFDF5',
  paydayBorder: '#D1FAE5',
  paydayIconBackground: '#D1FAE5',
  paydayText: '#065F46',
  paydayTextMuted: '#047857',
  paydayAmount: '#059669',
  carryoverBackground: '#EFF6FF',
  carryoverBorder: '#DBEAFE',
  carryoverIconBackground: '#DBEAFE',
  carryoverText: '#1E3A8A',
  carryoverTextMuted: '#1D4ED8',
  carryoverAmount: '#2563EB',
};

export const darkColors: ThemeColors = {
  background: '#0B0F17',
  surface: '#161B22',
  surfaceAlt: '#1F2530',
  border: '#2A313D',
  borderStrong: '#4B5563',
  text: '#F3F4F6',
  textMuted: '#9CA3AF',
  textFaint: '#6B7280',
  handle: '#3A4150',
  accent: '#60A5FA',
  onAccent: '#0B0F17',
  danger: '#F87171',
  success: '#34D399',
  onSuccess: '#0B0F17',
  backdrop: 'rgba(0,0,0,0.6)',
  shadow: '#000000',
  summaryCardBackground: '#161B22',
  summaryCardText: '#FFFFFF',
  summaryCardTextMuted: '#9CA3AF',
  summaryCardIncome: '#60A5FA',
  paydayBackground: '#0F2A1E',
  paydayBorder: '#15422E',
  paydayIconBackground: '#15422E',
  paydayText: '#6EE7B7',
  paydayTextMuted: '#34D399',
  paydayAmount: '#34D399',
  carryoverBackground: '#10213B',
  carryoverBorder: '#17305A',
  carryoverIconBackground: '#17305A',
  carryoverText: '#93C5FD',
  carryoverTextMuted: '#60A5FA',
  carryoverAmount: '#60A5FA',
};
