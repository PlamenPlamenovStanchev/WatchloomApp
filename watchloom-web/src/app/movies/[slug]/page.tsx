import Link from "next/link";
import { notFound } from "next/navigation";

import { getMovieBySlug } from "@/services/movie.service";

type MovieDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const getYear = (releaseDate?: string | Date | null, releaseYear?: number | string | null) => {
  if (releaseYear) {
    return String(releaseYear);
  }

  if (!releaseDate) {
    return null;
  }

  const year =
    releaseDate instanceof Date
      ? releaseDate.getFullYear()
      : Number.parseInt(releaseDate.slice(0, 4), 10);

  return Number.isNaN(year) ? null : String(year);
};

const formatDuration = (duration?: number | string | null) => {
  if (!duration) {
    return null;
  }

  return typeof duration === "number" ? `${duration} min` : duration;
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

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  if (!movie) {
    notFound();
  }

  const description = movie.overview;
  const releaseYear = getYear(movie.releaseDate, movie.releaseYear);
  const detailRows = [
    { label: "Release year", value: releaseYear },
    { label: "Duration", value: formatDuration(movie.durationMinutes) },
    { label: "Director", value: movie.director },
    { label: "Writer", value: formatTextList(movie.writer) },
    { label: "Cast", value: formatTextList(movie.cast) },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <article className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(220px,320px)_1fr]">
        <aside>
          <Link
            href="/movies"
            className="mb-4 inline-flex text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Back to movies
          </Link>
          <div
            className="aspect-[2/3] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 bg-cover bg-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            style={movie.posterUrl ? { backgroundImage: `url(${movie.posterUrl})` } : undefined}
            aria-hidden="true"
          >
            {!movie.posterUrl ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                No poster
              </div>
            ) : null}
          </div>
        </aside>

        <div className="space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre.slug}
                  className="rounded-md bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{movie.title}</h1>
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

          <section aria-labelledby="movie-details">
            <h2 id="movie-details" className="text-xl font-semibold">
              Movie details
            </h2>
            <dl className="mt-4 rounded-lg border border-zinc-200 bg-white px-5 dark:border-zinc-800 dark:bg-zinc-950">
              {detailRows.map((row) => (
                <DetailRow key={row.label} label={row.label} value={row.value} />
              ))}
            </dl>
          </section>
        </div>
      </article>
    </main>
  );
}
