import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserWatchlists } from "@/services/watchlist.service";

export default async function DashboardWatchlistsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard/watchlists");
  }

  const watchlists = await getUserWatchlists(user.id);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Watchlists</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage the lists you use to organize movies and series.
          </p>
        </div>
        <Link
          href="/dashboard/watchlists/new"
          className="inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
        >
          New watchlist
        </Link>
      </div>

      {watchlists.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold">No watchlists yet</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Create your first list to start organizing what to watch.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {watchlists.map((watchlist) => (
            <Link
              key={watchlist.id}
              href={`/dashboard/watchlists/${watchlist.id}`}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:ring-zinc-100"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold tracking-tight">{watchlist.name}</h3>
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  {watchlist.itemCount} items
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {watchlist.description || "No description yet."}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
