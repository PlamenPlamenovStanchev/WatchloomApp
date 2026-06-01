import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PLANNED_NOTIFICATION_RECORDS_KEY = 'watchloom.plannedNotifications';

export type PlannedNotificationRecord = {
  notificationId: string;
  plannedWatchAt: string;
};

type PlannedNotificationRecords = Record<string, PlannedNotificationRecord>;

export async function getPlannedNotificationRecord(watchlistItemId: number | string) {
  const records = await getRecords();

  return records[String(watchlistItemId)] ?? null;
}

export async function savePlannedNotificationRecord(
  watchlistItemId: number | string,
  record: PlannedNotificationRecord,
) {
  const records = await getRecords();
  records[String(watchlistItemId)] = record;
  await saveRecords(records);
}

export async function deletePlannedNotificationRecord(watchlistItemId: number | string) {
  const records = await getRecords();
  delete records[String(watchlistItemId)];
  await saveRecords(records);
}

async function getRecords(): Promise<PlannedNotificationRecords> {
  try {
    const storedRecords =
      Platform.OS === 'web'
        ? getWebStorage()?.getItem(PLANNED_NOTIFICATION_RECORDS_KEY)
        : await SecureStore.getItemAsync(PLANNED_NOTIFICATION_RECORDS_KEY);

    return storedRecords ? (JSON.parse(storedRecords) as PlannedNotificationRecords) : {};
  } catch {
    return {};
  }
}

async function saveRecords(records: PlannedNotificationRecords) {
  const serializedRecords = JSON.stringify(records);

  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(PLANNED_NOTIFICATION_RECORDS_KEY, serializedRecords);
    return;
  }

  await SecureStore.setItemAsync(PLANNED_NOTIFICATION_RECORDS_KEY, serializedRecords);
}

function getWebStorage() {
  return typeof window === 'undefined' ? undefined : window.localStorage;
}
