import Link from "next/link";
import { notFound } from "next/navigation";

import { createEditorEpisodeAction } from "@/actions/editor-episode.actions";
import { EditorEpisodeForm } from "@/components/editor/EditorEpisodeForm";
import { getEditorEpisodes } from "@/services/editor-episode.service";

type NewEditorEpisodePageProps = {
  params: Promise<{
    seriesId: string;
    seasonId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

const parsePositiveId = (value: string) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  return id;
};

export default async function NewEditorEpisodePage({
  params,
  searchParams,
}: NewEditorEpisodePageProps) {
  const { seriesId: seriesIdValue, seasonId: seasonIdValue } = await params;
  const seriesId = parsePositiveId(seriesIdValue);
  const seasonId = parsePositiveId(seasonIdValue);
  const [data, messages] = await Promise.all([
    getEditorEpisodes(seriesId, seasonId).catch(() => null),
    searchParams,
  ]);

  if (!data) {
    notFound();
  }

  const createAction = createEditorEpisodeAction.bind(null, String(seriesId), String(seasonId));

  return (
    <section className="space-y-5">
      <div>
        <Link
          href={`/editor/series/${seriesId}/seasons/${seasonId}/episodes`}
          className="watchloom-back-link"
        >
          Back to episodes
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">New episode</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Create an episode for {data.series.title}, season {data.season.seasonNumber}.
        </p>
      </div>

      <EditorEpisodeForm
        action={createAction}
        submitLabel="Create episode"
        error={messages.error}
      />
    </section>
  );
}
