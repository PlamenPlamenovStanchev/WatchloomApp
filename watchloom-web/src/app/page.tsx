import Link from "next/link";

const featureCards = [
  {
    title: "Movies",
    description:
      "Explore seeded movie records, filter by genre, search by title, and open dedicated detail pages.",
    href: "/movies",
    action: "Browse movies",
  },
  {
    title: "Series",
    description:
      "Browse shows with real seasons and episodes, then drill into season guides from each series page.",
    href: "/series",
    action: "Browse series",
  },
];

export default function Home() {
  return (
    <main className="bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <section className="mx-auto grid min-h-[calc(100vh-129px)] w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Public catalog
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Discover what to watch next with Watchloom.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-700 dark:text-zinc-300 sm:text-lg">
              Find movies and series, explore genres, browse seasons and episodes, and get ready
              for watchlists that help registered users track favourites and plan their next watch.
            </p>
          </div>

          <form action="/movies" method="GET" className="flex max-w-xl flex-col gap-3 sm:flex-row">
            <label htmlFor="home-search" className="sr-only">
              Search movies by title
            </label>
            <input
              id="home-search"
              name="q"
              type="search"
              placeholder="Search movies by title..."
              className="h-12 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
            />
            <button
              type="submit"
              className="h-12 rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/movies"
              className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
            >
              Browse Movies
            </Link>
            <Link
              href="/series"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:ring-zinc-100"
            >
              Browse Series
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {featureCards.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:ring-zinc-100"
            >
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
              <p className="mt-5 text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {feature.action}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
