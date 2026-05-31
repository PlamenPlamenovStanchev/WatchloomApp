import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type DetailInfoRowProps = {
  label: string;
  value?: number | string | null;
};

export function DetailInfoRow({ label, value }: DetailInfoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Unavailable'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    lineHeight: 22,
  },
});
