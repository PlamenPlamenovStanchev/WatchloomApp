import { apiClient } from '@/lib/api-client';
import type {
  CatalogQueryParams,
  GenresResponse,
  MovieDetailsResponse,
  MovieListResponse,
  SeasonEpisodes,
  SeriesDetailsResponse,
  SeriesListResponse,
  SeriesSeasonsResponse,
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

export function getSeriesSeasons(slug: string) {
  return apiClient.get<SeriesSeasonsResponse>(
    `/api/series/${encodeURIComponent(slug)}/seasons`,
  );
}

export function getSeasonEpisodes(seasonId: number | string) {
  return apiClient.get<SeasonEpisodes>(
    `/api/seasons/${encodeURIComponent(String(seasonId))}/episodes`,
  );
}

export function getGenres() {
  return apiClient.get<GenresResponse>('/api/genres');
}
