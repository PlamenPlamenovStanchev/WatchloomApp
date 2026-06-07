"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getFirstValidationMessage } from "@/lib/validations/common";
import { editorMovieSchema } from "@/lib/validations/editor-movie";
import {
  createEditorMovie,
  deleteEditorMovie,
  EditorMovieServiceError,
  updateEditorMovie,
} from "@/services/editor-movie.service";

const requireEditor = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/editor/movies");
  }

  if (user.role !== "editor" && user.role !== "admin") {
    redirect("/forbidden");
  }

  return user;
};

const requireEditorForPath = async (nextPath: string) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (user.role !== "editor" && user.role !== "admin") {
    redirect("/forbidden");
  }

  return user;
};

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
};

const parseMovieFormData = (formData: FormData) => {
  return editorMovieSchema.safeParse({
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    overview: getString(formData, "overview"),
    releaseYear: getString(formData, "releaseYear"),
    durationMinutes: getString(formData, "durationMinutes"),
    director: getString(formData, "director"),
    writer: getString(formData, "writer"),
    cast: getString(formData, "cast"),
    posterUrl: getString(formData, "posterUrl"),
    backdropUrl: getString(formData, "backdropUrl"),
    genreIds: formData.getAll("genreIds"),
  });
};

const redirectWithError = (path: string, message: string): never => {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
};

const parseMovieId = (value: string) => {
  const movieId = Number(value);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    notFound();
  }

  return movieId;
};

export async function createEditorMovieAction(formData: FormData) {
  await requireEditor();

  const parsed = parseMovieFormData(formData);

  if (!parsed.success) {
    redirectWithError("/editor/movies/new", getFirstValidationMessage(parsed.error));
  }

  const input = parsed.data!;

  try {
    const movie = await createEditorMovie(input);

    revalidatePath("/editor/movies");
    redirect(`/editor/movies/${movie.id}/edit?success=${encodeURIComponent("Movie created.")}`);
  } catch (error) {
    if (error instanceof EditorMovieServiceError) {
      redirectWithError("/editor/movies/new", error.message);
    }

    throw error;
  }
}

export async function updateEditorMovieAction(movieIdValue: string, formData: FormData) {
  await requireEditor();

  const movieId = parseMovieId(movieIdValue);
  const editPath = `/editor/movies/${movieId}/edit`;
  const parsed = parseMovieFormData(formData);

  if (!parsed.success) {
    redirectWithError(editPath, getFirstValidationMessage(parsed.error));
  }

  const input = parsed.data!;

  try {
    const movie = await updateEditorMovie(movieId, input);

    if (!movie) {
      notFound();
    }

    revalidatePath("/editor/movies");
    revalidatePath(editPath);
    redirect(`${editPath}?success=${encodeURIComponent("Movie updated.")}`);
  } catch (error) {
    if (error instanceof EditorMovieServiceError) {
      redirectWithError(editPath, error.message);
    }

    throw error;
  }
}

export async function deleteEditorMovieAction(movieIdValue: string) {
  await requireEditor();

  const movieId = parseMovieId(movieIdValue);
  const deleted = await deleteEditorMovie(movieId);

  if (!deleted) {
    notFound();
  }

  revalidatePath("/editor/movies");
  redirect("/editor/movies");
}

export async function deleteMovieFromDetailAction(movieIdValue: string, slug: string) {
  await requireEditorForPath(`/movies/${slug}`);

  const movieId = parseMovieId(movieIdValue);
  const deleted = await deleteEditorMovie(movieId);

  if (!deleted) {
    notFound();
  }

  revalidatePath("/movies");
  revalidatePath(`/movies/${slug}`);
  revalidatePath("/editor/movies");
  redirect("/movies");
}
