import { Link, router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

type FieldErrors = {
  confirmPassword?: string;
  email?: string;
  password?: string;
  username?: string;
};

function validate(username: string, email: string, password: string, confirmPassword: string) {
  const errors: FieldErrors = {};
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim();

  if (!normalizedUsername) {
    errors.username = 'Username is required.';
  } else if (normalizedUsername.length < 3) {
    errors.username = 'Username must be at least 3 characters.';
  } else if (normalizedUsername.length > 80) {
    errors.username = 'Username must be 80 characters or fewer.';
  }

  if (!normalizedEmail) {
    errors.email = 'Email is required.';
  } else if (!normalizedEmail.includes('@')) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export default function RegisterScreen() {
  const { clearError, error, isAuthenticated, isLoading, register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(routes.tabs.home as Href);
    }
  }, [isAuthenticated]);

  async function handleSubmit() {
    const nextErrors = validate(username, email, password, confirmPassword);

    setFieldErrors(nextErrors);
    clearError();

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const result = await register({
        email: email.trim(),
        password,
        username: username.trim(),
      });

      router.replace((result.isAuthenticated ? routes.tabs.home : routes.auth.login) as Href);
    } catch {
      // AuthProvider exposes the API error for display.
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>WATCHLOOM</Text>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Save favourites and build watchlists across your devices.</Text>
      </View>

      <View style={styles.form}>
        <Input
          autoCapitalize="none"
          autoComplete="username-new"
          error={fieldErrors.username}
          label="Username"
          onChangeText={(value) => {
            setUsername(value);
            setFieldErrors((current) => ({ ...current, username: undefined }));
          }}
          placeholder="Choose a username"
          value={username}
        />
        <Input
          autoCapitalize="none"
          autoComplete="email"
          error={fieldErrors.email}
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) => {
            setEmail(value);
            setFieldErrors((current) => ({ ...current, email: undefined }));
          }}
          placeholder="you@example.com"
          value={email}
        />
        <Input
          autoComplete="new-password"
          error={fieldErrors.password}
          label="Password"
          onChangeText={(value) => {
            setPassword(value);
            setFieldErrors((current) => ({ ...current, password: undefined }));
          }}
          placeholder="Create a password"
          secureTextEntry
          value={password}
        />
        <Input
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
          label="Confirm password"
          onChangeText={(value) => {
            setConfirmPassword(value);
            setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
          }}
          placeholder="Enter your password again"
          secureTextEntry
          value={confirmPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button loading={isLoading} onPress={handleSubmit} title="Create account" />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href={routes.auth.login as Href} style={styles.link}>
          Log in
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
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
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 24,
  },
  form: {
    gap: theme.spacing.md,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    justifyContent: 'center',
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
  },
  link: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
});
