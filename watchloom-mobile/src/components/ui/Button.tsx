import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { theme } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'back';

type ButtonProps = Omit<PressableProps, 'children'> & {
  loading?: boolean;
  title: string;
  variant?: ButtonVariant;
};

export function Button({
  disabled,
  loading = false,
  style,
  title,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const indicatorColor =
    variant === 'primary' || variant === 'back' ? theme.colors.accentText : theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={(state) => [
        styles.button,
        styles[variant],
        state.pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} size="small" />
      ) : (
        <Text style={[styles.title, styles[`${variant}Title`]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
  },
  primary: {
    backgroundColor: theme.colors.accent,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
    minHeight: 40,
    paddingVertical: theme.spacing.sm,
  },
  back: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.55,
  },
  title: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  primaryTitle: {
    color: theme.colors.accentText,
  },
  secondaryTitle: {
    color: theme.colors.text,
  },
  ghostTitle: {
    color: theme.colors.accent,
  },
  backTitle: {
    color: theme.colors.accentText,
  },
});
