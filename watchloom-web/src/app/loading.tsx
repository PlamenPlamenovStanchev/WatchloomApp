export default function Loading() {
  return (
    <main className="flex min-h-[calc(100vh-129px)] items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950 dark:border-zinc-800 dark:border-t-zinc-50" />
        <h1 className="mt-5 text-lg font-semibold">Loading Watchloom</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Fetching the latest catalog data.
        </p>
      </div>
    </main>
  );
}
