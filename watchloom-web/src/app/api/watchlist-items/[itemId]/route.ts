import { errorResponse, successResponse } from "@/lib/api/response";
import { removeWatchlistItem, updateWatchlistItem } from "@/services/watchlist.service";

import {
  getAuthenticatedUserId,
  parsePositiveId,
  readJsonObject,
  watchlistErrorResponse,
} from "../../watchlists/_utils";

type WatchlistItemRouteContext = {
  params: Promise<{
    itemId: string;
  }>;
};

export async function PATCH(request: Request, { params }: WatchlistItemRouteContext) {
  const userId = await getAuthenticatedUserId(request);
  const itemId = parsePositiveId((await params).itemId);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  if (!itemId) {
    return errorResponse("Watchlist item not found.", 404);
  }

  try {
    const body = await readJsonObject(request);
    const item = await updateWatchlistItem(userId, itemId, {
      notes: body.notes === null || typeof body.notes === "string" ? body.notes : undefined,
      plannedWatchAt:
        body.plannedWatchAt === null || typeof body.plannedWatchAt === "string"
          ? body.plannedWatchAt
          : undefined,
      rating: body.rating === null || typeof body.rating === "number" ? body.rating : undefined,
      status:
        body.status === "watched" || body.status === "watching" || body.status === "to_watch"
          ? body.status
          : undefined,
    });

    return item ? successResponse(item) : errorResponse("Watchlist item not found.", 404);
  } catch (error) {
    return watchlistErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: WatchlistItemRouteContext) {
  const userId = await getAuthenticatedUserId(request);
  const itemId = parsePositiveId((await params).itemId);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  if (!itemId) {
    return errorResponse("Watchlist item not found.", 404);
  }

  try {
    return (await removeWatchlistItem(userId, itemId))
      ? successResponse(true)
      : errorResponse("Watchlist item not found.", 404);
  } catch (error) {
    return watchlistErrorResponse(error);
  }
}
