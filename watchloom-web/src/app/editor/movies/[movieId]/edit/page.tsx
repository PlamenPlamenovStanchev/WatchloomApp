import Link from "next/link";
import { notFound } from "next/navigation";

import { updateEditorMovieAction } from "@/actions/editor-movie.actions";
import { uploadMoviePoster } from "@/actions/media-upload.actions";
import { EditorMovieForm } from "@/components/editor/EditorMovieForm";
import { PosterUploadForm } from "@/components/editor/PosterUploadForm";
import { getEditorMovieById } from "@/services/editor-movie.service";
import { getGenres } from "@/services/genre.service";

type EditEditorMoviePageProps = {
  params: Promise<{
    movieId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
    posterError?: string;
    posterSuccess?: string;
  }>;
};

const parseMovieId = (value: string) => {
  const movieId = Number(value);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    notFound();
  }

  return movieId;
};

export default async function EditEditorMoviePage({
  params,
  searchParams,
}: EditEditorMoviePageProps) {
  const { movieId: movieIdValue } = await params;
  const movieId = parseMovieId(movieIdValue);
  const [movie, genres, messages] = await Promise.all([
    getEditorMovieById(movieId),
    getGenres(),
    searchParams,
  ]);

  if (!movie) {
    notFound();
  }

  const updateAction = updateEditorMovieAction.bind(null, String(movie.id));
  const posterUploadAction = uploadMoviePoster.bind(null, String(movie.id));

  return (
    <section className="space-y-5">
      <div>
        <Link
          href="/editor/movies"
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Back to movies
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Edit movie</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Update catalog metadata for {movie.title}.
        </p>
      </div>

      <PosterUploadForm
        action={posterUploadAction}
        posterUrl={movie.posterUrl}
        mediaTitle={movie.title}
        error={messages.posterError}
        success={messages.posterSuccess}
      />

      <EditorMovieForm
        action={updateAction}
        genres={genres}
        submitLabel="Save changes"
        defaultValues={movie}
        error={messages.error}
        success={messages.success}
      />
    </section>
  );
}
