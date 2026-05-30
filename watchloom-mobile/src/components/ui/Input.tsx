import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { theme } from '@/constants/theme';

type InputProps = TextInputProps & {
  error?: string;
  label?: string;
};

export function Input({ error, label, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
  },
});
