import { apiClient } from '@/lib/api-client';
import type {
  CatalogQueryParams,
  MovieDetailsResponse,
  MovieListResponse,
  SeasonEpisodes,
  SeriesDetailsResponse,
  SeriesListResponse,
} from '@/types/api';

export function getMovies(params: CatalogQueryParams = {}) {
  return apiClient.get<MovieListResponse>('/api/movies', { query: params });
}

export function getMovieBySlug(slug: string) {
  return apiClient.get<MovieDetailsResponse>(`/api/movies/${encodeURIComponent(slug)}`);
}

export function getSeries(params: CatalogQueryParams = {}) {
  return apiClient.get<SeriesListResponse>('/api/series', { query: params });
}

export function getSeriesBySlug(slug: string) {
  return apiClient.get<SeriesDetailsResponse>(`/api/series/${encodeURIComponent(slug)}`);
}

export function getSeasonEpisodes(seasonId: number | string) {
  return apiClient.get<SeasonEpisodes>(
    `/api/seasons/${encodeURIComponent(String(seasonId))}/episodes`,
  );
}
