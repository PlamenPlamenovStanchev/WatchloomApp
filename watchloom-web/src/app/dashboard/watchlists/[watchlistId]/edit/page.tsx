import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { WatchlistForm } from "@/components/watchlists/WatchlistForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getWatchlistById } from "@/services/watchlist.service";

import { updateWatchlistAction } from "../../actions";

type EditWatchlistPageProps = {
  params: Promise<{
    watchlistId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

const parseWatchlistId = (value: string) => {
  const watchlistId = Number(value);

  if (!Number.isInteger(watchlistId) || watchlistId <= 0) {
    notFound();
  }

  return watchlistId;
};

export default async function EditWatchlistPage({
  params,
  searchParams,
}: EditWatchlistPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard/watchlists");
  }

  const { watchlistId: watchlistIdValue } = await params;
  const { error } = await searchParams;
  const watchlistId = parseWatchlistId(watchlistIdValue);
  const watchlist = await getWatchlistById(user.id, watchlistId);

  if (!watchlist) {
    notFound();
  }

  const updateAction = updateWatchlistAction.bind(null, String(watchlist.id));

  return (
    <section className="space-y-5">
      <div>
        <Link
          href={`/dashboard/watchlists/${watchlist.id}`}
          className="watchloom-back-link"
        >
          Back to watchlist
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Edit watchlist</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Update the name and description for this list.
        </p>
      </div>

      <WatchlistForm
        action={updateAction}
        submitLabel="Save changes"
        defaultValues={watchlist}
        error={error}
      />
    </section>
  );
}
