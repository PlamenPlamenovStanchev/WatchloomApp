import Link from "next/link";

import { deleteEditorMovieAction } from "@/actions/editor-movie.actions";
import { DeleteEditorMovieButton } from "@/components/editor/DeleteEditorMovieButton";
import { getEditorMovies } from "@/services/editor-movie.service";

type EditorMoviesPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
};

export default async function EditorMoviesPage({ searchParams }: EditorMoviesPageProps) {
  const params = await searchParams;
  const movies = await getEditorMovies({ page: params.page, search: params.q });
  const currentPage = movies.page;
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(movies.totalPages, currentPage + 1);
  const querySuffix = movies.search ? `&q=${encodeURIComponent(movies.search)}` : "";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Manage Movies</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Search, edit, and remove movie catalog records.
          </p>
        </div>
        <Link
          href="/editor/movies/new"
          className="inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          New movie
        </Link>
      </div>

      <form action="/editor/movies" className="flex gap-2">
        <input
          name="q"
          defaultValue={movies.search}
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
        {movies.items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No movies found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Director</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {movies.items.map((movie) => {
                  const deleteAction = deleteEditorMovieAction.bind(null, String(movie.id));

                  return (
                    <tr key={movie.id}>
                      <td className="px-4 py-3 font-medium">{movie.title}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {movie.releaseYear ?? "N/A"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {movie.director || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {movie.durationMinutes ? `${movie.durationMinutes} min` : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/editor/movies/${movie.id}/edit`}
                            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                          >
                            Edit
                          </Link>
                          <DeleteEditorMovieButton action={deleteAction} />
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

      <nav className="flex items-center justify-between gap-4" aria-label="Movie pagination">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Page {movies.page} of {movies.totalPages}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/editor/movies?page=${previousPage}${querySuffix}`}
            aria-disabled={currentPage <= 1}
            className={`rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium dark:border-zinc-800 ${
              currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Previous
          </Link>
          <Link
            href={`/editor/movies?page=${nextPage}${querySuffix}`}
            aria-disabled={currentPage >= movies.totalPages}
            className={`rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium dark:border-zinc-800 ${
              currentPage >= movies.totalPages
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
