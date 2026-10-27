import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { Bill } from '../types';
import { addMonths, clampDueDay } from '../utils/date';

const CHANNEL_ID = 'bill-due-reminders';
const NOTIFICATION_ID_PREFIX = 'bill-due-';
/** How many upcoming months of due dates to keep scheduled at once. */
const MONTHS_AHEAD = 3;

const notificationIdForBillMonth = (billId: string, monthDate: Date): string =>
  `${NOTIFICATION_ID_PREFIX}${billId}-${monthDate.getFullYear()}-${monthDate.getMonth()}`;

const ensureAndroidChannel = async (): Promise<void> => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Bill due reminders',
    importance: AndroidImportance.HIGH,
  });
};

/**
 * Requests permission to display notifications (the Android 13+ runtime
 * prompt, or the iOS authorization dialog). Android versions before 13 grant
 * this automatically.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
};

/**
 * On Android 12+, scheduling a notification for a precise future time
 * requires the user to grant the "Alarms & reminders" special permission
 * from system settings - it can't be requested via a normal runtime dialog.
 * Returns false (and leaves it to the caller to decide whether to send the
 * user to settings) if that permission isn't currently granted. Always
 * true on iOS and older Android versions, where it doesn't apply.
 */
export const canScheduleExactReminders = async (): Promise<boolean> => {
  const settings = await notifee.getNotificationSettings();
  return settings.android?.alarm !== AndroidNotificationSetting.DISABLED;
};

/** Opens the system settings screen where the user can grant the "Alarms & reminders" permission. */
export const openExactAlarmSettings = (): Promise<void> =>
  notifee.openAlarmPermissionSettings();

/**
 * Immediately displays a sample "bill due today" notification, so the user
 * can see what the real reminders will look like without waiting for an
 * actual due date.
 */
export const sendTestReminder = async (): Promise<void> => {
  await ensureAndroidChannel();
  await notifee.displayNotification({
    title: 'Bill due today',
    body: 'This is a test - your real reminders will look just like this.',
    android: {
      channelId: CHANNEL_ID,
      pressAction: { id: 'default' },
    },
  });
};

/** Cancels every previously scheduled "bill due today" reminder. */
export const cancelAllBillReminders = async (): Promise<void> => {
  const ids = await notifee.getTriggerNotificationIds();
  const billReminderIds = ids.filter(id => id.startsWith(NOTIFICATION_ID_PREFIX));
  if (billReminderIds.length > 0) {
    await notifee.cancelTriggerNotifications(billReminderIds);
  }
};

/**
 * (Re)schedules a "bill due today" local notification for every bill, for
 * each of the next few months, at the given hour (local time, on the
 * hour). Any previously scheduled bill reminders are cancelled first, so
 * this is safe to call again whenever the bill list or reminder time
 * changes.
 */
export const scheduleBillReminders = async (bills: Bill[], hour: number): Promise<void> => {
  await cancelAllBillReminders();
  if (bills.length === 0) {
    return;
  }

  await ensureAndroidChannel();

  const now = new Date();
  for (let offset = 0; offset < MONTHS_AHEAD; offset++) {
    const monthDate = addMonths(now, offset);
    for (const bill of bills) {
      const day = clampDueDay(monthDate, bill.dueDay);
      const fireDate = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        day,
        hour,
        0,
        0,
        0,
      );
      // Skip occurrences that have already passed (e.g. this month's due
      // date, if it's earlier today or earlier this month).
      if (fireDate.getTime() <= now.getTime()) {
        continue;
      }

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: fireDate.getTime(),
      };

      try {
        await notifee.createTriggerNotification(
          {
            id: notificationIdForBillMonth(bill.id, monthDate),
            title: 'Bill due today',
            body: `${bill.name} is due today.`,
            android: {
              channelId: CHANNEL_ID,
              pressAction: { id: 'default' },
            },
          },
          trigger,
        );
      } catch (error) {
        // Don't let one failed trigger (e.g. missing exact-alarm permission
        // on Android 12+) stop the rest of the bills from being scheduled.
        console.warn('Failed to schedule a bill due reminder', error);
      }
    }
  }
};
