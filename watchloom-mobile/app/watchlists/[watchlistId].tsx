import { router } from 'expo-router';
import { Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';

export default function WatchlistDetailsScreen() {
  return (
    <Screen>
      <Button onPress={() => router.back()} title="Back" variant="ghost" />
      <Card>
        <Text style={{ color: theme.colors.text }}>
          Watchlist details will appear here.
        </Text>
      </Card>
    </Screen>
  );
}
