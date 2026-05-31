import { apiClient } from '@/lib/api-client';
import type {
  AddWatchlistItemInput,
  CreateWatchlistInput,
  PlannedWatchItemDto,
  UpdateWatchlistInput,
  UpdateWatchlistItemInput,
  WatchlistDto,
  WatchlistItemDto,
  WatchlistSummaryDto,
  WatchlistWithItemsDto,
} from '@/types/api';

export function getWatchlists(token: string) {
  return apiClient.get<WatchlistSummaryDto[]>('/api/watchlists', { token });
}

export function createWatchlist(token: string, input: CreateWatchlistInput) {
  return apiClient.post<WatchlistDto>('/api/watchlists', input, { token });
}

export function getWatchlistById(token: string, watchlistId: number | string) {
  return apiClient.get<WatchlistWithItemsDto>(watchlistPath(watchlistId), { token });
}

export function updateWatchlist(
  token: string,
  watchlistId: number | string,
  input: UpdateWatchlistInput,
) {
  return apiClient.patch<WatchlistDto>(watchlistPath(watchlistId), input, { token });
}

export function deleteWatchlist(token: string, watchlistId: number | string) {
  return apiClient.delete<boolean>(watchlistPath(watchlistId), { token });
}

export function addWatchlistItem(
  token: string,
  watchlistId: number | string,
  input: AddWatchlistItemInput,
) {
  return apiClient.post<WatchlistItemDto>(`${watchlistPath(watchlistId)}/items`, input, { token });
}

export function updateWatchlistItem(
  token: string,
  itemId: number | string,
  input: UpdateWatchlistItemInput,
) {
  return apiClient.patch<WatchlistItemDto>(watchlistItemPath(itemId), input, { token });
}

export function removeWatchlistItem(token: string, itemId: number | string) {
  return apiClient.delete<boolean>(watchlistItemPath(itemId), { token });
}

export function getPlannedWatchItems(token: string) {
  return apiClient.get<PlannedWatchItemDto[]>('/api/watchlists/planned', { token });
}

function watchlistPath(watchlistId: number | string) {
  return `/api/watchlists/${encodeURIComponent(String(watchlistId))}`;
}

function watchlistItemPath(itemId: number | string) {
  return `/api/watchlist-items/${encodeURIComponent(String(itemId))}`;
}
