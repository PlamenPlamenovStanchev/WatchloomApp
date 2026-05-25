import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Access denied
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Forbidden</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Your account does not have permission to open that area.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Go to dashboard
        </Link>
      </section>
    </main>
  );
}
