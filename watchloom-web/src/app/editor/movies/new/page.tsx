import Link from "next/link";

import { createEditorMovieAction } from "@/actions/editor-movie.actions";
import { EditorMovieForm } from "@/components/editor/EditorMovieForm";
import { getGenres } from "@/services/genre.service";

type NewEditorMoviePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewEditorMoviePage({ searchParams }: NewEditorMoviePageProps) {
  const [genres, messages] = await Promise.all([getGenres(), searchParams]);

  return (
    <section className="space-y-5">
      <div>
        <Link
          href="/editor/movies"
          className="watchloom-back-link"
        >
          Back to movies
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">New movie</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Create a movie catalog record.
        </p>
      </div>

      <EditorMovieForm
        action={createEditorMovieAction}
        genres={genres}
        submitLabel="Create movie"
        error={messages.error}
      />
    </section>
  );
}
