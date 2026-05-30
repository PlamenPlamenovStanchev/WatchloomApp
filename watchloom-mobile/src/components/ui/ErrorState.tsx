import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type ErrorStateProps = {
  message: string;
  retryAction?: ReactNode;
  title: string;
};

export function ErrorState({ message, retryAction, title }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {retryAction}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  title: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
    textAlign: 'center',
  },
});
