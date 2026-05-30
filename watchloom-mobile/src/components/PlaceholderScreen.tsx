import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';

type PlaceholderScreenProps = {
  title: string;
  description: string;
};

export function PlaceholderScreen({ description, title }: PlaceholderScreenProps) {
  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  copy: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.xxl,
    fontWeight: '700',
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 24,
  },
});
