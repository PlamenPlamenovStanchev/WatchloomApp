"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getFirstValidationMessage } from "@/lib/validations/common";
import { editorSeasonSchema } from "@/lib/validations/editor-season";
import { getEditorSeriesById } from "@/services/editor-series.service";
import {
  createEditorSeason,
  deleteEditorSeason,
  EditorSeasonServiceError,
  updateEditorSeason,
} from "@/services/editor-season.service";

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

const parseSeasonFormData = (formData: FormData) => {
  return editorSeasonSchema.safeParse({
    seasonNumber: getString(formData, "seasonNumber"),
    title: getString(formData, "title"),
    releaseYear: getString(formData, "releaseYear"),
  });
};

const redirectWithError = (path: string, message: string): never => {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
};

const parsePositiveId = (value: string) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  return id;
};

export async function createEditorSeasonAction(seriesIdValue: string, formData: FormData) {
  await requireEditor();

  const seriesId = parsePositiveId(seriesIdValue);
  const newPath = `/editor/series/${seriesId}/seasons/new`;
  const parsed = parseSeasonFormData(formData);

  if (!parsed.success) {
    redirectWithError(newPath, getFirstValidationMessage(parsed.error));
  }

  const input = parsed.data!;

  try {
    await createEditorSeason(seriesId, input);
    const show = await getEditorSeriesById(seriesId);

    revalidatePath(`/editor/series/${seriesId}/seasons`);
    revalidatePath(show ? `/series/${show.slug}` : "/series");
    redirect(show ? `/series/${show.slug}` : `/editor/series/${seriesId}/seasons`);
  } catch (error) {
    if (error instanceof EditorSeasonServiceError) {
      redirectWithError(newPath, error.message);
    }
    throw error;
  }
}

export async function updateEditorSeasonAction(
  seriesIdValue: string,
  seasonIdValue: string,
  formData: FormData,
) {
  await requireEditor();

  const seriesId = parsePositiveId(seriesIdValue);
  const seasonId = parsePositiveId(seasonIdValue);
  const editPath = `/editor/series/${seriesId}/seasons/${seasonId}/edit`;
  const parsed = parseSeasonFormData(formData);

  if (!parsed.success) {
    redirectWithError(editPath, getFirstValidationMessage(parsed.error));
  }

  const input = parsed.data!;

  try {
    const season = await updateEditorSeason(seriesId, seasonId, input);
    const show = await getEditorSeriesById(seriesId);

    if (!season) {
      notFound();
    }

    revalidatePath(`/editor/series/${seriesId}/seasons`);
    revalidatePath(editPath);
    revalidatePath(show ? `/series/${show.slug}` : "/series");
    redirect(show ? `/series/${show.slug}` : editPath);
  } catch (error) {
    if (error instanceof EditorSeasonServiceError) {
      redirectWithError(editPath, error.message);
    }
    throw error;
  }
}

export async function deleteEditorSeasonAction(seriesIdValue: string, seasonIdValue: string) {
  await requireEditor();

  const seriesId = parsePositiveId(seriesIdValue);
  const seasonId = parsePositiveId(seasonIdValue);
  const deleted = await deleteEditorSeason(seriesId, seasonId);

  if (!deleted) {
    notFound();
  }

  revalidatePath(`/editor/series/${seriesId}/seasons`);
  redirect(`/editor/series/${seriesId}/seasons`);
}

export async function deleteSeasonFromSeriesDetailAction(
  seriesIdValue: string,
  seasonIdValue: string,
  seriesSlug: string,
) {
  await requireEditorForPath(`/series/${seriesSlug}`);

  const seriesId = parsePositiveId(seriesIdValue);
  const seasonId = parsePositiveId(seasonIdValue);
  const deleted = await deleteEditorSeason(seriesId, seasonId);

  if (!deleted) {
    notFound();
  }

  revalidatePath(`/editor/series/${seriesId}/seasons`);
  revalidatePath(`/series/${seriesSlug}`);
  redirect(`/series/${seriesSlug}`);
}
