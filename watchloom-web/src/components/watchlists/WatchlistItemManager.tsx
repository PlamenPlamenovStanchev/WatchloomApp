import Link from "next/link";

import type { WatchlistItemWithMedia } from "@/services/watchlist.service";

type WatchlistItemManagerProps = {
  item: WatchlistItemWithMedia;
  updateAction: (formData: FormData) => void | Promise<void>;
  removeAction: () => void | Promise<void>;
};

const formatDateTimeLocal = (value: Date | string | null) => {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
};

export function WatchlistItemManager({
  item,
  updateAction,
  removeAction,
}: WatchlistItemManagerProps) {
  const href =
    item.media && item.mediaType === "movie"
      ? `/movies/${item.media.slug}`
      : item.media
        ? `/series/${item.media.slug}`
        : null;

  return (
    <li className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {href && item.media ? (
              <Link href={href} className="font-medium hover:underline">
                {item.media.title}
              </Link>
            ) : (
              <span className="font-medium">Unavailable title</span>
            )}
            <p className="mt-1 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              {item.mediaType}
            </p>
          </div>
          <form
            action={removeAction}
            className="sm:text-right"
          >
            <button
              type="submit"
              className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              Remove
            </button>
          </form>
        </div>

        <form action={updateAction} className="grid gap-3 lg:grid-cols-[160px_140px_220px_1fr_auto]">
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">Status</span>
            <select
              name="status"
              defaultValue={item.status}
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
              defaultValue={item.rating ?? ""}
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

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">Planned time</span>
            <input
              name="plannedWatchAt"
              type="datetime-local"
              defaultValue={formatDateTimeLocal(item.plannedWatchAt)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">Notes</span>
            <input
              name="notes"
              type="text"
              defaultValue={item.notes ?? ""}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </li>
  );
}
