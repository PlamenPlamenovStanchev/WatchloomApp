export const routes = {
  auth: {
    login: '/(auth)/login',
    register: '/(auth)/register',
  },
  tabs: {
    home: '/(tabs)/home',
    movies: '/(tabs)/movies',
    series: '/(tabs)/series',
    watchlists: '/(tabs)/watchlists',
    profile: '/(tabs)/profile',
  },
  movieDetails: (slug: string) => `/movies/${slug}`,
  favourites: '/favourites',
  planned: '/planned',
  reviews: '/reviews',
  seriesDetails: (slug: string) => `/series/${slug}`,
  seasonEpisodes: (seasonId: string) => `/series/seasons/${seasonId}`,
  newWatchlist: '/watchlists/new',
  watchlistDetails: (watchlistId: string) => `/watchlists/${watchlistId}`,
  editWatchlist: (watchlistId: string) => `/watchlists/${watchlistId}/edit`,
} as const;
