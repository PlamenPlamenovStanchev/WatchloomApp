import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <View accessibilityRole="progressbar" style={styles.container}>
      <ActivityIndicator color={theme.colors.accent} size="large" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
  },
});
