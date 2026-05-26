import { and, asc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { episodes, seasons, series } from "@/db/schema";
import type { EditorEpisodeInput } from "@/lib/validations/editor-episode";

export class EditorEpisodeServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "DUPLICATE_EPISODE"
      | "SERIES_NOT_FOUND"
      | "SEASON_NOT_FOUND"
      | "EPISODE_NOT_FOUND",
  ) {
    super(message);
    this.name = "EditorEpisodeServiceError";
  }
}

const isUniqueConstraintError = (error: unknown) => {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
};

const getOwnedSeasonContext = async (seriesId: number, seasonId: number) => {
  const [row] = await db
    .select({
      series,
      season: seasons,
    })
    .from(seasons)
    .innerJoin(series, eq(seasons.seriesId, series.id))
    .where(and(eq(series.id, seriesId), eq(seasons.id, seasonId)))
    .limit(1);

  return row ?? null;
};

const assertSeasonContext = async (seriesId: number, seasonId: number) => {
  const context = await getOwnedSeasonContext(seriesId, seasonId);

  if (!context) {
    throw new EditorEpisodeServiceError("Season was not found for this series.", "SEASON_NOT_FOUND");
  }

  return context;
};

const assertUniqueEpisodeNumber = async (
  seasonId: number,
  episodeNumber: number,
  currentEpisodeId?: number,
) => {
  const filters = [eq(episodes.seasonId, seasonId), eq(episodes.episodeNumber, episodeNumber)];

  if (currentEpisodeId) {
    filters.push(ne(episodes.id, currentEpisodeId));
  }

  const [existing] = await db.select({ id: episodes.id }).from(episodes).where(and(...filters)).limit(1);

  if (existing) {
    throw new EditorEpisodeServiceError(
      "An episode with this number already exists for this season.",
      "DUPLICATE_EPISODE",
    );
  }
};

const toEpisodeValues = (input: EditorEpisodeInput) => ({
  episodeNumber: input.episodeNumber,
  title: input.title,
  overview: input.overview,
  durationMinutes: input.durationMinutes,
  airDate: input.airDate,
});

export const getEditorEpisodes = async (seriesId: number, seasonId: number) => {
  const context = await assertSeasonContext(seriesId, seasonId);
  const episodeRows = await db
    .select()
    .from(episodes)
    .where(eq(episodes.seasonId, seasonId))
    .orderBy(asc(episodes.episodeNumber));

  return {
    series: context.series,
    season: context.season,
    episodes: episodeRows,
  };
};

export const getEditorEpisodeById = async (
  seriesId: number,
  seasonId: number,
  episodeId: number,
) => {
  await assertSeasonContext(seriesId, seasonId);

  const [episode] = await db
    .select()
    .from(episodes)
    .where(and(eq(episodes.id, episodeId), eq(episodes.seasonId, seasonId)))
    .limit(1);

  return episode ?? null;
};

export const createEditorEpisode = async (
  seriesId: number,
  seasonId: number,
  input: EditorEpisodeInput,
) => {
  await assertSeasonContext(seriesId, seasonId);
  await assertUniqueEpisodeNumber(seasonId, input.episodeNumber);

  try {
    const [episode] = await db
      .insert(episodes)
      .values({ seasonId, ...toEpisodeValues(input) })
      .returning();

    return episode;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EditorEpisodeServiceError(
        "An episode with this number already exists for this season.",
        "DUPLICATE_EPISODE",
      );
    }
    throw error;
  }
};

export const updateEditorEpisode = async (
  seriesId: number,
  seasonId: number,
  episodeId: number,
  input: EditorEpisodeInput,
) => {
  await assertSeasonContext(seriesId, seasonId);
  await assertUniqueEpisodeNumber(seasonId, input.episodeNumber, episodeId);

  try {
    const [episode] = await db
      .update(episodes)
      .set({ ...toEpisodeValues(input), updatedAt: new Date() })
      .where(and(eq(episodes.id, episodeId), eq(episodes.seasonId, seasonId)))
      .returning();

    return episode ?? null;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EditorEpisodeServiceError(
        "An episode with this number already exists for this season.",
        "DUPLICATE_EPISODE",
      );
    }
    throw error;
  }
};

export const deleteEditorEpisode = async (
  seriesId: number,
  seasonId: number,
  episodeId: number,
) => {
  await assertSeasonContext(seriesId, seasonId);

  const [deleted] = await db
    .delete(episodes)
    .where(and(eq(episodes.id, episodeId), eq(episodes.seasonId, seasonId)))
    .returning({ id: episodes.id });

  return Boolean(deleted);
};
