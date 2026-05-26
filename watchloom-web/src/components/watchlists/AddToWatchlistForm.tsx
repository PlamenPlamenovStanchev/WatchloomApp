import Link from "next/link";

import type { WatchlistSummary } from "@/services/watchlist.service";

type AddToWatchlistFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  watchlists: WatchlistSummary[];
  error?: string;
  success?: string;
};

export function AddToWatchlistForm({
  action,
  watchlists,
  error,
  success,
}: AddToWatchlistFormProps) {
  return (
    <section
      aria-labelledby="add-to-watchlist-heading"
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h2 id="add-to-watchlist-heading" className="text-xl font-semibold">
        Add to Watchlist
      </h2>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </p>
      ) : null}

      {watchlists.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-zinc-300 px-4 py-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p>No watchlists yet.</p>
          <Link
            href="/dashboard/watchlists/new"
            className="mt-3 inline-flex font-medium text-zinc-950 hover:underline dark:text-zinc-50"
          >
            Create a watchlist
          </Link>
        </div>
      ) : (
        <form action={action} className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">Watchlist</span>
            <select
              name="watchlistId"
              required
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
            >
              {watchlists.map((watchlist) => (
                <option key={watchlist.id} value={watchlist.id}>
                  {watchlist.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">Status</span>
              <select
                name="status"
                defaultValue="to_watch"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
              >
                <option value="to_watch">To watch</option>
                <option value="watching">Watching</option>
                <option value="watched">Watched</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">Rating</span>
              <select
                name="rating"
                defaultValue=""
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
              >
                <option value="">None</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">Planned time</span>
            <input
              name="plannedWatchAt"
              type="datetime-local"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">Notes</span>
            <textarea
              name="notes"
              rows={3}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
            />
          </label>

          <button
            type="submit"
            className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Add to Watchlist
          </button>
        </form>
      )}
    </section>
  );
}
