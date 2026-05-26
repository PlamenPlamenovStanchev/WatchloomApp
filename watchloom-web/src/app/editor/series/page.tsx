import Link from "next/link";

import { deleteEditorSeriesAction } from "@/actions/editor-series.actions";
import { DeleteEditorSeriesButton } from "@/components/editor/DeleteEditorSeriesButton";
import { getEditorSeries } from "@/services/editor-series.service";

type EditorSeriesPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
};

export default async function EditorSeriesPage({ searchParams }: EditorSeriesPageProps) {
  const params = await searchParams;
  const series = await getEditorSeries({ page: params.page, search: params.q });
  const currentPage = series.page;
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(series.totalPages, currentPage + 1);
  const querySuffix = series.search ? `&q=${encodeURIComponent(series.search)}` : "";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Manage Series</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Search, edit, and remove series catalog records.
          </p>
        </div>
        <Link
          href="/editor/series/new"
          className="inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          New series
        </Link>
      </div>

      <form action="/editor/series" className="flex gap-2">
        <input
          name="q"
          defaultValue={series.search}
          placeholder="Search by title"
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
        />
        <button
          type="submit"
          className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Search
        </button>
      </form>

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {series.items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No series found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Network</th>
                  <th className="px-4 py-3 font-medium">Creator</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {series.items.map((show) => {
                  const deleteAction = deleteEditorSeriesAction.bind(null, String(show.id));

                  return (
                    <tr key={show.id}>
                      <td className="px-4 py-3 font-medium">{show.title}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {show.releaseYear ?? "N/A"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {show.status || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {show.network || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {show.creator || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/editor/series/${show.id}/edit`}
                            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/editor/series/${show.id}/seasons`}
                            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                          >
                            Manage seasons
                          </Link>
                          <DeleteEditorSeriesButton action={deleteAction} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            href={`/editor/series?page=${previousPage}${querySuffix}`}
            aria-disabled={currentPage <= 1}
            className={`rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium dark:border-zinc-800 ${
              currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Previous
          </Link>
          <Link
            href={`/editor/series?page=${nextPage}${querySuffix}`}
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
