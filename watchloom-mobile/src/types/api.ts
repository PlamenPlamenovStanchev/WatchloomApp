import type {
  AuthUserDto,
  CatalogSearchQueryInput,
  EpisodeDto,
  MovieDetailsDto,
  MovieListItemDto,
  PaginatedResponse,
  SeriesDetailsDto,
  SeriesListItemDto,
  WatchlistDto,
} from 'watchloom-shared';

export type {
  AuthUserDto,
  EpisodeDto,
  FavouriteDto,
  MediaType,
  MovieDetailsDto,
  MovieListItemDto,
  PaginatedResponse,
  PaginationMeta,
  ReviewDto,
  SeasonDto,
  SeriesDetailsDto,
  SeriesListItemDto,
  SeriesStatus,
  UserRole,
  WatchlistDto,
  WatchlistItemDto,
  WatchStatus,
} from 'watchloom-shared';

export type CatalogQueryParams = CatalogSearchQueryInput;

export type SeasonEpisodes = {
  seasonId: number;
  items: EpisodeDto[];
};

export type LoginResponse = {
  user: AuthUserDto;
  accessToken: string;
};

export type RegisterResponse = {
  user: AuthUserDto;
  accessToken?: string;
};

export type UserResponse = {
  user: AuthUserDto;
};

export type CreateWatchlistInput = {
  name: string;
  description?: string | null;
};

export type WatchlistResponse = WatchlistDto;

export type MovieListResponse = PaginatedResponse<MovieListItemDto>;

export type SeriesListResponse = PaginatedResponse<SeriesListItemDto>;

export type MovieDetailsResponse = MovieDetailsDto;

export type SeriesDetailsResponse = SeriesDetailsDto;

export type { LoginInput, RegisterInput } from 'watchloom-shared';
