import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { theme } from '@/constants/theme';

type ButtonProps = PressableProps & {
  label: string;
};

export function Button({ disabled, label, style, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={(state) => [
        styles.button,
        state.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    backgroundColor: theme.colors.disabled,
  },
  label: {
    color: theme.colors.accentText,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
});
