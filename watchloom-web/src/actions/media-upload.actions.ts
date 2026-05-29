"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { mediaAssets, movies, series } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { StorageServiceError, uploadPosterFile } from "@/services/storage.service";

const posterFileFieldName = "posterFile";

const requireEditor = async (nextPath: string) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (user.role !== "editor" && user.role !== "admin") {
    redirect("/forbidden");
  }

  return user;
};

const parsePositiveId = (value: string) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  return id;
};

const redirectWithMessage = (path: string, key: "posterError" | "posterSuccess", message: string): never => {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
};

const readPosterFile = async (formData: FormData) => {
  const file = formData.get(posterFileFieldName);

  if (!(file instanceof File)) {
    throw new StorageServiceError("Choose a poster image before uploading.", "EMPTY_FILE");
  }

  return {
    buffer: Buffer.from(await file.arrayBuffer()),
    originalFilename: file.name,
    contentType: file.type,
  };
};

export async function uploadMoviePoster(movieIdValue: string, formData: FormData) {
  const movieId = parsePositiveId(movieIdValue);
  const editPath = `/editor/movies/${movieId}/edit`;
  await requireEditor(editPath);

  const [movie] = await db.select().from(movies).where(eq(movies.id, movieId)).limit(1);

  if (!movie) {
    notFound();
  }

  let successMessage = "Poster uploaded.";

  try {
    const file = await readPosterFile(formData);
    const uploaded = await uploadPosterFile({
      ...file,
      mediaType: "movie",
      entityId: movie.id,
      slugOrTitle: movie.slug || movie.title,
    });

    await db.transaction(async (tx) => {
      await tx.update(movies).set({ posterUrl: uploaded.publicUrl, updatedAt: new Date() }).where(eq(movies.id, movie.id));
      await tx.insert(mediaAssets).values({
        mediaType: "movie",
        movieId: movie.id,
        assetType: "poster",
        url: uploaded.publicUrl,
        storageKey: uploaded.key,
        provider: "cloudflare-r2",
      });
    });

    revalidatePath("/editor/movies");
    revalidatePath(editPath);
    revalidatePath(`/movies/${movie.slug}`);
  } catch (error) {
    if (error instanceof StorageServiceError) {
      redirectWithMessage(editPath, "posterError", error.message);
    }

    successMessage = "";
    redirectWithMessage(editPath, "posterError", "Poster upload failed.");
  }

  redirectWithMessage(editPath, "posterSuccess", successMessage);
}

export async function uploadSeriesPoster(seriesIdValue: string, formData: FormData) {
  const seriesId = parsePositiveId(seriesIdValue);
  const editPath = `/editor/series/${seriesId}/edit`;
  await requireEditor(editPath);

  const [show] = await db.select().from(series).where(eq(series.id, seriesId)).limit(1);

  if (!show) {
    notFound();
  }

  let successMessage = "Poster uploaded.";

  try {
    const file = await readPosterFile(formData);
    const uploaded = await uploadPosterFile({
      ...file,
      mediaType: "series",
      entityId: show.id,
      slugOrTitle: show.slug || show.title,
    });

    await db.transaction(async (tx) => {
      await tx.update(series).set({ posterUrl: uploaded.publicUrl, updatedAt: new Date() }).where(eq(series.id, show.id));
      await tx.insert(mediaAssets).values({
        mediaType: "series",
        seriesId: show.id,
        assetType: "poster",
        url: uploaded.publicUrl,
        storageKey: uploaded.key,
        provider: "cloudflare-r2",
      });
    });

    revalidatePath("/editor/series");
    revalidatePath(editPath);
    revalidatePath(`/series/${show.slug}`);
  } catch (error) {
    if (error instanceof StorageServiceError) {
      redirectWithMessage(editPath, "posterError", error.message);
    }

    successMessage = "";
    redirectWithMessage(editPath, "posterError", "Poster upload failed.");
  }

  redirectWithMessage(editPath, "posterSuccess", successMessage);
}
