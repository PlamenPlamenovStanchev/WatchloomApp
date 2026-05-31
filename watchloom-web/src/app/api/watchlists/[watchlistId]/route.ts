import { errorResponse, successResponse } from "@/lib/api/response";
import {
  deleteWatchlist,
  getWatchlistById,
  updateWatchlist,
} from "@/services/watchlist.service";

import {
  getAuthenticatedUserId,
  parsePositiveId,
  readJsonObject,
  watchlistErrorResponse,
} from "../_utils";

type WatchlistRouteContext = {
  params: Promise<{
    watchlistId: string;
  }>;
};

export async function GET(request: Request, { params }: WatchlistRouteContext) {
  const userId = await getAuthenticatedUserId(request);
  const watchlistId = parsePositiveId((await params).watchlistId);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  if (!watchlistId) {
    return errorResponse("Watchlist not found.", 404);
  }

  try {
    const watchlist = await getWatchlistById(userId, watchlistId);

    return watchlist ? successResponse(watchlist) : errorResponse("Watchlist not found.", 404);
  } catch (error) {
    return watchlistErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: WatchlistRouteContext) {
  const userId = await getAuthenticatedUserId(request);
  const watchlistId = parsePositiveId((await params).watchlistId);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  if (!watchlistId) {
    return errorResponse("Watchlist not found.", 404);
  }

  try {
    const body = await readJsonObject(request);
    const watchlist = await updateWatchlist(userId, watchlistId, {
      description:
        body.description === null || typeof body.description === "string"
          ? body.description
          : undefined,
      name: typeof body.name === "string" ? body.name : undefined,
    });

    return watchlist ? successResponse(watchlist) : errorResponse("Watchlist not found.", 404);
  } catch (error) {
    return watchlistErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: WatchlistRouteContext) {
  const userId = await getAuthenticatedUserId(request);
  const watchlistId = parsePositiveId((await params).watchlistId);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  if (!watchlistId) {
    return errorResponse("Watchlist not found.", 404);
  }

  try {
    return (await deleteWatchlist(userId, watchlistId))
      ? successResponse(true)
      : errorResponse("Watchlist not found.", 404);
  } catch (error) {
    return watchlistErrorResponse(error);
  }
}
