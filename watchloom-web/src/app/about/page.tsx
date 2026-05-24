export default function AboutPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            About
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">What is Watchloom?</h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
            Watchloom is a full-stack movie and TV catalog for discovering titles, browsing
            seasons and episodes, and keeping entertainment choices organized across web and
            mobile clients.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold">Anonymous browsing</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Visitors can browse the public movies and series catalogs, search by title, filter by
              genre, and inspect series seasons and episode lists.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold">Registered features</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Registered users will be able to manage watchlists, save favourites, write reviews,
              and track what they want to watch next.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold">Our Dedication</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            We are deeply committed to elevating quality cinema and television. We believe that great storytelling deserves a platform that respects the art of filmmaking, helping you discover meaningful, thought-provoking, and entertaining content from around the world.
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Alongside our content, we prioritize an immersive, seamless user experience. Whether you are searching for your next favorite show or organizing your watchlist, our goal is to provide a clean, distraction-free environment that lets the movies and series take center stage.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold">Built for web and mobile</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            The project is a Node.js monorepo with a Next.js web app, an Expo React Native mobile
            app, and shared TypeScript types and helpers for consistent catalog experiences.
          </p>
        </section>
      </div>
    </main>
  );
}
