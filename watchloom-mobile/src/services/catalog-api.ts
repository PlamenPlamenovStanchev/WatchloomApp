import { apiClient } from '@/lib/api-client';
import type {
  CatalogQueryParams,
  Movie,
  PaginatedResponse,
  SeasonEpisodes,
  Series,
} from '@/types/api';

export function getMovies(params: CatalogQueryParams = {}) {
  return apiClient.get<PaginatedResponse<Movie>>('/api/movies', { query: params });
}

export function getMovieBySlug(slug: string) {
  return apiClient.get<Movie>(`/api/movies/${encodeURIComponent(slug)}`);
}

export function getSeries(params: CatalogQueryParams = {}) {
  return apiClient.get<PaginatedResponse<Series>>('/api/series', { query: params });
}

export function getSeriesBySlug(slug: string) {
  return apiClient.get<Series>(`/api/series/${encodeURIComponent(slug)}`);
}

export function getSeasonEpisodes(seasonId: number | string) {
  return apiClient.get<SeasonEpisodes>(
    `/api/seasons/${encodeURIComponent(String(seasonId))}/episodes`,
  );
}
