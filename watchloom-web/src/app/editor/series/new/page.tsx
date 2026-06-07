import Link from "next/link";

import { createEditorSeriesAction } from "@/actions/editor-series.actions";
import { EditorSeriesForm } from "@/components/editor/EditorSeriesForm";
import { getGenres } from "@/services/genre.service";

type NewEditorSeriesPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewEditorSeriesPage({ searchParams }: NewEditorSeriesPageProps) {
  const [genres, messages] = await Promise.all([getGenres(), searchParams]);

  return (
    <section className="space-y-5">
      <div>
        <Link
          href="/editor/series"
          className="watchloom-back-link"
        >
          Back to series
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">New series</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Create a series catalog record.
        </p>
      </div>

      <EditorSeriesForm
        action={createEditorSeriesAction}
        genres={genres}
        submitLabel="Create series"
        error={messages.error}
      />
    </section>
  );
}
