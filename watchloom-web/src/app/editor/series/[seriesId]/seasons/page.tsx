import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteEditorSeasonAction } from "@/actions/editor-season.actions";
import { DeleteEditorSeasonButton } from "@/components/editor/DeleteEditorSeasonButton";
import { getEditorSeasons } from "@/services/editor-season.service";

type EditorSeasonsPageProps = {
  params: Promise<{
    seriesId: string;
  }>;
};

const parseSeriesId = (value: string) => {
  const seriesId = Number(value);

  if (!Number.isInteger(seriesId) || seriesId <= 0) {
    notFound();
  }

  return seriesId;
};

export default async function EditorSeasonsPage({ params }: EditorSeasonsPageProps) {
  const { seriesId: seriesIdValue } = await params;
  const seriesId = parseSeriesId(seriesIdValue);
  const data = await getEditorSeasons(seriesId).catch(() => null);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/editor/series"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Back to series
          </Link>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Seasons for {data.series.title}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage season records. Episode CRUD will be added later.
          </p>
        </div>
        <Link
          href={`/editor/series/${seriesId}/seasons/new`}
          className="inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          New season
        </Link>
      </div>

      <section className="watchloom-surface overflow-hidden rounded-3xl">
        {data.seasons.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No seasons found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Season</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Episodes</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.seasons.map((season) => {
                  const deleteAction = deleteEditorSeasonAction.bind(
                    null,
                    String(seriesId),
                    String(season.id),
                  );

                  return (
                    <tr key={season.id}>
                      <td className="px-4 py-3 font-medium">{season.seasonNumber}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {season.title || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {season.releaseYear ?? "N/A"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {season.episodeCount}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/editor/series/${seriesId}/seasons/${season.id}/edit`}
                            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/editor/series/${seriesId}/seasons/${season.id}/episodes`}
                            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                          >
                            Manage episodes
                          </Link>
                          <DeleteEditorSeasonButton action={deleteAction} />
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
    </div>
  );
}
