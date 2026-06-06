import { count, desc } from "drizzle-orm";
import Link from "next/link";

import { AdminCard } from "@/components/admin/AdminCard";
import { db } from "@/db";
import { episodes, genres, movies, reviews, seasons, series } from "@/db/schema";

const getCatalogOverview = async () => {
  const [
    [movieStats],
    [seriesStats],
    [seasonStats],
    [episodeStats],
    [genreStats],
    [reviewStats],
    recentMovies,
    recentSeries,
  ] = await Promise.all([
    db.select({ total: count() }).from(movies),
    db.select({ total: count() }).from(series),
    db.select({ total: count() }).from(seasons),
    db.select({ total: count() }).from(episodes),
    db.select({ total: count() }).from(genres),
    db.select({ total: count() }).from(reviews),
    db
      .select({
        id: movies.id,
        title: movies.title,
        releaseYear: movies.releaseYear,
        createdAt: movies.createdAt,
      })
      .from(movies)
      .orderBy(desc(movies.createdAt))
      .limit(5),
    db
      .select({
        id: series.id,
        title: series.title,
        releaseYear: series.releaseYear,
        createdAt: series.createdAt,
      })
      .from(series)
      .orderBy(desc(series.createdAt))
      .limit(5),
  ]);

  return {
    totals: {
      movies: movieStats?.total ?? 0,
      series: seriesStats?.total ?? 0,
      seasons: seasonStats?.total ?? 0,
      episodes: episodeStats?.total ?? 0,
      genres: genreStats?.total ?? 0,
      reviews: reviewStats?.total ?? 0,
    },
    recentMovies,
    recentSeries,
  };
};

const formatDate = (value: Date) => {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(value);
};

export default function AdminCatalogPage() {
  const overviewPromise = getCatalogOverview();

  return <AdminCatalogOverview overviewPromise={overviewPromise} />;
}

async function AdminCatalogOverview({
  overviewPromise,
}: {
  overviewPromise: ReturnType<typeof getCatalogOverview>;
}) {
  const overview = await overviewPromise;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Catalog</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          High-level catalog health and shortcuts into editor workflows.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Catalog totals">
        <AdminCard title="Movies" description="Total movie records" value={overview.totals.movies} />
        <AdminCard title="Series" description="Total series records" value={overview.totals.series} />
        <AdminCard title="Seasons" description="Total season records" value={overview.totals.seasons} />
        <AdminCard title="Episodes" description="Total episode records" value={overview.totals.episodes} />
        <AdminCard title="Genres" description="Total genre records" value={overview.totals.genres} />
        <AdminCard title="Reviews" description="Total user reviews" value={overview.totals.reviews} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Catalog editor links">
        <AdminCard
          href="/editor/movies"
          title="Manage Movies"
          description="Open the editor movie management tools."
          label="Go to movies"
        />
        <AdminCard
          href="/editor/series"
          title="Manage Series"
          description="Open the editor series management tools."
          label="Go to series"
        />
        <AdminCard
          href={overview.recentSeries[0] ? `/editor/series/${overview.recentSeries[0].id}/seasons` : "/editor/series"}
          title="Manage Seasons"
          description="Open seasons for a recent series, or choose a series first."
          label="Go to seasons"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="watchloom-surface rounded-3xl p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight">Recently added movies</h3>
            <Link href="/editor/movies" className="text-sm font-medium hover:underline">
              Manage
            </Link>
          </div>
          {overview.recentMovies.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              No movies yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
              {overview.recentMovies.map((movie) => (
                <li key={movie.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium">{movie.title}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {movie.releaseYear ?? "No year"} · {formatDate(movie.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/editor/movies/${movie.id}/edit`}
                    className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="watchloom-surface rounded-3xl p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight">Recently added series</h3>
            <Link href="/editor/series" className="text-sm font-medium hover:underline">
              Manage
            </Link>
          </div>
          {overview.recentSeries.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              No series yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
              {overview.recentSeries.map((show) => (
                <li key={show.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium">{show.title}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {show.releaseYear ?? "No year"} · {formatDate(show.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/editor/series/${show.id}/edit`}
                      className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/editor/series/${show.id}/seasons`}
                      className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      Seasons
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
