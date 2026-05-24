import Link from "next/link";
import { notFound } from "next/navigation";

import { getSeriesBySlug, getSeriesSeasons } from "@/services/series.service";

type SeriesDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const getYear = (firstAirDate?: string | Date | null, releaseYear?: number | string | null) => {
  if (releaseYear) {
    return String(releaseYear);
  }

  if (!firstAirDate) {
    return null;
  }

  const year =
    firstAirDate instanceof Date
      ? firstAirDate.getFullYear()
      : Number.parseInt(firstAirDate.slice(0, 4), 10);

  return Number.isNaN(year) ? null : String(year);
};

const formatTextList = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value ?? null;
};

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="border-t border-zinc-200 py-4 dark:border-zinc-800">
    <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
    <dd className="mt-1 text-sm text-zinc-950 dark:text-zinc-50">{value || "Not available"}</dd>
  </div>
);

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const { slug } = await params;
  const show = await getSeriesBySlug(slug);

  if (!show) {
    notFound();
  }

  const seasons = await getSeriesSeasons(show.id);
  const description = show.overview;
  const releaseYear = getYear(show.firstAirDate, show.releaseYear);
  const platform = show.network;
  const detailRows = [
    { label: "Release year", value: releaseYear },
    { label: "Status", value: show.status },
    { label: "Network / platform", value: platform },
    { label: "Creator", value: formatTextList(show.creator) },
    { label: "Cast", value: formatTextList(show.cast) },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <article className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(220px,320px)_1fr]">
        <aside>
          <Link
            href="/series"
            className="mb-4 inline-flex text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Back to series
          </Link>
          <div
            className="aspect-[2/3] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 bg-cover bg-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            style={show.posterUrl ? { backgroundImage: `url(${show.posterUrl})` } : undefined}
            aria-hidden="true"
          >
            {!show.posterUrl ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                No poster
              </div>
            ) : null}
          </div>
        </aside>

        <div className="space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {show.genres.map((genre) => (
                <span
                  key={genre.slug}
                  className="rounded-md bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{show.title}</h1>
              {description ? (
                <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
                  {description}
                </p>
              ) : (
                <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  No description available.
                </p>
              )}
            </div>
          </header>

          <section aria-labelledby="series-details">
            <h2 id="series-details" className="text-xl font-semibold">
              Series details
            </h2>
            <dl className="mt-4 rounded-lg border border-zinc-200 bg-white px-5 dark:border-zinc-800 dark:bg-zinc-950">
              {detailRows.map((row) => (
                <DetailRow key={row.label} label={row.label} value={row.value} />
              ))}
            </dl>
          </section>

          <section aria-labelledby="series-seasons">
            <h2 id="series-seasons" className="text-xl font-semibold">
              Seasons
            </h2>
            {seasons.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {seasons.map((season) => (
                  <Link
                    key={season.id}
                    href={`/series/${show.slug}/seasons/${season.id}`}
                    className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:ring-zinc-100"
                  >
                    <h3 className="text-base font-semibold">Season {season.seasonNumber}</h3>
                    {season.title ? (
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{season.title}</p>
                    ) : null}
                    {season.overview ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {season.overview}
                      </p>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-8 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                No seasons found.
              </p>
            )}
          </section>
        </div>
      </article>
    </main>
  );
}
