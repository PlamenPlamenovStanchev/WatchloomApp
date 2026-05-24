import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { GenreFilter } from "@/components/catalog/GenreFilter";
import { MovieCard } from "@/components/catalog/MovieCard";
import { Pagination } from "@/components/catalog/Pagination";
import { SearchBar } from "@/components/catalog/SearchBar";
import { getGenres } from "@/services/genre.service";
import { getMovies } from "@/services/movie.service";

const PAGE_SIZE = 12;

type MoviesPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
    q?: string | string[];
    genre?: string | string[];
  }>;
};

const getSearchParam = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const params = searchParams ? await searchParams : {};
  const page = getSearchParam(params.page);
  const q = getSearchParam(params.q);
  const genre = getSearchParam(params.genre);

  const [movieResults, genres] = await Promise.all([
    getMovies({ page, pageSize: PAGE_SIZE, search: q, genre }),
    getGenres(),
  ]);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Watchloom
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Movies</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Browse the public movie catalog, filter by genre, or search by title.
              </p>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {movieResults.totalItems} {movieResults.totalItems === 1 ? "movie" : "movies"}
            </p>
          </div>
        </header>

        <section className="space-y-4" aria-label="Movie filters">
          <SearchBar action="/movies" q={q} genre={genre} />
          {genres.length > 0 ? (
            <GenreFilter genres={genres} basePath="/movies" currentGenre={genre} q={q} />
          ) : null}
        </section>

        {movieResults.items.length > 0 ? (
          <CatalogGrid>
            {movieResults.items.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                slug={movie.slug}
                posterUrl={movie.posterUrl}
                releaseDate={movie.releaseDate}
                genres={movie.genres}
              />
            ))}
          </CatalogGrid>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold">No movies found</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Try a different title or genre filter.
            </p>
          </div>
        )}

        <Pagination
          currentPage={movieResults.page}
          totalPages={movieResults.totalPages}
          basePath="/movies"
          q={q}
          genre={genre}
        />
      </div>
    </main>
  );
}
