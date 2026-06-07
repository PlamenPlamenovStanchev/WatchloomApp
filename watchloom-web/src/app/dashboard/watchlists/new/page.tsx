import Link from "next/link";

import { WatchlistForm } from "@/components/watchlists/WatchlistForm";

import { createWatchlistAction } from "../actions";

type NewWatchlistPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewWatchlistPage({ searchParams }: NewWatchlistPageProps) {
  const { error } = await searchParams;

  return (
    <section className="space-y-5">
      <div>
        <Link
          href="/dashboard/watchlists"
          className="watchloom-back-link"
        >
          Back to watchlists
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">New watchlist</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Create a simple list now. Adding catalog items comes later.
        </p>
      </div>

      <WatchlistForm action={createWatchlistAction} submitLabel="Create watchlist" error={error} />
    </section>
  );
}
