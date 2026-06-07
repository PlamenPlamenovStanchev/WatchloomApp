"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getFirstValidationMessage } from "@/lib/validations/common";
import { editorEpisodeSchema } from "@/lib/validations/editor-episode";
import {
  createEditorEpisode,
  deleteEditorEpisode,
  EditorEpisodeServiceError,
  getEditorEpisodes,
  updateEditorEpisode,
} from "@/services/editor-episode.service";

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

const parseEpisodeFormData = (formData: FormData) => {
  return editorEpisodeSchema.safeParse({
    episodeNumber: getString(formData, "episodeNumber"),
    title: getString(formData, "title"),
    overview: getString(formData, "overview"),
    durationMinutes: getString(formData, "durationMinutes"),
    airDate: getString(formData, "airDate"),
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

export async function createEditorEpisodeAction(
  seriesIdValue: string,
  seasonIdValue: string,
  formData: FormData,
) {
  await requireEditor();

  const seriesId = parsePositiveId(seriesIdValue);
  const seasonId = parsePositiveId(seasonIdValue);
  const newPath = `/editor/series/${seriesId}/seasons/${seasonId}/episodes/new`;
  const parsed = parseEpisodeFormData(formData);

  if (!parsed.success) {
    redirectWithError(newPath, getFirstValidationMessage(parsed.error));
  }

  const input = parsed.data!;

  try {
    await createEditorEpisode(seriesId, seasonId, input);
    const data = await getEditorEpisodes(seriesId, seasonId);

    revalidatePath(`/editor/series/${seriesId}/seasons/${seasonId}/episodes`);
    revalidatePath(`/series/${data.series.slug}/seasons/${seasonId}`);
    redirect(`/series/${data.series.slug}/seasons/${seasonId}`);
  } catch (error) {
    if (error instanceof EditorEpisodeServiceError) {
      redirectWithError(newPath, error.message);
    }
    throw error;
  }
}

export async function updateEditorEpisodeAction(
  seriesIdValue: string,
  seasonIdValue: string,
  episodeIdValue: string,
  formData: FormData,
) {
  await requireEditor();

  const seriesId = parsePositiveId(seriesIdValue);
  const seasonId = parsePositiveId(seasonIdValue);
  const episodeId = parsePositiveId(episodeIdValue);
  const editPath = `/editor/series/${seriesId}/seasons/${seasonId}/episodes/${episodeId}/edit`;
  const parsed = parseEpisodeFormData(formData);

  if (!parsed.success) {
    redirectWithError(editPath, getFirstValidationMessage(parsed.error));
  }

  const input = parsed.data!;

  try {
    const episode = await updateEditorEpisode(seriesId, seasonId, episodeId, input);
    const data = await getEditorEpisodes(seriesId, seasonId);

    if (!episode) {
      notFound();
    }

    revalidatePath(`/editor/series/${seriesId}/seasons/${seasonId}/episodes`);
    revalidatePath(editPath);
    revalidatePath(`/series/${data.series.slug}/seasons/${seasonId}`);
    redirect(`/series/${data.series.slug}/seasons/${seasonId}`);
  } catch (error) {
    if (error instanceof EditorEpisodeServiceError) {
      redirectWithError(editPath, error.message);
    }
    throw error;
  }
}

export async function deleteEditorEpisodeAction(
  seriesIdValue: string,
  seasonIdValue: string,
  episodeIdValue: string,
) {
  await requireEditor();

  const seriesId = parsePositiveId(seriesIdValue);
  const seasonId = parsePositiveId(seasonIdValue);
  const episodeId = parsePositiveId(episodeIdValue);
  const deleted = await deleteEditorEpisode(seriesId, seasonId, episodeId);

  if (!deleted) {
    notFound();
  }

  revalidatePath(`/editor/series/${seriesId}/seasons/${seasonId}/episodes`);
  redirect(`/editor/series/${seriesId}/seasons/${seasonId}/episodes`);
}

export async function deleteEpisodeFromSeasonDetailAction(
  seriesIdValue: string,
  seasonIdValue: string,
  episodeIdValue: string,
  seriesSlug: string,
) {
  await requireEditorForPath(`/series/${seriesSlug}/seasons/${seasonIdValue}`);

  const seriesId = parsePositiveId(seriesIdValue);
  const seasonId = parsePositiveId(seasonIdValue);
  const episodeId = parsePositiveId(episodeIdValue);
  const deleted = await deleteEditorEpisode(seriesId, seasonId, episodeId);

  if (!deleted) {
    notFound();
  }

  revalidatePath(`/editor/series/${seriesId}/seasons/${seasonId}/episodes`);
  revalidatePath(`/series/${seriesSlug}/seasons/${seasonId}`);
  redirect(`/series/${seriesSlug}/seasons/${seasonId}`);
}
