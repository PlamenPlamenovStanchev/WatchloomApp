import Link from "next/link";
import { notFound } from "next/navigation";

import { updateEditorSeriesAction } from "@/actions/editor-series.actions";
import { uploadSeriesPoster } from "@/actions/media-upload.actions";
import { EditorSeriesForm } from "@/components/editor/EditorSeriesForm";
import { PosterUploadForm } from "@/components/editor/PosterUploadForm";
import { getEditorSeriesById } from "@/services/editor-series.service";
import { getGenres } from "@/services/genre.service";

type EditEditorSeriesPageProps = {
  params: Promise<{
    seriesId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
    posterError?: string;
    posterSuccess?: string;
  }>;
};

const parseSeriesId = (value: string) => {
  const seriesId = Number(value);

  if (!Number.isInteger(seriesId) || seriesId <= 0) {
    notFound();
  }

  return seriesId;
};

export default async function EditEditorSeriesPage({
  params,
  searchParams,
}: EditEditorSeriesPageProps) {
  const { seriesId: seriesIdValue } = await params;
  const seriesId = parseSeriesId(seriesIdValue);
  const [show, genres, messages] = await Promise.all([
    getEditorSeriesById(seriesId),
    getGenres(),
    searchParams,
  ]);

  if (!show) {
    notFound();
  }

  const updateAction = updateEditorSeriesAction.bind(null, String(show.id));
  const posterUploadAction = uploadSeriesPoster.bind(null, String(show.id));

  return (
    <section className="space-y-5">
      <div>
        <Link
          href="/editor/series"
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Back to series
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Edit series</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Update catalog metadata for {show.title}.
        </p>
      </div>

      <PosterUploadForm
        action={posterUploadAction}
        posterUrl={show.posterUrl}
        mediaTitle={show.title}
        error={messages.posterError}
        success={messages.posterSuccess}
      />

      <EditorSeriesForm
        action={updateAction}
        genres={genres}
        submitLabel="Save changes"
        defaultValues={show}
        error={messages.error}
        success={messages.success}
      />
    </section>
  );
}
