export default function ContactPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Contact
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Get in touch</h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
            This contact area is reserved for future support, feedback, and catalog contribution
            workflows.
          </p>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold">Editor requests</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Requests for editor access will later be handled here, including review workflows for
            users who want to help maintain catalog content.
          </p>
        </section>
      </div>
    </main>
  );
}
