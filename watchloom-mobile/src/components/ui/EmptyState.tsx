import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type EmptyStateProps = {
  action?: ReactNode;
  message: string;
  title: string;
};

export function EmptyState({ action, message, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action}
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
    color: theme.colors.text,
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
