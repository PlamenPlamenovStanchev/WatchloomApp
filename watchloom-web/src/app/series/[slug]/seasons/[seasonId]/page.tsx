import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getSeasonEpisodes,
  getSeriesBySlug,
  getSeriesSeasons,
} from "@/services/series.service";

type SeasonDetailPageProps = {
  params: Promise<{
    slug: string;
    seasonId: string;
  }>;
};

type OptionalEpisodeMetadata = {
  duration?: number | string | null;
  durationMinutes?: number | string | null;
};

const formatDuration = (duration?: number | string | null) => {
  if (!duration) {
    return null;
  }

  return typeof duration === "number" ? `${duration} min` : duration;
};

export default async function SeasonDetailPage({ params }: SeasonDetailPageProps) {
  const { slug, seasonId } = await params;
  const parsedSeasonId = Number.parseInt(seasonId, 10);

  if (!Number.isInteger(parsedSeasonId) || parsedSeasonId <= 0) {
    notFound();
  }

  const show = await getSeriesBySlug(slug);

  if (!show) {
    notFound();
  }

  const seasons = await getSeriesSeasons(show.id);
  const season = seasons.find((item) => item.id === parsedSeasonId);

  if (!season) {
    notFound();
  }

  const episodes = await getSeasonEpisodes(season.id);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="space-y-4">
          <Link
            href={`/series/${show.slug}`}
            className="inline-flex text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Back to {show.title}
          </Link>
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {show.title}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              Season {season.seasonNumber}
            </h1>
            {season.title ? (
              <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">{season.title}</p>
            ) : null}
            {season.overview ? (
              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
                {season.overview}
              </p>
            ) : null}
          </div>
        </header>

        <section aria-labelledby="season-episodes">
          <h2 id="season-episodes" className="text-xl font-semibold">
            Episodes
          </h2>
          {episodes.length > 0 ? (
            <ol className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
              {episodes.map((episode) => {
                const metadata = episode as typeof episode & OptionalEpisodeMetadata;
                const duration = formatDuration(metadata.duration ?? metadata.durationMinutes);

                return (
                  <li key={episode.id} className="p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                          Episode {episode.episodeNumber}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">{episode.title}</h3>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {duration || "Duration not available"}
                      </p>
                    </div>
                    {episode.overview ? (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                        {episode.overview}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                        No episode description available.
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-8 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              No episodes found.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
