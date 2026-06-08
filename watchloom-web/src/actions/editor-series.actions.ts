"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { mediaAssets, series } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getFirstValidationMessage } from "@/lib/validations/common";
import { editorSeriesSchema } from "@/lib/validations/editor-series";
import {
  createEditorSeries,
  deleteEditorSeries,
  EditorSeriesServiceError,
  updateEditorSeries,
} from "@/services/editor-series.service";
import { StorageServiceError, uploadPosterFile } from "@/services/storage.service";

const posterFileFieldName = "posterFile";

const requireEditor = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/editor/series");
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

const parseSeriesFormData = (formData: FormData) => {
  return editorSeriesSchema.safeParse({
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    overview: getString(formData, "overview"),
    releaseYear: getString(formData, "releaseYear"),
    status: getString(formData, "status"),
    network: getString(formData, "network"),
    creator: getString(formData, "creator"),
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

const parseSeriesId = (value: string) => {
  const seriesId = Number(value);

  if (!Number.isInteger(seriesId) || seriesId <= 0) {
    notFound();
  }

  return seriesId;
};

const uploadAndAttachSeriesPoster = async (
  show: Awaited<ReturnType<typeof createEditorSeries>>,
  formData: FormData,
) => {
  const file = await readOptionalPosterFile(formData);

  if (!file) {
    return null;
  }

  const uploaded = await uploadPosterFile({
    ...file,
    mediaType: "series",
    entityId: show.id,
    slugOrTitle: show.slug || show.title,
  });

  await db.transaction(async (tx) => {
    await tx
      .update(series)
      .set({ posterUrl: uploaded.publicUrl, updatedAt: new Date() })
      .where(eq(series.id, show.id));
    await tx.insert(mediaAssets).values({
      mediaType: "series",
      seriesId: show.id,
      assetType: "poster",
      url: uploaded.publicUrl,
      storageKey: uploaded.key,
      provider: "cloudflare-r2",
    });
  });

  return uploaded.publicUrl;
};

export async function createEditorSeriesAction(formData: FormData) {
  await requireEditor();

  const parsed = parseSeriesFormData(formData);

  if (!parsed.success) {
    redirectWithError("/editor/series/new", getFirstValidationMessage(parsed.error));
  }

  const input = parsed.data!;

  try {
    const show = await createEditorSeries(input);
    const editPath = `/editor/series/${show.id}/edit`;

    try {
      await uploadAndAttachSeriesPoster(show, formData);
    } catch (error) {
      if (error instanceof StorageServiceError) {
        revalidatePath("/editor/series");
        redirectWithMessages(editPath, {
          success: "Series created.",
          posterError: error.message,
        });
      }

      throw error;
    }

    revalidatePath("/editor/series");
    redirect(`${editPath}?success=${encodeURIComponent("Series created.")}`);
  } catch (error) {
    if (error instanceof EditorSeriesServiceError) {
      redirectWithError("/editor/series/new", error.message);
    }

    throw error;
  }
}

export async function updateEditorSeriesAction(seriesIdValue: string, formData: FormData) {
  await requireEditor();

  const seriesId = parseSeriesId(seriesIdValue);
  const editPath = `/editor/series/${seriesId}/edit`;
  const parsed = parseSeriesFormData(formData);

  if (!parsed.success) {
    redirectWithError(editPath, getFirstValidationMessage(parsed.error));
  }

  const input = parsed.data!;

  try {
    const show = await updateEditorSeries(seriesId, input);

    if (!show) {
      notFound();
    }

    try {
      await uploadAndAttachSeriesPoster(show, formData);
    } catch (error) {
      if (error instanceof StorageServiceError) {
        revalidatePath("/editor/series");
        revalidatePath(editPath);
        redirectWithMessages(editPath, {
          success: "Series updated.",
          posterError: error.message,
        });
      }

      throw error;
    }

    revalidatePath("/editor/series");
    revalidatePath(editPath);
    redirect(`${editPath}?success=${encodeURIComponent("Series updated.")}`);
  } catch (error) {
    if (error instanceof EditorSeriesServiceError) {
      redirectWithError(editPath, error.message);
    }

    throw error;
  }
}

export async function deleteEditorSeriesAction(seriesIdValue: string) {
  await requireEditor();

  const seriesId = parseSeriesId(seriesIdValue);
  const deleted = await deleteEditorSeries(seriesId);

  if (!deleted) {
    notFound();
  }

  revalidatePath("/editor/series");
  redirect("/editor/series");
}

export async function deleteSeriesFromDetailAction(seriesIdValue: string, slug: string) {
  await requireEditorForPath(`/series/${slug}`);

  const seriesId = parseSeriesId(seriesIdValue);
  const deleted = await deleteEditorSeries(seriesId);

  if (!deleted) {
    notFound();
  }

  revalidatePath("/series");
  revalidatePath(`/series/${slug}`);
  revalidatePath("/editor/series");
  redirect("/series");
}
