import { errorResponse } from "@/lib/api/response";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getSafeUserById } from "@/services/auth.service";
import { FavouriteServiceError } from "@/services/favourite.service";

import { getBearerToken } from "../auth/_utils";

type JsonObject = Record<string, unknown>;

export type FavouriteMediaInput = {
  mediaId: number;
  mediaType: "movie" | "series";
};

export const getAuthenticatedUserId = async (request: Request) => {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAccessToken(token);
    const user = await getSafeUserById(payload.userId);

    return user?.isActive ? user.id : null;
  } catch {
    return null;
  }
};

export const parsePositiveId = (value: string | null) => {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const readJsonObject = async (request: Request): Promise<JsonObject> => {
  try {
    const body = (await request.json()) as unknown;

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new Error("Request body must be a JSON object.");
    }

    return body as JsonObject;
  } catch {
    throw new FavouriteServiceError("Request body must be valid JSON.", "INVALID_INPUT");
  }
};

export const parseMediaInput = (body: JsonObject): FavouriteMediaInput => {
  const mediaType = body.mediaType;
  const movieId = typeof body.movieId === "number" ? body.movieId : null;
  const seriesId = typeof body.seriesId === "number" ? body.seriesId : null;
  const mediaId = mediaType === "movie" ? movieId : mediaType === "series" ? seriesId : null;

  if (
    (mediaType !== "movie" && mediaType !== "series") ||
    !mediaId ||
    !Number.isInteger(mediaId) ||
    mediaId <= 0
  ) {
    throw new FavouriteServiceError("Provide a valid movie or series.", "INVALID_INPUT");
  }

  return { mediaId, mediaType };
};

export const parseMediaQuery = (request: Request) => {
  const { searchParams } = new URL(request.url);

  return parseMediaInput({
    mediaType: searchParams.get("mediaType"),
    movieId: parsePositiveId(searchParams.get("movieId")),
    seriesId: parsePositiveId(searchParams.get("seriesId")),
  });
};

export const favouriteErrorResponse = (error: unknown) => {
  if (error instanceof FavouriteServiceError) {
    if (error.code === "DUPLICATE_FAVOURITE") {
      return errorResponse(error.message, 409);
    }

    if (error.code === "MEDIA_NOT_FOUND") {
      return errorResponse(error.message, 404);
    }

    return errorResponse(error.message, 400);
  }

  return errorResponse("Internal server error.");
};
