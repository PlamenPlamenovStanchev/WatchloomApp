export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-7xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Private area
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reviews</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Your movie and series reviews will live here. Coming next: review history, rating edits,
          and public review controls.
        </p>
      </section>
    </main>
  );
}
