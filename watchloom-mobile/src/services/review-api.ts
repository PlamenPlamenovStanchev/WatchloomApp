import { apiClient } from '@/lib/api-client';
import type { ReviewDto } from '@/types/api';

export type ReviewMediaInput =
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

export type ReviewDetailsInput = {
  content: string;
  isPublic: boolean;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string | null;
};

export type CreateReviewInput = ReviewMediaInput & ReviewDetailsInput;

export type PublicReviewDto = ReviewDto & {
  user: {
    username: string;
  };
};

export type ReviewWithMediaDto = ReviewDto & {
  media: {
    slug: string;
    title: string;
  } | null;
};

export function getReviewsForMedia(input: ReviewMediaInput) {
  return apiClient.get<PublicReviewDto[]>('/api/reviews', { query: input });
}

export function getMyReviews(token: string) {
  return apiClient.get<ReviewWithMediaDto[]>('/api/reviews/mine', { token });
}

export function createReview(token: string, input: CreateReviewInput) {
  return apiClient.post<ReviewDto>('/api/reviews', input, { token });
}

export function updateReview(token: string, reviewId: number | string, input: ReviewDetailsInput) {
  return apiClient.patch<ReviewDto>(reviewPath(reviewId), input, { token });
}

export function deleteReview(token: string, reviewId: number | string) {
  return apiClient.delete<boolean>(reviewPath(reviewId), { token });
}

function reviewPath(reviewId: number | string) {
  return `/api/reviews/${encodeURIComponent(String(reviewId))}`;
}
