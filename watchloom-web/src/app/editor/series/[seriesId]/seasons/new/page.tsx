import Link from "next/link";
import { notFound } from "next/navigation";

import { createEditorSeasonAction } from "@/actions/editor-season.actions";
import { EditorSeasonForm } from "@/components/editor/EditorSeasonForm";
import { getEditorSeasons } from "@/services/editor-season.service";

type NewEditorSeasonPageProps = {
  params: Promise<{
    seriesId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

const parseSeriesId = (value: string) => {
  const seriesId = Number(value);

  if (!Number.isInteger(seriesId) || seriesId <= 0) {
    notFound();
  }

  return seriesId;
};

export default async function NewEditorSeasonPage({
  params,
  searchParams,
}: NewEditorSeasonPageProps) {
  const { seriesId: seriesIdValue } = await params;
  const seriesId = parseSeriesId(seriesIdValue);
  const [data, messages] = await Promise.all([
    getEditorSeasons(seriesId).catch(() => null),
    searchParams,
  ]);

  if (!data) {
    notFound();
  }

  const createAction = createEditorSeasonAction.bind(null, String(seriesId));

  return (
    <section className="space-y-5">
      <div>
        <Link
          href={`/editor/series/${seriesId}/seasons`}
          className="watchloom-back-link"
        >
          Back to seasons
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">New season</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Create a season for {data.series.title}.
        </p>
      </div>

      <EditorSeasonForm
        action={createAction}
        submitLabel="Create season"
        error={messages.error}
      />
    </section>
  );
}
