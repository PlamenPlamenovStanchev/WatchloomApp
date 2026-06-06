import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteEditorEpisodeAction } from "@/actions/editor-episode.actions";
import { DeleteEditorEpisodeButton } from "@/components/editor/DeleteEditorEpisodeButton";
import { getEditorEpisodes } from "@/services/editor-episode.service";

type EditorEpisodesPageProps = {
  params: Promise<{
    seriesId: string;
    seasonId: string;
  }>;
};

const parsePositiveId = (value: string) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  return id;
};

const formatDate = (value: string | Date | null) => {
  if (!value) {
    return "N/A";
  }

  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
};

export default async function EditorEpisodesPage({ params }: EditorEpisodesPageProps) {
  const { seriesId: seriesIdValue, seasonId: seasonIdValue } = await params;
  const seriesId = parsePositiveId(seriesIdValue);
  const seasonId = parsePositiveId(seasonIdValue);
  const data = await getEditorEpisodes(seriesId, seasonId).catch(() => null);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/editor/series/${seriesId}/seasons`}
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Back to seasons
          </Link>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Episodes for {data.series.title}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Season {data.season.seasonNumber}
          </p>
        </div>
        <Link
          href={`/editor/series/${seriesId}/seasons/${seasonId}/episodes/new`}
          className="inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          New episode
        </Link>
      </div>

      <section className="watchloom-surface overflow-hidden rounded-3xl">
        {data.episodes.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No episodes found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Episode</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Air date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.episodes.map((episode) => {
                  const deleteAction = deleteEditorEpisodeAction.bind(
                    null,
                    String(seriesId),
                    String(seasonId),
                    String(episode.id),
                  );

                  return (
                    <tr key={episode.id}>
                      <td className="px-4 py-3 font-medium">{episode.episodeNumber}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {episode.title}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {episode.durationMinutes ? `${episode.durationMinutes} min` : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatDate(episode.airDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/editor/series/${seriesId}/seasons/${seasonId}/episodes/${episode.id}/edit`}
                            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                          >
                            Edit
                          </Link>
                          <DeleteEditorEpisodeButton action={deleteAction} />
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
