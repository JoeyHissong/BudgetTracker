import { PaySchedule } from '../types';

/** Returns a "YYYY-MM" key for grouping expenses by month. */
export const getMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getMonthKeyFromISODate = (isoDate: string): string =>
  isoDate.slice(0, 7);

/** e.g. "October 2026" */
export const formatMonthLabel = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export const addMonths = (date: Date, delta: number): Date => {
  const next = new Date(date.getFullYear(), date.getMonth() + delta, 1);
  return next;
};

export const daysInMonth = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

/** Builds an ISO "YYYY-MM-DD" string for the given month/day. */
export const toISODate = (monthDate: Date, day: number): string => {
  const year = monthDate.getFullYear();
  const month = String(monthDate.getMonth() + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
};

/** e.g. "Oct 15" */
export const formatShortDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const isCurrentMonth = (date: Date): boolean =>
  getMonthKey(date) === getMonthKey(new Date());

/** Clamps a due-day (1-31) to the number of days actually in the given month. */
export const clampDueDay = (monthDate: Date, dueDay: number): number =>
  Math.min(Math.max(dueDay, 1), daysInMonth(monthDate));

/** e.g. "Due Oct 15" built from a due-day within the given month, clamped to month length. */
export const formatDueDate = (monthDate: Date, dueDay: number): string => {
  const day = clampDueDay(monthDate, dueDay);
  return formatShortDate(toISODate(monthDate, day));
};

/** True if the due day (within the given month) has already passed relative to today. */
export const isPastDue = (monthDate: Date, dueDay: number): boolean => {
  const day = clampDueDay(monthDate, dueDay);
  const due = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
};

/** Parses an ISO "YYYY-MM-DD" string into a local Date at midnight. */
export const parseISODate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date: Date, delta: number): Date => {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
  return next;
};

/**
 * Returns every payday (as ISO "YYYY-MM-DD" strings, ascending) that falls
 * within the given month for a weekly/biweekly schedule anchored on
 * `anchorIsoDate`, recurring every `intervalDays` days.
 */
const getRecurringPaydaysInMonth = (
  monthDate: Date,
  anchorIsoDate: string,
  intervalDays: number,
): string[] => {
  const anchor = parseISODate(anchorIsoDate);
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth(), daysInMonth(monthDate));

  // Find the number of intervals between the anchor and the start of the
  // month so we can land on or just before the first payday in range,
  // without looping one interval at a time over potentially many months.
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceAnchor = Math.round(
    (monthStart.getTime() - anchor.getTime()) / msPerDay,
  );
  const intervalsSinceAnchor = Math.floor(daysSinceAnchor / intervalDays);

  let cursor = addDays(anchor, intervalsSinceAnchor * intervalDays);
  while (cursor < monthStart) {
    cursor = addDays(cursor, intervalDays);
  }

  const paydays: string[] = [];
  while (cursor <= monthEnd) {
    paydays.push(toISODate(cursor, cursor.getDate()));
    cursor = addDays(cursor, intervalDays);
  }
  return paydays;
};

/**
 * Returns every payday (as ISO "YYYY-MM-DD" strings, ascending, de-duped)
 * that falls within the given month for the given pay schedule.
 */
export const getPaydaysInMonth = (
  schedule: PaySchedule,
  monthDate: Date,
): string[] => {
  switch (schedule.frequency) {
    case 'weekly':
      return getRecurringPaydaysInMonth(monthDate, schedule.anchorDate, 7);
    case 'biweekly':
      return getRecurringPaydaysInMonth(monthDate, schedule.anchorDate, 14);
    case 'monthly': {
      const day = clampDueDay(monthDate, schedule.dayOfMonth);
      return [toISODate(monthDate, day)];
    }
    case 'semimonthly': {
      const firstDay = clampDueDay(monthDate, schedule.dayOfMonth);
      const dates = [toISODate(monthDate, firstDay)];
      if (schedule.secondDayOfMonth) {
        const secondDay = clampDueDay(monthDate, schedule.secondDayOfMonth);
        if (secondDay !== firstDay) {
          dates.push(toISODate(monthDate, secondDay));
        }
      }
      return dates.sort();
    }
    default:
      return [];
  }
};

/** e.g. "Payday Oct 15" */
export const formatPaydayLabel = (isoDate: string): string =>
  `Payday ${formatShortDate(isoDate)}`;
