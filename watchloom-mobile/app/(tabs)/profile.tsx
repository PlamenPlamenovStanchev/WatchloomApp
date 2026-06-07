import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { clearError, error, isAuthenticated, isLoading, logout, refreshUser, user } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace(routes.tabs.home as Href);
    }
  }

  if (isLoading && !user) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <LoadingState message="Loading your profile..." />
      </Screen>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Log in or create an account to manage your Watchloom profile and saved titles.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            onPress={() => {
              clearError();
              router.push(routes.auth.login as Href);
            }}
            title="Log in"
          />
          <Button
            onPress={() => {
              clearError();
              router.push(routes.auth.register as Href);
            }}
            title="Create account"
            variant="secondary"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your Watchloom account details.</Text>
      </View>

      <Card>
        <ProfileRow label="Username" value={user.username} />
        <ProfileRow label="Email" value={user.email} />
        <ProfileRow label="Role" value={user.role} />
      </Card>

      {error ? (
        <ErrorState
          message="We could not refresh your account details. Please try again."
          retryAction={<Button onPress={() => void refreshUser()} title="Retry" variant="secondary" />}
          title="Could not refresh profile"
        />
      ) : null}

      <Button
        onPress={() => router.push(routes.favourites as Href)}
        title="View Favourites"
      />
      <Button onPress={() => router.push(routes.reviews as Href)} title="View My Reviews" />
      <Button loading={isLoading} onPress={handleLogout} title="Log out" variant="secondary" />
    </Screen>
  );
}

type ProfileRowProps = {
  label: string;
  value: string;
};

function ProfileRow({ label, value }: ProfileRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.xxl,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 24,
  },
  actions: {
    gap: theme.spacing.md,
  },
  row: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
  },
});
