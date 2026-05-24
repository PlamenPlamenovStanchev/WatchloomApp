import type { MediaType } from "./catalog";

export type WatchStatus = "watched" | "watching" | "to_watch";

export interface WatchlistItemDto {
  id: number;
  userId: number;
  mediaId: number;
  mediaType: MediaType;
  status: WatchStatus;
  createdAt?: string;
  updatedAt?: string;
}
