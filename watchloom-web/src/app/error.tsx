"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-[calc(100vh-129px)] items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Something went wrong
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">The page could not be loaded.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Please try again. If this keeps happening, the catalog service may be temporarily
          unavailable.
        </p>
        {error.digest ? (
          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">Error ID: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
