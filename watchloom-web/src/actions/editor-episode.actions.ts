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
    const episode = await createEditorEpisode(seriesId, seasonId, input);

    revalidatePath(`/editor/series/${seriesId}/seasons/${seasonId}/episodes`);
    redirect(
      `/editor/series/${seriesId}/seasons/${seasonId}/episodes/${episode.id}/edit?success=${encodeURIComponent(
        "Episode created.",
      )}`,
    );
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

    if (!episode) {
      notFound();
    }

    revalidatePath(`/editor/series/${seriesId}/seasons/${seasonId}/episodes`);
    revalidatePath(editPath);
    redirect(`${editPath}?success=${encodeURIComponent("Episode updated.")}`);
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
