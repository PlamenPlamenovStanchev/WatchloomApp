import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { RatingInput } from '@/components/reviews/RatingInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { theme } from '@/constants/theme';
import type { ReviewDetailsInput } from '@/services/review-api';
import type { ReviewDto } from '@/types/api';

type ReviewFormProps = {
  loading?: boolean;
  onDelete?: () => Promise<void>;
  onSubmit: (input: ReviewDetailsInput) => Promise<void>;
  review?: ReviewDto | null;
};

export function ReviewForm({
  loading = false,
  onDelete,
  onSubmit,
  review,
}: ReviewFormProps) {
  const [rating, setRating] = useState<ReviewDetailsInput['rating']>(getRating(review?.rating));
  const [title, setTitle] = useState(review?.title ?? '');
  const [content, setContent] = useState(review?.content ?? '');
  const [isPublic, setIsPublic] = useState(review?.isPublic ?? true);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!content.trim()) {
      setError('Review content is required.');
      return;
    }

    setError(null);
    await onSubmit({
      content: content.trim(),
      isPublic,
      rating,
      title: title.trim() || null,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{review ? 'Edit My Review' : 'Write a Review'}</Text>
      <RatingInput disabled={loading} onChange={setRating} value={rating} />
      <Input
        editable={!loading}
        label="Title (optional)"
        maxLength={120}
        onChangeText={setTitle}
        placeholder="Give your review a title"
        value={title}
      />
      <Input
        editable={!loading}
        label="Review"
        maxLength={4000}
        multiline
        onChangeText={setContent}
        placeholder="Share your thoughts"
        style={styles.contentInput}
        value={content}
      />
      <View style={styles.publicRow}>
        <Text style={styles.label}>Public review</Text>
        <Switch disabled={loading} onValueChange={setIsPublic} value={isPublic} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        loading={loading}
        onPress={() => {
          void submit();
        }}
        title={review ? 'Update Review' : 'Save Review'}
      />
      {review && onDelete ? (
        <Button
          disabled={loading}
          onPress={() => {
            void onDelete();
          }}
          title="Delete Review"
          variant="ghost"
        />
      ) : null}
    </View>
  );
}

function getRating(value?: number): ReviewDetailsInput['rating'] {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5 ? value : 5;
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  heading: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  contentInput: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  publicRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
  },
});
