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
  seriesDetails: (slug: string) => `/series/${slug}`,
  seasonEpisodes: (seasonId: string) => `/series/seasons/${seasonId}`,
  watchlistDetails: (watchlistId: string) => `/watchlists/${watchlistId}`,
} as const;
