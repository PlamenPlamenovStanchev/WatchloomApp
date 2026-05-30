import { apiClient } from '@/lib/api-client';
import type { CreateWatchlistInput, Watchlist } from '@/types/api';

export function getWatchlists(token: string) {
  return apiClient.get<Watchlist[]>('/api/watchlists', { token });
}

export function createWatchlist(token: string, input: CreateWatchlistInput) {
  return apiClient.post<Watchlist>('/api/watchlists', input, { token });
}

export function getWatchlist(token: string, id: number | string) {
  return apiClient.get<Watchlist>(`/api/watchlists/${encodeURIComponent(String(id))}`, { token });
}
