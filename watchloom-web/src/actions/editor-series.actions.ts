"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getFirstValidationMessage } from "@/lib/validations/common";
import { editorSeriesSchema } from "@/lib/validations/editor-series";
import {
  createEditorSeries,
  deleteEditorSeries,
  EditorSeriesServiceError,
  updateEditorSeries,
} from "@/services/editor-series.service";

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

const parseSeriesId = (value: string) => {
  const seriesId = Number(value);

  if (!Number.isInteger(seriesId) || seriesId <= 0) {
    notFound();
  }

  return seriesId;
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

    revalidatePath("/editor/series");
    redirect(`/editor/series/${show.id}/edit?success=${encodeURIComponent("Series created.")}`);
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
