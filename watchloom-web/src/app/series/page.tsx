import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { GenreFilter } from "@/components/catalog/GenreFilter";
import { Pagination } from "@/components/catalog/Pagination";
import { SearchBar } from "@/components/catalog/SearchBar";
import { SeriesCard } from "@/components/catalog/SeriesCard";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserFavouriteMediaIds } from "@/services/favourite.service";
import { getGenres } from "@/services/genre.service";
import { getSeries } from "@/services/series.service";

const PAGE_SIZE = 12;

type SeriesPageProps = {
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

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const params = searchParams ? await searchParams : {};
  const page = getSearchParam(params.page);
  const q = getSearchParam(params.q);
  const genre = getSearchParam(params.genre);

  const [seriesResults, genres] = await Promise.all([
    getSeries({ page, pageSize: PAGE_SIZE, search: q, genre }),
    getGenres(),
  ]);
  const user = await getCurrentUser();
  const favouriteSeriesIds = user
    ? await getUserFavouriteMediaIds(
        user.id,
        "series",
        seriesResults.items.map((show) => show.id),
      )
    : new Set<number>();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Watchloom
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Series</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Browse the public series catalog, filter by genre, or search by title.
              </p>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {seriesResults.totalItems} {seriesResults.totalItems === 1 ? "series" : "series"}
            </p>
          </div>
        </header>

        <section className="space-y-4" aria-label="Series filters">
          <SearchBar action="/series" q={q} genre={genre} />
          {genres.length > 0 ? (
            <GenreFilter genres={genres} basePath="/series" currentGenre={genre} q={q} />
          ) : null}
        </section>

        {seriesResults.items.length > 0 ? (
          <CatalogGrid>
            {seriesResults.items.map((show) => (
              <SeriesCard
                key={show.id}
                id={show.id}
                title={show.title}
                slug={show.slug}
                posterUrl={show.posterUrl}
                firstAirDate={show.firstAirDate}
                genres={show.genres}
                isFavourite={favouriteSeriesIds.has(show.id)}
              />
            ))}
          </CatalogGrid>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold">No series found</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Try a different title or genre filter.
            </p>
          </div>
        )}

        <Pagination
          currentPage={seriesResults.page}
          totalPages={seriesResults.totalPages}
          basePath="/series"
          q={q}
          genre={genre}
        />
      </div>
    </main>
  );
}
