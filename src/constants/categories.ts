import { BillCategory } from '../types';

export interface CategoryInfo {
  label: BillCategory;
  emoji: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { label: 'Rent/Mortgage', emoji: '🏠', color: '#8B5CF6' },
  { label: 'Utilities', emoji: '💡', color: '#F59E0B' },
  { label: 'Internet/Phone', emoji: '📶', color: '#3B82F6' },
  { label: 'Subscriptions', emoji: '📺', color: '#EC4899' },
  { label: 'Insurance', emoji: '🛡️', color: '#10B981' },
  { label: 'Loan/Debt', emoji: '💳', color: '#EF4444' },
  { label: 'Other', emoji: '📦', color: '#6B7280' },
];

export const getCategoryInfo = (category: BillCategory): CategoryInfo =>
  CATEGORIES.find(c => c.label === category) ?? CATEGORIES[CATEGORIES.length - 1];
