import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addFavouriteAction,
  removeFavouriteForMediaAction,
} from "@/actions/favourite.actions";
import { deleteMovieFromDetailAction } from "@/actions/editor-movie.actions";
import { createReviewAction, updateReviewAction } from "@/actions/review.actions";
import { addMovieToWatchlist } from "@/app/watchlist-actions";
import { DeleteEditorMovieButton } from "@/components/editor/DeleteEditorMovieButton";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";
import { AddToWatchlistForm } from "@/components/watchlists/AddToWatchlistForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserFavouriteForMedia } from "@/services/favourite.service";
import { getMovieBySlug } from "@/services/movie.service";
import { getPublicReviewsForMedia, getUserReviewForMedia } from "@/services/review.service";
import { getUserWatchlists } from "@/services/watchlist.service";

type MovieDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    watchlistError?: string;
    watchlistSuccess?: string;
    favouriteError?: string;
    favouriteSuccess?: string;
    reviewError?: string;
    reviewSuccess?: string;
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

export default async function MovieDetailPage({ params, searchParams }: MovieDetailPageProps) {
  const { slug } = await params;
  const [movie, user] = await Promise.all([getMovieBySlug(slug), getCurrentUser()]);

  if (!movie) {
    notFound();
  }

  const [watchlists, favourite, publicReviews, userReview, messages] = await Promise.all([
    user ? getUserWatchlists(user.id) : [],
    user ? getUserFavouriteForMedia(user.id, "movie", movie.id) : null,
    getPublicReviewsForMedia("movie", movie.id),
    user ? getUserReviewForMedia(user.id, "movie", movie.id) : null,
    searchParams,
  ]);
  const addAction = addMovieToWatchlist.bind(null, movie.id, `/movies/${movie.slug}`);
  const addFavourite = addFavouriteAction.bind(null, "movie", movie.id, `/movies/${movie.slug}`);
  const removeFavourite = removeFavouriteForMediaAction.bind(
    null,
    "movie",
    movie.id,
    `/movies/${movie.slug}`,
  );
  const reviewAction = userReview
    ? updateReviewAction.bind(null, userReview.id, `/movies/${movie.slug}`)
    : createReviewAction.bind(null, "movie", movie.id, `/movies/${movie.slug}`);
  const canManageCatalog = user?.role === "editor" || user?.role === "admin";
  const deleteMovieAction = deleteMovieFromDetailAction.bind(null, String(movie.id), movie.slug);
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
            className="watchloom-back-link mb-4"
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{movie.title}</h1>
                {canManageCatalog ? (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/editor/movies/${movie.id}/edit`}
                      className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:focus:ring-zinc-100"
                    >
                      Edit
                    </Link>
                    <DeleteEditorMovieButton action={deleteMovieAction} />
                  </div>
                ) : null}
              </div>
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

          {user ? (
            <>
              <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-xl font-semibold">Favourites</h2>
                {messages.favouriteError ? <p className="mt-3 text-sm text-red-600">{messages.favouriteError}</p> : null}
                {messages.favouriteSuccess ? <p className="mt-3 text-sm text-emerald-600">{messages.favouriteSuccess}</p> : null}
                <form action={favourite ? removeFavourite : addFavourite} className="mt-4">
                  <button type="submit" className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200">
                    {favourite ? "Remove from Favourites" : "Add to Favourites"}
                  </button>
                </form>
              </section>
              <AddToWatchlistForm
                action={addAction}
                watchlists={watchlists}
                error={messages.watchlistError}
                success={messages.watchlistSuccess}
              />
              <ReviewForm
                action={reviewAction}
                submitLabel={userReview ? "Update review" : "Create review"}
                defaultValues={userReview ?? undefined}
                error={messages.reviewError}
                success={messages.reviewSuccess}
              />
            </>
          ) : (
            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Log in to add this title to your watchlist</p>
              <Link
                href={`/login?next=${encodeURIComponent(`/movies/${movie.slug}`)}`}
                className="mt-3 inline-flex text-sm font-medium text-zinc-950 hover:underline dark:text-zinc-50"
              >
                Log in
              </Link>
            </section>
          )}
          <ReviewList reviews={publicReviews} />
        </div>
      </article>
    </main>
  );
}
