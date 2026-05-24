import Link from "next/link";

export default function SeriesNotFound() {
  return (
    <main className="flex min-h-[calc(100vh-129px)] items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Series not found
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">This series page is unavailable.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          The series or season may have moved, or the URL may be invalid.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/series"
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
          >
            Browse Series
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:ring-zinc-100"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
