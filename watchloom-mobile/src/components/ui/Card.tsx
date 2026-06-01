import { StyleSheet, View, type ViewProps } from 'react-native';

import { theme } from '@/constants/theme';

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    elevation: 2,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
});
