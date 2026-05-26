import Link from "next/link";
import { notFound } from "next/navigation";

import { updateEditorEpisodeAction } from "@/actions/editor-episode.actions";
import { EditorEpisodeForm } from "@/components/editor/EditorEpisodeForm";
import {
  getEditorEpisodeById,
  getEditorEpisodes,
} from "@/services/editor-episode.service";

type EditEditorEpisodePageProps = {
  params: Promise<{
    seriesId: string;
    seasonId: string;
    episodeId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const parsePositiveId = (value: string) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  return id;
};

export default async function EditEditorEpisodePage({
  params,
  searchParams,
}: EditEditorEpisodePageProps) {
  const { seriesId: seriesIdValue, seasonId: seasonIdValue, episodeId: episodeIdValue } =
    await params;
  const seriesId = parsePositiveId(seriesIdValue);
  const seasonId = parsePositiveId(seasonIdValue);
  const episodeId = parsePositiveId(episodeIdValue);
  const [data, episode, messages] = await Promise.all([
    getEditorEpisodes(seriesId, seasonId).catch(() => null),
    getEditorEpisodeById(seriesId, seasonId, episodeId),
    searchParams,
  ]);

  if (!data || !episode) {
    notFound();
  }

  const updateAction = updateEditorEpisodeAction.bind(
    null,
    String(seriesId),
    String(seasonId),
    String(episode.id),
  );

  return (
    <section className="space-y-5">
      <div>
        <Link
          href={`/editor/series/${seriesId}/seasons/${seasonId}/episodes`}
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Back to episodes
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Edit episode</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Update episode {episode.episodeNumber} for {data.series.title}, season{" "}
          {data.season.seasonNumber}.
        </p>
      </div>

      <EditorEpisodeForm
        action={updateAction}
        submitLabel="Save changes"
        defaultValues={episode}
        error={messages.error}
        success={messages.success}
      />
    </section>
  );
}
