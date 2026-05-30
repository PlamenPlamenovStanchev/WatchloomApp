import type { MediaType } from "./catalog";

export interface FavouriteDto {
  id: number;
  userId: number;
  mediaType: MediaType;
  movieId?: number | null;
  seriesId?: number | null;
  createdAt?: string;
}

export interface ReviewDto {
  id: number;
  userId: number;
  mediaType: MediaType;
  movieId?: number | null;
  seriesId?: number | null;
  rating: number;
  title?: string | null;
  content: string;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}
