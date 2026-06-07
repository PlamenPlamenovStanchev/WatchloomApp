import {
  cancelNotification,
  notificationsAreAvailable,
  schedulePlannedWatchNotification,
} from '@/lib/notifications';
import {
  deletePlannedNotificationRecord,
  getPlannedNotificationRecord,
  savePlannedNotificationRecord,
} from '@/lib/planned-notification-storage';
import { parsePlannedWatchDate } from '@/lib/planned-date';

type PlannedNotificationItem = {
  id: number | string;
  media?: {
    slug?: string;
    title: string;
  } | null;
  mediaType: 'movie' | 'series';
  plannedWatchAt?: string | null;
};

export type ScheduleReminderResult = 'already-scheduled' | 'scheduled';

export async function schedulePlannedItemReminder(
  item: PlannedNotificationItem,
): Promise<ScheduleReminderResult> {
  if (!notificationsAreAvailable()) {
    throw new Error('Local reminders are available in the Android and iOS app, but not in the web browser.');
  }

  const plannedWatchAt = getFuturePlannedWatchAt(item.plannedWatchAt);
  const currentRecord = await getPlannedNotificationRecord(item.id);

  if (
    currentRecord &&
    new Date(currentRecord.plannedWatchAt).getTime() === plannedWatchAt.getTime()
  ) {
    return 'already-scheduled';
  }

  const notificationId = await schedulePlannedWatchNotification({
    mediaType: item.mediaType,
    plannedWatchAt,
    slug: item.media?.slug,
    title: `Watchloom reminder: ${item.media?.title || 'planned title'}`,
    watchlistItemId: item.id,
  });

  if (!notificationId) {
    throw new Error('Notifications are unavailable or permission was not granted.');
  }

  if (currentRecord) {
    await cancelNotification(currentRecord.notificationId);
  }

  await savePlannedNotificationRecord(item.id, {
    notificationId,
    plannedWatchAt: plannedWatchAt.toISOString(),
  });

  return 'scheduled';
}

export async function rescheduleKnownPlannedItemReminder(item: PlannedNotificationItem) {
  const currentRecord = await getPlannedNotificationRecord(item.id);

  if (!currentRecord) {
    return;
  }

  if (!item.plannedWatchAt || new Date(item.plannedWatchAt).getTime() <= Date.now()) {
    await cancelPlannedItemReminder(item.id);
    return;
  }

  await schedulePlannedItemReminder(item);
}

export async function cancelPlannedItemReminder(watchlistItemId: number | string) {
  const currentRecord = await getPlannedNotificationRecord(watchlistItemId);

  if (!currentRecord) {
    return;
  }

  await cancelNotification(currentRecord.notificationId);
  await deletePlannedNotificationRecord(watchlistItemId);
}

function getFuturePlannedWatchAt(value?: string | null) {
  const plannedWatchAt = parsePlannedWatchDate(value);

  if (!plannedWatchAt || Number.isNaN(plannedWatchAt.getTime())) {
    throw new Error('Set a valid planned watch date before creating a reminder.');
  }

  if (plannedWatchAt.getTime() <= Date.now()) {
    throw new Error('This planned watch time has already passed. Choose a future time first.');
  }

  return plannedWatchAt;
}
