import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>WATCHLOOM</Text>
        <Text style={styles.title}>Your watchlist, ready when you are.</Text>
        <Text style={styles.subtitle}>
          Browse movies and series, save favourites, and plan what to watch next.
        </Text>
      </View>

      <Card>
        <Text style={styles.cardTitle}>Mobile app foundation</Text>
        <Text style={styles.cardText}>
          The Expo client is ready for regular-user features. Authentication and catalog data will
          be connected in later steps.
        </Text>
        <Button label="Coming soon" disabled />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
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
    lineHeight: 40,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 24,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  cardText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
  },
});
