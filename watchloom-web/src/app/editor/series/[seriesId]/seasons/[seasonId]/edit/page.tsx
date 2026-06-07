import Link from "next/link";
import { notFound } from "next/navigation";

import { updateEditorSeasonAction } from "@/actions/editor-season.actions";
import { EditorSeasonForm } from "@/components/editor/EditorSeasonForm";
import { getEditorSeasonById, getEditorSeasons } from "@/services/editor-season.service";

type EditEditorSeasonPageProps = {
  params: Promise<{
    seriesId: string;
    seasonId: string;
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

export default async function EditEditorSeasonPage({
  params,
  searchParams,
}: EditEditorSeasonPageProps) {
  const { seriesId: seriesIdValue, seasonId: seasonIdValue } = await params;
  const seriesId = parsePositiveId(seriesIdValue);
  const seasonId = parsePositiveId(seasonIdValue);
  const [data, season, messages] = await Promise.all([
    getEditorSeasons(seriesId).catch(() => null),
    getEditorSeasonById(seriesId, seasonId),
    searchParams,
  ]);

  if (!data || !season) {
    notFound();
  }

  const updateAction = updateEditorSeasonAction.bind(null, String(seriesId), String(season.id));

  return (
    <section className="space-y-5">
      <div>
        <Link
          href={`/editor/series/${seriesId}/seasons`}
          className="watchloom-back-link"
        >
          Back to seasons
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Edit season</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Update season {season.seasonNumber} for {data.series.title}.
        </p>
      </div>

      <EditorSeasonForm
        action={updateAction}
        submitLabel="Save changes"
        defaultValues={season}
        error={messages.error}
        success={messages.success}
      />
    </section>
  );
}
