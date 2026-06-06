import Link from "next/link";

const featureCards = [
  {
    title: "Movies",
    icon: "MOV",
    description:
      "Explore seeded movie records, filter by genre, search by title, and open dedicated detail pages.",
    href: "/movies",
    action: "Browse movies",
  },
  {
    title: "Series",
    icon: "TV",
    description:
      "Browse shows with real seasons and episodes, then drill into season guides from each series page.",
    href: "/series",
    action: "Browse series",
  },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden text-zinc-950 dark:text-zinc-50">
      <div
        className="pointer-events-none absolute left-1/2 top-14 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-500/10"
        aria-hidden="true"
      />
      <section className="mx-auto grid min-h-[calc(100vh-129px)] w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8">
        <div className="animate-rise mx-auto w-full max-w-2xl space-y-8 lg:mx-0">
          <div className="space-y-5">
            <p className="watchloom-pill inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
              Public catalog
            </p>
            <h1 className="watchloom-gradient-text max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Discover what to watch next with Watchloom.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-700 dark:text-zinc-300 sm:text-lg">
              Find movies and series, explore genres, browse seasons and episodes, and get ready
              for watchlists that help registered users track favourites and plan their next watch.
            </p>
          </div>

          <form
            action="/movies"
            method="GET"
            className="watchloom-surface flex max-w-xl flex-col gap-3 rounded-2xl p-2 sm:flex-row"
          >
            <label htmlFor="home-search" className="sr-only">
              Search movies by title
            </label>
            <input
              id="home-search"
              name="q"
              type="search"
              placeholder="Search movies by title..."
              className="h-12 min-w-0 flex-1 rounded-xl border border-transparent bg-white/70 px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 dark:bg-black/40 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="watchloom-button-primary h-12 rounded-xl px-5 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-orange-500/20"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/movies"
              className="watchloom-button-primary inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-orange-500/20"
            >
              Browse Movies
            </Link>
            <Link
              href="/series"
              className="inline-flex h-11 items-center justify-center rounded-full border border-orange-200/70 bg-white/50 px-5 text-sm font-medium text-zinc-900 transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-500/15 dark:border-orange-900/50 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:bg-orange-950/20"
            >
              Browse Series
            </Link>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-2xl gap-4 sm:grid-cols-2 lg:max-w-none">
          {featureCards.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="watchloom-surface group flex min-h-72 flex-col rounded-3xl p-6 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/15"
            >
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-xs font-semibold tracking-wide text-white shadow-lg shadow-orange-900/10 transition group-hover:rotate-3 group-hover:scale-105 dark:bg-zinc-50 dark:text-zinc-950">
                {feature.icon}
              </div>
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
              <p className="mt-auto pt-5 text-sm font-semibold text-orange-700 transition group-hover:translate-x-1 dark:text-orange-300">
                {feature.action}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
