import Link from "next/link";

import { toggleFavouriteForMediaAction } from "@/actions/favourite.actions";

type CatalogGenre = {
  name: string;
  slug?: string | null;
};

type SeriesCardProps = {
  id: number;
  title: string;
  slug: string;
  posterUrl?: string | null;
  firstAirDate?: string | Date | null;
  releaseYear?: number | string | null;
  status?: string | null;
  network?: string | null;
  platform?: string | null;
  genres?: CatalogGenre[];
  isFavourite?: boolean;
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

export function SeriesCard({
  id,
  title,
  slug,
  posterUrl,
  firstAirDate,
  releaseYear,
  status,
  network,
  platform,
  genres = [],
  isFavourite = false,
}: SeriesCardProps) {
  const year = getYear(firstAirDate, releaseYear);
  const releasePlatform = network ?? platform;
  const details = [year, status, releasePlatform].filter(Boolean);
  const detailHref = `/series/${slug}`;
  const favouriteAction = toggleFavouriteForMediaAction.bind(null, "series", id, "/series");
  const favouriteButtonClass = isFavourite
    ? "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100 hover:text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-950/50 dark:hover:text-red-200"
    : "border-zinc-200 text-zinc-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-300";

  return (
    <article className="watchloom-surface group animate-rise overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl dark:hover:border-orange-900/60">
      <Link
        href={detailHref}
        className="block focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:focus:ring-zinc-100"
      >
        <div
          className="relative aspect-[2/3] overflow-hidden bg-zinc-100 bg-cover bg-center transition duration-500 group-hover:scale-[1.02] dark:bg-zinc-900"
          style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent opacity-70 transition group-hover:opacity-50" />
          {year ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-zinc-900 shadow-sm backdrop-blur dark:bg-black/55 dark:text-zinc-100">
              {year}
            </span>
          ) : null}
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
            {genres.slice(0, 3).map((genre) => (
              <span
                key={genre.slug ?? genre.name}
                className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-800 dark:bg-orange-950/30 dark:text-orange-200"
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
            className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white/60 text-lg text-zinc-700 transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-300 dark:hover:border-amber-900/60 dark:hover:bg-amber-950/30 dark:hover:text-amber-300 dark:focus:ring-zinc-100"
            aria-label={`Write a review for ${title}`}
            title="Write a review"
          >
            {"\u2605"}
          </Link>
          <Link
            href={`${detailHref}#add-to-watchlist`}
            className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white/60 text-xl text-zinc-700 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-300 dark:hover:border-emerald-900/60 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300 dark:focus:ring-zinc-100"
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
