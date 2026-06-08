"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { mediaAssets, movies } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getFirstValidationMessage } from "@/lib/validations/common";
import { editorMovieSchema } from "@/lib/validations/editor-movie";
import {
  createEditorMovie,
  deleteEditorMovie,
  EditorMovieServiceError,
  updateEditorMovie,
} from "@/services/editor-movie.service";
import { StorageServiceError, uploadPosterFile } from "@/services/storage.service";

const posterFileFieldName = "posterFile";

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

const redirectWithMessages = (path: string, messages: Record<string, string>): never => {
  const params = new URLSearchParams(messages);
  redirect(`${path}?${params.toString()}`);
};

const readOptionalPosterFile = async (formData: FormData) => {
  const file = formData.get(posterFileFieldName);

  if (!(file instanceof File) || (file.name === "" && file.size === 0)) {
    return null;
  }

  return {
    buffer: Buffer.from(await file.arrayBuffer()),
    originalFilename: file.name,
    contentType: file.type,
  };
};

const parseMovieId = (value: string) => {
  const movieId = Number(value);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    notFound();
  }

  return movieId;
};

const uploadAndAttachMoviePoster = async (
  movie: Awaited<ReturnType<typeof createEditorMovie>>,
  formData: FormData,
) => {
  const file = await readOptionalPosterFile(formData);

  if (!file) {
    return null;
  }

  const uploaded = await uploadPosterFile({
    ...file,
    mediaType: "movie",
    entityId: movie.id,
    slugOrTitle: movie.slug || movie.title,
  });

  await db.transaction(async (tx) => {
    await tx
      .update(movies)
      .set({ posterUrl: uploaded.publicUrl, updatedAt: new Date() })
      .where(eq(movies.id, movie.id));
    await tx.insert(mediaAssets).values({
      mediaType: "movie",
      movieId: movie.id,
      assetType: "poster",
      url: uploaded.publicUrl,
      storageKey: uploaded.key,
      provider: "cloudflare-r2",
    });
  });

  return uploaded.publicUrl;
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
    const editPath = `/editor/movies/${movie.id}/edit`;

    try {
      await uploadAndAttachMoviePoster(movie, formData);
    } catch (error) {
      if (error instanceof StorageServiceError) {
        revalidatePath("/editor/movies");
        redirectWithMessages(editPath, {
          success: "Movie created.",
          posterError: error.message,
        });
      }

      throw error;
    }

    revalidatePath("/editor/movies");
    redirect(`${editPath}?success=${encodeURIComponent("Movie created.")}`);
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

    try {
      await uploadAndAttachMoviePoster(movie, formData);
    } catch (error) {
      if (error instanceof StorageServiceError) {
        revalidatePath("/editor/movies");
        revalidatePath(editPath);
        redirectWithMessages(editPath, {
          success: "Movie updated.",
          posterError: error.message,
        });
      }

      throw error;
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
