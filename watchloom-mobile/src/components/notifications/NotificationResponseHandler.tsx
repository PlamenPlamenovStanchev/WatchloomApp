import { useEffect, useRef, useState } from 'react';
import { router, type Href, useRootNavigationState } from 'expo-router';
import type { NotificationResponse } from 'expo-notifications';

import { routes } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import {
  addNotificationResponseListener,
  clearLastNotificationResponse,
  getLastNotificationResponse,
} from '@/lib/notifications';
import { deletePlannedNotificationRecord } from '@/lib/planned-notification-storage';

export function NotificationResponseHandler() {
  const navigationState = useRootNavigationState();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [response, setResponse] = useState<NotificationResponse | null>(null);
  const handledResponseId = useRef<string | null>(null);

  useEffect(() => {
    void getLastNotificationResponse()
      .then(setResponse)
      .catch(() => undefined);

    const subscription = addNotificationResponseListener(setResponse);

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (!navigationState?.key || authLoading || !response) {
      return;
    }

    const responseId = response.notification.request.identifier;

    if (handledResponseId.current === responseId) {
      return;
    }

    handledResponseId.current = responseId;
    void clearLastNotificationResponse().catch(() => undefined);
    void clearDeliveredReminderRecord(response).catch(() => undefined);

    router.push(
      (isAuthenticated ? getPlannedWatchDestination(response) : routes.auth.login) as Href,
    );
  }, [authLoading, isAuthenticated, navigationState?.key, response]);

  return null;
}

function getPlannedWatchDestination(response: NotificationResponse) {
  const data = response.notification.request.content.data ?? {};

  if (data.type !== 'planned-watch') {
    return routes.planned;
  }

  if (typeof data.slug === 'string') {
    if (data.mediaType === 'movie') {
      return routes.movieDetails(data.slug);
    }

    if (data.mediaType === 'series') {
      return routes.seriesDetails(data.slug);
    }
  }

  if (typeof data.watchlistId === 'string' || typeof data.watchlistId === 'number') {
    return routes.watchlistDetails(String(data.watchlistId));
  }

  return routes.planned;
}

async function clearDeliveredReminderRecord(response: NotificationResponse) {
  const data = response.notification.request.content.data ?? {};

  if (data.type !== 'planned-watch') {
    return;
  }

  const watchlistItemId = data.watchlistItemId ?? data.itemId;

  if (typeof watchlistItemId === 'string' || typeof watchlistItemId === 'number') {
    await deletePlannedNotificationRecord(watchlistItemId);
  }
}
