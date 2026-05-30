import type { MediaType } from "./catalog";

export type WatchStatus = "watched" | "watching" | "to_watch";

export interface WatchlistDto {
  id: number;
  userId: number;
  name: string;
  description?: string | null;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WatchlistItemDto {
  id: number;
  watchlistId: number;
  mediaType: MediaType;
  movieId?: number | null;
  seriesId?: number | null;
  status: WatchStatus;
  plannedWatchAt?: string | null;
  rating?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
