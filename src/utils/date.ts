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
