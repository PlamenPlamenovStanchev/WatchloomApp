import { apiClient } from '@/lib/api-client';
import type { FavouriteDto } from '@/types/api';

export type FavouriteMediaInput =
  | {
      mediaType: 'movie';
      movieId: number;
      seriesId?: never;
    }
  | {
      mediaType: 'series';
      movieId?: never;
      seriesId: number;
    };

export type FavouriteWithMediaDto = FavouriteDto & {
  media: {
    posterUrl?: string | null;
    slug: string;
    title: string;
  } | null;
};

export function getFavourites(token: string) {
  return apiClient.get<FavouriteWithMediaDto[]>('/api/favourites', { token });
}

export function addFavourite(token: string, input: FavouriteMediaInput) {
  return apiClient.post<FavouriteDto>('/api/favourites', input, { token });
}

export function removeFavourite(token: string, favouriteId: number | string) {
  return apiClient.delete<boolean>(favouritePath(favouriteId), { token });
}

export function removeFavouriteByMedia(token: string, input: FavouriteMediaInput) {
  return apiClient.delete<boolean>('/api/favourites/by-media', { body: input, token });
}

export function checkIsFavourite(token: string, input: FavouriteMediaInput) {
  return apiClient.get<FavouriteDto | null>('/api/favourites/by-media', {
    query: input,
    token,
  });
}

function favouritePath(favouriteId: number | string) {
  return `/api/favourites/${encodeURIComponent(String(favouriteId))}`;
}
