import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const WATCHLOOM_NOTIFICATION_TYPE = "planned-watch";
const WATCHLOOM_ANDROID_CHANNEL_ID = "planned-watching";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export type NotificationPermissionStatus =
  | Notifications.PermissionStatus
  | "unavailable";

type PlannedWatchItemIdentifier =
  | {
      itemId: string | number;
      watchlistItemId?: never;
    }
  | {
      itemId?: never;
      watchlistItemId: string | number;
    };

export type SchedulePlannedWatchNotificationInput = PlannedWatchItemIdentifier & {
  title: string;
  mediaType: "movie" | "series";
  plannedWatchAt: string | Date;
};

function notificationsAreAvailable() {
  return Platform.OS !== "web";
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    WATCHLOOM_ANDROID_CHANNEL_ID,
    {
      name: "Planned watching reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    },
  );
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (!notificationsAreAvailable()) {
    return "unavailable";
  }

  try {
    return (await Notifications.getPermissionsAsync()).status;
  } catch {
    return "unavailable";
  }
}

export async function requestNotificationPermissions(): Promise<NotificationPermissionStatus> {
  if (!notificationsAreAvailable()) {
    return "unavailable";
  }

  try {
    const currentPermissions = await Notifications.getPermissionsAsync();

    if (
      currentPermissions.status === Notifications.PermissionStatus.GRANTED ||
      !currentPermissions.canAskAgain
    ) {
      return currentPermissions.status;
    }

    return (await Notifications.requestPermissionsAsync()).status;
  } catch {
    return "unavailable";
  }
}

export async function schedulePlannedWatchNotification(
  input: SchedulePlannedWatchNotificationInput,
): Promise<string | null> {
  const plannedWatchAt = new Date(input.plannedWatchAt);

  if (
    !notificationsAreAvailable() ||
    Number.isNaN(plannedWatchAt.getTime()) ||
    plannedWatchAt.getTime() <= Date.now()
  ) {
    return null;
  }

  const permissionStatus = await requestNotificationPermissions();

  if (permissionStatus !== Notifications.PermissionStatus.GRANTED) {
    return null;
  }

  try {
    await ensureAndroidChannel();

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body:
          input.mediaType === "movie"
            ? "Your movie is ready to watch 🎬"
            : "Your series is waiting for you 🍿",
        data: {
          type: WATCHLOOM_NOTIFICATION_TYPE,
          mediaType: input.mediaType,
          ...(input.watchlistItemId !== undefined
            ? { watchlistItemId: input.watchlistItemId }
            : { itemId: input.itemId }),
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: plannedWatchAt,
        channelId:
          Platform.OS === "android" ? WATCHLOOM_ANDROID_CHANNEL_ID : undefined,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelNotification(
  notificationId: string,
): Promise<boolean> {
  if (!notificationsAreAvailable()) {
    return false;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch {
    return false;
  }
}

export async function cancelAllWatchloomNotifications(): Promise<boolean> {
  if (!notificationsAreAvailable()) {
    return false;
  }

  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const watchloomNotifications = scheduledNotifications.filter(
      ({ content }) =>
        content.data?.type === WATCHLOOM_NOTIFICATION_TYPE,
    );

    await Promise.all(
      watchloomNotifications.map(({ identifier }) =>
        Notifications.cancelScheduledNotificationAsync(identifier),
      ),
    );

    return true;
  } catch {
    return false;
  }
}
