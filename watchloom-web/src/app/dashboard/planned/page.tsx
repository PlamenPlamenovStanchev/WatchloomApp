import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getPlannedWatchItems } from "@/services/watchlist.service";

const formatDateTime = (value: Date | string | null) => {
  if (!value) {
    return "Not planned";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value instanceof Date ? value : new Date(value));
};

const formatStatus = (status: string) => status.replaceAll("_", " ");

export default async function PlannedWatchingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard/planned");
  }

  const items = await getPlannedWatchItems(user.id);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Planned Watching</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Upcoming movies and series from your watchlists, sorted by planned time.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold">No planned watching yet</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Add a planned time to a watchlist item to see it here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.map((item) => {
              const href =
                item.media && item.mediaType === "movie"
                  ? `/movies/${item.media.slug}`
                  : item.media
                    ? `/series/${item.media.slug}`
                    : null;

              return (
                <li key={item.id} className="p-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_120px_140px_190px] md:items-center">
                    <div>
                      {href && item.media ? (
                        <Link href={href} className="font-medium hover:underline">
                          {item.media.title}
                        </Link>
                      ) : (
                        <span className="font-medium">Unavailable title</span>
                      )}
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        From {item.watchlist.name}
                      </p>
                    </div>
                    <span className="text-sm capitalize text-zinc-600 dark:text-zinc-300">
                      {item.mediaType}
                    </span>
                    <span className="text-sm capitalize text-zinc-600 dark:text-zinc-300">
                      {formatStatus(item.status)}
                    </span>
                    <time className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                      {formatDateTime(item.plannedWatchAt)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
