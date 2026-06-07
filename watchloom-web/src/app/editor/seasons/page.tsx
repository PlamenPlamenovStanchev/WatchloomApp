import Link from "next/link";

import { getEditorSeries } from "@/services/editor-series.service";

type EditorSeasonsPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
};

export default async function EditorSeasonsPage({ searchParams }: EditorSeasonsPageProps) {
  const params = await searchParams;
  const series = await getEditorSeries({ page: params.page, search: params.q });
  const currentPage = series.page;
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(series.totalPages, currentPage + 1);
  const querySuffix = series.search ? `&q=${encodeURIComponent(series.search)}` : "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Manage Seasons/Episodes</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Choose a series to manage its seasons and episodes.
        </p>
      </div>

      <form action="/editor/seasons" className="flex gap-2">
        <input
          name="q"
          defaultValue={series.search}
          placeholder="Search series by title"
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
        />
        <button
          type="submit"
          className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Search
        </button>
      </form>

      <section className="watchloom-surface overflow-hidden rounded-3xl">
        {series.items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No series found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {series.items.map((show) => (
                  <tr key={show.id}>
                    <td className="px-4 py-3 font-medium">{show.title}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {show.releaseYear ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {show.status || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/editor/series/${show.id}/seasons`}
                        className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                      >
                        Manage Seasons/Episodes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <nav className="flex items-center justify-between gap-4" aria-label="Series pagination">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Page {series.page} of {series.totalPages}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/editor/seasons?page=${previousPage}${querySuffix}`}
            aria-disabled={currentPage <= 1}
            className={`rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium dark:border-zinc-800 ${
              currentPage <= 1
                ? "pointer-events-none opacity-50"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Previous
          </Link>
          <Link
            href={`/editor/seasons?page=${nextPage}${querySuffix}`}
            aria-disabled={currentPage >= series.totalPages}
            className={`rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium dark:border-zinc-800 ${
              currentPage >= series.totalPages
                ? "pointer-events-none opacity-50"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Next
          </Link>
        </div>
      </nav>
    </div>
  );
}
