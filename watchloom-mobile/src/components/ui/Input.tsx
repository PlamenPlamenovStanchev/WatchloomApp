import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { theme } from '@/constants/theme';

export function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={theme.colors.textMuted}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
  },
});
