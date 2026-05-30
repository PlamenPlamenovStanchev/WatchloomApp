import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';

type ScreenProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
  scroll?: boolean;
  scrollViewProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>;
  style?: StyleProp<ViewStyle>;
}>;

export function Screen({
  children,
  contentContainerStyle,
  edges,
  scroll = true,
  scrollViewProps,
  style,
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.staticContent, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  staticContent: {
    flex: 1,
  },
});
