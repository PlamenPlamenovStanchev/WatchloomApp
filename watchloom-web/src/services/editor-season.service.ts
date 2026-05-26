import { and, asc, count, eq, inArray, ne } from "drizzle-orm";

import { db } from "@/db";
import { episodes, seasons, series } from "@/db/schema";
import type { EditorSeasonInput } from "@/lib/validations/editor-season";

type SeasonRecord = typeof seasons.$inferSelect;

export type EditorSeasonListItem = SeasonRecord & {
  episodeCount: number;
};

export class EditorSeasonServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "DUPLICATE_SEASON" | "SERIES_NOT_FOUND" | "SEASON_NOT_FOUND",
  ) {
    super(message);
    this.name = "EditorSeasonServiceError";
  }
}

const isUniqueConstraintError = (error: unknown) => {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
};

const getSeriesById = async (seriesId: number) => {
  const [show] = await db.select().from(series).where(eq(series.id, seriesId)).limit(1);

  return show ?? null;
};

const assertSeriesExists = async (seriesId: number) => {
  const show = await getSeriesById(seriesId);

  if (!show) {
    throw new EditorSeasonServiceError("Series was not found.", "SERIES_NOT_FOUND");
  }

  return show;
};

const assertUniqueSeasonNumber = async (
  seriesId: number,
  seasonNumber: number,
  currentSeasonId?: number,
) => {
  const filters = [eq(seasons.seriesId, seriesId), eq(seasons.seasonNumber, seasonNumber)];

  if (currentSeasonId) {
    filters.push(ne(seasons.id, currentSeasonId));
  }

  const [existing] = await db.select({ id: seasons.id }).from(seasons).where(and(...filters)).limit(1);

  if (existing) {
    throw new EditorSeasonServiceError(
      "A season with this number already exists for this series.",
      "DUPLICATE_SEASON",
    );
  }
};

const toSeasonValues = (input: EditorSeasonInput) => ({
  seasonNumber: input.seasonNumber,
  title: input.title,
  releaseYear: input.releaseYear,
  posterUrl: input.posterUrl,
});

const getEpisodeCountsBySeasonId = async (seasonIds: number[]) => {
  if (seasonIds.length === 0) {
    return new Map<number, number>();
  }

  const rows = await db
    .select({ seasonId: episodes.seasonId, total: count(episodes.id) })
    .from(episodes)
    .where(inArray(episodes.seasonId, seasonIds))
    .groupBy(episodes.seasonId);

  return new Map(rows.map((row) => [row.seasonId, row.total]));
};

export const getEditorSeasons = async (seriesId: number) => {
  const show = await assertSeriesExists(seriesId);
  const seasonRows = await db
    .select()
    .from(seasons)
    .where(eq(seasons.seriesId, seriesId))
    .orderBy(asc(seasons.seasonNumber));
  const episodeCounts = await getEpisodeCountsBySeasonId(seasonRows.map((season) => season.id));

  return {
    series: show,
    seasons: seasonRows.map((season) => ({
      ...season,
      episodeCount: episodeCounts.get(season.id) ?? 0,
    })),
  };
};

export const getEditorSeasonById = async (seriesId: number, seasonId: number) => {
  await assertSeriesExists(seriesId);

  const [season] = await db
    .select()
    .from(seasons)
    .where(and(eq(seasons.id, seasonId), eq(seasons.seriesId, seriesId)))
    .limit(1);

  return season ?? null;
};

export const createEditorSeason = async (seriesId: number, input: EditorSeasonInput) => {
  await assertSeriesExists(seriesId);
  await assertUniqueSeasonNumber(seriesId, input.seasonNumber);

  try {
    const [season] = await db
      .insert(seasons)
      .values({ seriesId, ...toSeasonValues(input) })
      .returning();

    return season;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EditorSeasonServiceError(
        "A season with this number already exists for this series.",
        "DUPLICATE_SEASON",
      );
    }
    throw error;
  }
};

export const updateEditorSeason = async (
  seriesId: number,
  seasonId: number,
  input: EditorSeasonInput,
) => {
  await assertSeriesExists(seriesId);
  await assertUniqueSeasonNumber(seriesId, input.seasonNumber, seasonId);

  try {
    const [season] = await db
      .update(seasons)
      .set({ ...toSeasonValues(input), updatedAt: new Date() })
      .where(and(eq(seasons.id, seasonId), eq(seasons.seriesId, seriesId)))
      .returning();

    return season ?? null;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EditorSeasonServiceError(
        "A season with this number already exists for this series.",
        "DUPLICATE_SEASON",
      );
    }
    throw error;
  }
};

export const deleteEditorSeason = async (seriesId: number, seasonId: number) => {
  const [deleted] = await db
    .delete(seasons)
    .where(and(eq(seasons.id, seasonId), eq(seasons.seriesId, seriesId)))
    .returning({ id: seasons.id });

  return Boolean(deleted);
};
