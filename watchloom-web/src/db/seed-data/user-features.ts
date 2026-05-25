export type SeedWatchlist = {
  userEmail: string;
  name: string;
  description?: string | null;
  isDefault?: boolean;
};

export type SeedWatchlistItem = {
  userEmail: string;
  watchlistName: string;
  mediaType: "movie" | "series";
  mediaSlug: string;
  status: "watched" | "watching" | "to_watch";
  plannedWatchAt?: string | null;
  rating?: number | null;
  notes?: string | null;
};

export type SeedReview = {
  userEmail: string;
  mediaType: "movie" | "series";
  mediaSlug: string;
  rating: number;
  title?: string | null;
  content: string;
  isPublic?: boolean;
};

export type SeedFavourite = {
  userEmail: string;
  mediaType: "movie" | "series";
  mediaSlug: string;
};

export type SeedContactMessage = {
  userEmail?: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "resolved";
};

export const seedWatchlists: SeedWatchlist[] = [
  {
    userEmail: "user@watchloom.dev",
    name: "My Watchlist",
    description: "A default list for movies and shows to revisit.",
    isDefault: true,
  },
  {
    userEmail: "user@watchloom.dev",
    name: "Weekend Movies",
    description: "Easy picks for slower weekends.",
  },
  {
    userEmail: "alice@watchloom.dev",
    name: "Currently Watching",
    description: "Shows in progress.",
    isDefault: true,
  },
  {
    userEmail: "editor@watchloom.dev",
    name: "Classics to Watch",
    description: "Reference titles for catalog curation.",
    isDefault: true,
  },
  {
    userEmail: "admin@watchloom.dev",
    name: "My Watchlist",
    description: "Admin QA list for authenticated features.",
    isDefault: true,
  },
];

export const seedWatchlistItems: SeedWatchlistItem[] = [
  {
    userEmail: "user@watchloom.dev",
    watchlistName: "My Watchlist",
    mediaType: "movie",
    mediaSlug: "the-shawshank-redemption",
    status: "watched",
    rating: 5,
    notes: "Still a favorite.",
  },
  {
    userEmail: "user@watchloom.dev",
    watchlistName: "My Watchlist",
    mediaType: "series",
    mediaSlug: "breaking-bad",
    status: "watching",
    notes: "Mid-season rewatch.",
  },
  {
    userEmail: "user@watchloom.dev",
    watchlistName: "Weekend Movies",
    mediaType: "movie",
    mediaSlug: "inception",
    status: "to_watch",
    plannedWatchAt: "2026-06-06T18:00:00.000Z",
  },
  {
    userEmail: "editor@watchloom.dev",
    watchlistName: "Classics to Watch",
    mediaType: "movie",
    mediaSlug: "the-godfather",
    status: "to_watch",
    plannedWatchAt: "2026-06-13T19:00:00.000Z",
  },
  {
    userEmail: "editor@watchloom.dev",
    watchlistName: "Classics to Watch",
    mediaType: "series",
    mediaSlug: "game-of-thrones",
    status: "watched",
    rating: 4,
  },
  {
    userEmail: "admin@watchloom.dev",
    watchlistName: "My Watchlist",
    mediaType: "series",
    mediaSlug: "the-mandalorian",
    status: "watching",
  },
];

export const seedReviews: SeedReview[] = [
  {
    userEmail: "user@watchloom.dev",
    mediaType: "movie",
    mediaSlug: "the-shawshank-redemption",
    rating: 5,
    title: "Warm and enduring",
    content: "A patient story about friendship, hope, and quiet resilience.",
  },
  {
    userEmail: "editor@watchloom.dev",
    mediaType: "series",
    mediaSlug: "breaking-bad",
    rating: 5,
    title: "Sharp character work",
    content: "A tense transformation story with strong performances throughout.",
  },
  {
    userEmail: "admin@watchloom.dev",
    mediaType: "movie",
    mediaSlug: "inception",
    rating: 4,
    title: "Great catalog test title",
    content: "Layered, accessible, and useful for testing action and sci-fi filters.",
  },
];

export const seedFavourites: SeedFavourite[] = [
  { userEmail: "user@watchloom.dev", mediaType: "movie", mediaSlug: "forrest-gump" },
  { userEmail: "user@watchloom.dev", mediaType: "series", mediaSlug: "breaking-bad" },
  { userEmail: "editor@watchloom.dev", mediaType: "movie", mediaSlug: "the-dark-knight" },
  { userEmail: "admin@watchloom.dev", mediaType: "series", mediaSlug: "game-of-thrones" },
];

export const seedContactMessages: SeedContactMessage[] = [
  {
    userEmail: "user@watchloom.dev",
    name: "Watchloom User",
    email: "user@watchloom.dev",
    subject: "Editor access request",
    message: "I would like to help improve movie and series metadata as an editor.",
    status: "new",
  },
  {
    name: "Mira Stone",
    email: "mira.stone@example.com",
    subject: "Catalog correction",
    message: "I noticed a release year that may need review in the catalog.",
    status: "read",
  },
];
