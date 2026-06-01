import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { NotificationResponseHandler } from '@/components/notifications/NotificationResponseHandler';
import { theme } from '@/constants/theme';
import { AppProviders } from '@/providers';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <NotificationResponseHandler />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movies/[slug]" options={{ title: 'Movie details' }} />
        <Stack.Screen name="series/[slug]" options={{ title: 'Series details' }} />
        <Stack.Screen name="series/seasons/[seasonId]" options={{ title: 'Season episodes' }} />
      </Stack>
    </AppProviders>
  );
}
