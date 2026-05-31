import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { theme } from '@/constants/theme';

type WatchlistFormValues = {
  description?: string | null;
  name: string;
};

type WatchlistFormProps = {
  error?: string | null;
  initialDescription?: string | null;
  initialName?: string;
  loading?: boolean;
  onSubmit: (values: WatchlistFormValues) => Promise<void>;
  submitLabel: string;
};

export function WatchlistForm({
  error,
  initialDescription = '',
  initialName = '',
  loading = false,
  onSubmit,
  submitLabel,
}: WatchlistFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? '');
  const [nameError, setNameError] = useState<string | undefined>();

  async function handleSubmit() {
    const normalizedName = name.trim();

    if (!normalizedName) {
      setNameError('Watchlist name is required.');
      return;
    }

    if (normalizedName.length > 100) {
      setNameError('Watchlist name must be 100 characters or fewer.');
      return;
    }

    await onSubmit({
      description: description.trim() || null,
      name: normalizedName,
    });
  }

  return (
    <View style={styles.form}>
      <Input
        error={nameError}
        label="Name"
        maxLength={100}
        onChangeText={(value) => {
          setName(value);
          setNameError(undefined);
        }}
        placeholder="My watchlist"
        value={name}
      />
      <Input
        label="Description"
        multiline
        onChangeText={setDescription}
        placeholder="Optional description"
        style={styles.description}
        textAlignVertical="top"
        value={description}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button loading={loading} onPress={() => void handleSubmit()} title={submitLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.md,
  },
  description: {
    minHeight: 112,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
  },
});
