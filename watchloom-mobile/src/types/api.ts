import type {
  AuthUserDto,
  CatalogSearchQueryInput,
  EpisodeDto,
  GenreDto,
  MovieDetailsDto,
  MovieListItemDto,
  PaginatedResponse,
  SeasonDto,
  SeriesDetailsDto,
  SeriesListItemDto,
  WatchlistDto,
} from 'watchloom-shared';

export type {
  AuthUserDto,
  EpisodeDto,
  FavouriteDto,
  GenreDto,
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

export type SeriesSeasonsResponse = {
  series: SeriesDetailsDto;
  items: SeasonDto[];
};

export type GenresResponse = {
  items: GenreDto[];
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
