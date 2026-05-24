import { z } from "zod";

export type MediaType = "movie" | "series";

export type SeriesStatus = "ongoing" | "ended" | "cancelled" | "unknown";

const optionalTrimmedStringSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().optional(),
);

const optionalCoercedPageSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(1).optional(),
);

const optionalCoercedPageSizeSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(1).max(100).optional(),
);

export const paginationQuerySchema = z.object({
  page: optionalCoercedPageSchema,
  pageSize: optionalCoercedPageSizeSchema,
});

export const catalogSearchQuerySchema = paginationQuerySchema.extend({
  q: optionalTrimmedStringSchema,
  genre: optionalTrimmedStringSchema,
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
export type CatalogSearchQueryInput = z.infer<typeof catalogSearchQuerySchema>;

export interface GenreDto {
  id: number;
  name: string;
  slug: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends PaginationMeta {
  items: T[];
}

export interface MovieListItemDto {
  id: number;
  title: string;
  slug: string;
  overview?: string | null;
  releaseDate?: string | null;
  releaseYear?: number | null;
  durationMinutes?: number | null;
  director?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  genres?: GenreDto[];
}

export interface MovieDetailsDto extends MovieListItemDto {
  writer?: string | null;
  cast?: string | null;
}

export interface SeriesListItemDto {
  id: number;
  title: string;
  slug: string;
  overview?: string | null;
  firstAirDate?: string | null;
  releaseYear?: number | null;
  status?: SeriesStatus | null;
  network?: string | null;
  platform?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  genres?: GenreDto[];
}

export interface SeriesDetailsDto extends SeriesListItemDto {
  creator?: string | null;
  cast?: string | null;
  seasons?: SeasonDto[];
}

export interface SeasonDto {
  id: number;
  seriesId: number;
  seasonNumber: number;
  title?: string | null;
  overview?: string | null;
  releaseDate?: string | null;
}

export interface EpisodeDto {
  id: number;
  seasonId: number;
  episodeNumber: number;
  title: string;
  overview?: string | null;
  airDate?: string | null;
  durationMinutes?: number | null;
}
