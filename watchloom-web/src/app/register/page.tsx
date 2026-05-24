import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Account creation will be added with the authentication flow. Public browsing is available
          now.
        </p>
        <Link
          href="/series"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Browse Series
        </Link>
      </div>
    </main>
  );
}
