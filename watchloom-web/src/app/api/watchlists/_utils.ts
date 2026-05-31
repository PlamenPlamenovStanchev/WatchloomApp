import { errorResponse } from "@/lib/api/response";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getSafeUserById } from "@/services/auth.service";
import { WatchlistServiceError } from "@/services/watchlist.service";

import { getBearerToken } from "../auth/_utils";

type JsonObject = Record<string, unknown>;

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

export const parsePositiveId = (value: string) => {
  const parsed = Number.parseInt(value, 10);

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
    throw new WatchlistServiceError("Request body must be valid JSON.", "INVALID_INPUT");
  }
};

export const watchlistErrorResponse = (error: unknown) => {
  if (error instanceof WatchlistServiceError) {
    if (error.code === "DUPLICATE_WATCHLIST" || error.code === "DUPLICATE_ITEM") {
      return errorResponse(error.message, 409);
    }

    if (error.code === "MEDIA_NOT_FOUND") {
      return errorResponse(error.message, 404);
    }

    return errorResponse(error.message, 400);
  }

  return errorResponse("Internal server error.");
};
