import Link from "next/link";

import { toggleFavouriteForMediaAction } from "@/actions/favourite.actions";

type CatalogGenre = {
  name: string;
  slug?: string | null;
};

type MovieCardProps = {
  id: number;
  title: string;
  slug: string;
  posterUrl?: string | null;
  releaseDate?: string | Date | null;
  releaseYear?: number | string | null;
  duration?: number | string | null;
  director?: string | null;
  genres?: CatalogGenre[];
  isFavourite?: boolean;
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
  id,
  title,
  slug,
  posterUrl,
  releaseDate,
  releaseYear,
  duration,
  director,
  genres = [],
  isFavourite = false,
}: MovieCardProps) {
  const year = getYear(releaseDate, releaseYear);
  const formattedDuration = formatDuration(duration);
  const details = [year, formattedDuration, director].filter(Boolean);
  const detailHref = `/movies/${slug}`;
  const favouriteAction = toggleFavouriteForMediaAction.bind(null, "movie", id, "/movies");
  const favouriteButtonClass = isFavourite
    ? "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100 hover:text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-950/50 dark:hover:text-red-200"
    : "border-zinc-200 text-zinc-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-300";

  return (
    <article className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      <Link
        href={detailHref}
        className="block focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:focus:ring-zinc-100"
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
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <Link href={detailHref} className="hover:underline">
            <h2 className="line-clamp-2 text-base font-semibold text-zinc-950 dark:text-zinc-50">
              {title}
            </h2>
          </Link>
          {details.length > 0 ? (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {details.join(" / ")}
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
        <div className="flex items-center gap-2 pt-1" aria-label={`Actions for ${title}`}>
          <form action={favouriteAction}>
            <button
              type="submit"
              className={`inline-flex size-9 items-center justify-center rounded-full border text-lg transition focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-zinc-100 ${favouriteButtonClass}`}
              aria-label={`${isFavourite ? "Remove" : "Add"} ${title} ${isFavourite ? "from" : "to"} favourites`}
              aria-pressed={isFavourite}
              title={isFavourite ? "Remove from favourites" : "Add to favourites"}
            >
              {"\u2665"}
            </button>
          </form>
          <Link
            href={`${detailHref}#review-form`}
            className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-200 text-lg text-zinc-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-amber-900/60 dark:hover:bg-amber-950/30 dark:hover:text-amber-300 dark:focus:ring-zinc-100"
            aria-label={`Write a review for ${title}`}
            title="Write a review"
          >
            {"\u2605"}
          </Link>
          <Link
            href={`${detailHref}#add-to-watchlist`}
            className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-200 text-xl text-zinc-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-900/60 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300 dark:focus:ring-zinc-100"
            aria-label={`Add ${title} to a watchlist`}
            title="Add to watchlist"
          >
            +
          </Link>
        </div>
      </div>
    </article>
  );
}
