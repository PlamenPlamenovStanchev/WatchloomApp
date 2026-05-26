import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DeleteWatchlistButton } from "@/components/watchlists/DeleteWatchlistButton";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getWatchlistById } from "@/services/watchlist.service";

import { deleteWatchlistAction } from "../actions";

type WatchlistDetailPageProps = {
  params: Promise<{
    watchlistId: string;
  }>;
};

const parseWatchlistId = (value: string) => {
  const watchlistId = Number(value);

  if (!Number.isInteger(watchlistId) || watchlistId <= 0) {
    notFound();
  }

  return watchlistId;
};

const formatStatus = (status: string) => {
  return status.replaceAll("_", " ");
};

export default async function WatchlistDetailPage({ params }: WatchlistDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard/watchlists");
  }

  const { watchlistId: watchlistIdValue } = await params;
  const watchlistId = parseWatchlistId(watchlistIdValue);
  const watchlist = await getWatchlistById(user.id, watchlistId);

  if (!watchlist) {
    notFound();
  }

  const deleteAction = deleteWatchlistAction.bind(null, String(watchlist.id));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/dashboard/watchlists"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Back to watchlists
          </Link>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{watchlist.name}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {watchlist.description || "No description yet."}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/watchlists/${watchlist.id}/edit`}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:focus:ring-zinc-100"
          >
            Edit
          </Link>
          <DeleteWatchlistButton action={deleteAction} />
        </div>
      </div>

      <section aria-labelledby="watchlist-items-heading">
        <div className="flex items-center justify-between gap-4">
          <h3 id="watchlist-items-heading" className="text-xl font-semibold tracking-tight">
            Items
          </h3>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {watchlist.items.length} total
          </span>
        </div>

        {watchlist.items.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h4 className="text-base font-semibold">No items yet</h4>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Adding movies and series from the catalog is coming later.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {watchlist.items.map((item) => {
                const href =
                  item.mediaType === "movie"
                    ? `/movies/${item.media?.slug}`
                    : `/series/${item.media?.slug}`;

                return (
                  <li key={item.id} className="p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      {item.media ? (
                        <Link href={href} className="font-medium hover:underline">
                          {item.media.title}
                        </Link>
                      ) : (
                        <span className="font-medium">Unavailable title</span>
                      )}
                      <span className="text-sm capitalize text-zinc-500 dark:text-zinc-400">
                        {formatStatus(item.status)}
                      </span>
                    </div>
                    {item.notes ? (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.notes}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </section>
  );
}
