import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { showMessage } from '@/lib/message';
import {
  addFavourite,
  checkIsFavourite,
  removeFavouriteByMedia,
  type FavouriteMediaInput,
} from '@/services/favourite-api';
import type { FavouriteDto } from '@/types/api';

type FavouriteActionButtonProps = {
  mediaId: number;
  mediaType: 'movie' | 'series';
  token: string;
};

export function FavouriteActionButton({
  mediaId,
  mediaType,
  token,
}: FavouriteActionButtonProps) {
  const [favourite, setFavourite] = useState<FavouriteDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const input = useMemo(() => createFavouriteInput(mediaType, mediaId), [mediaId, mediaType]);

  const loadFavourite = useCallback(async () => {
    setLoading(true);

    try {
      setFavourite(await checkIsFavourite(token, input));
    } catch (error) {
      showMessage(
        'Could not load favourite state',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [input, token]);

  useEffect(() => {
    // This effect starts the authenticated request; the helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFavourite();
  }, [loadFavourite]);

  async function toggleFavourite() {
    setSubmitting(true);

    try {
      if (favourite) {
        await removeFavouriteByMedia(token, input);
        setFavourite(null);
        showMessage('Removed from favourites', 'This title is no longer in your favourites.');
      } else {
        setFavourite(await addFavourite(token, input));
        showMessage('Added to favourites', 'This title is now in your favourites.');
      }
    } catch (error) {
      showMessage(
        'Could not update favourites',
        error instanceof Error ? error.message : 'Please try again.',
      );
      await loadFavourite();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button
      loading={loading || submitting}
      onPress={() => {
        void toggleFavourite();
      }}
      title={favourite ? 'Remove from Favourites' : 'Add to Favourites'}
      variant="secondary"
    />
  );
}

function createFavouriteInput(mediaType: 'movie' | 'series', mediaId: number): FavouriteMediaInput {
  return mediaType === 'movie' ? { mediaType, movieId: mediaId } : { mediaType, seriesId: mediaId };
}
