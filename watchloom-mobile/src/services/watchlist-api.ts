import { apiClient } from '@/lib/api-client';
import type { CreateWatchlistInput, WatchlistDto } from '@/types/api';

export function getWatchlists(token: string) {
  return apiClient.get<WatchlistDto[]>('/api/watchlists', { token });
}

export function createWatchlist(token: string, input: CreateWatchlistInput) {
  return apiClient.post<WatchlistDto>('/api/watchlists', input, { token });
}

export function getWatchlist(token: string, id: number | string) {
  return apiClient.get<WatchlistDto>(`/api/watchlists/${encodeURIComponent(String(id))}`, { token });
}
