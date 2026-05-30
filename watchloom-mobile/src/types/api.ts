export type CatalogQueryParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  genre?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type Genre = {
  id: number;
  name: string;
  slug: string;
};

export type Movie = {
  id: number;
  title: string;
  slug: string;
  overview?: string | null;
  releaseDate?: string | null;
  durationMinutes?: number | null;
  director?: string | null;
  writer?: string | null;
  cast?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  genres?: Genre[];
};

export type Series = {
  id: number;
  title: string;
  slug: string;
  overview?: string | null;
  firstAirDate?: string | null;
  status?: string | null;
  network?: string | null;
  platform?: string | null;
  creator?: string | null;
  cast?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  genres?: Genre[];
};

export type Episode = {
  id: number;
  seasonId: number;
  episodeNumber: number;
  title: string;
  overview?: string | null;
  airDate?: string | null;
  durationMinutes?: number | null;
};

export type SeasonEpisodes = {
  seasonId: number;
  items: Episode[];
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  username: string;
  password: string;
};

export type User = {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'editor' | 'admin';
  isActive: boolean;
  createdAt: string;
};

export type LoginResponse = {
  user: User;
  accessToken: string;
};

export type UserResponse = {
  user: User;
};

export type CreateWatchlistInput = {
  name: string;
  description?: string | null;
};

export type Watchlist = {
  id: number;
  userId: number;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
