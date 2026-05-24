import Link from "next/link";

type CatalogGenre = {
  name: string;
  slug?: string | null;
};

type MovieCardProps = {
  title: string;
  slug: string;
  posterUrl?: string | null;
  releaseDate?: string | Date | null;
  releaseYear?: number | string | null;
  duration?: number | string | null;
  director?: string | null;
  genres?: CatalogGenre[];
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

export function MovieCard({
  title,
  slug,
  posterUrl,
  releaseDate,
  releaseYear,
  duration,
  director,
  genres = [],
}: MovieCardProps) {
  const year = getYear(releaseDate, releaseYear);
  const formattedDuration = formatDuration(duration);
  const details = [year, formattedDuration, director].filter(Boolean);

  return (
    <Link
      href={`/movies/${slug}`}
      className="group block overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:ring-zinc-100"
    >
      <div
        className="aspect-[2/3] bg-zinc-100 bg-cover bg-center dark:bg-zinc-900"
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
        aria-hidden="true"
      >
        {!posterUrl ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No poster
          </div>
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h2 className="line-clamp-2 text-base font-semibold text-zinc-950 dark:text-zinc-50">
            {title}
          </h2>
          {details.length > 0 ? (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {details.join(" • ")}
            </p>
          ) : null}
        </div>
        {genres.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {genres.map((genre) => (
              <span
                key={genre.slug ?? genre.name}
                className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {genre.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
