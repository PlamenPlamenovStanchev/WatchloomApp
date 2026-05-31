import { errorResponse, successResponse } from "@/lib/api/response";
import { addWatchlistItem } from "@/services/watchlist.service";

import {
  getAuthenticatedUserId,
  parsePositiveId,
  readJsonObject,
  watchlistErrorResponse,
} from "../../_utils";

type WatchlistItemsRouteContext = {
  params: Promise<{
    watchlistId: string;
  }>;
};

export async function POST(request: Request, { params }: WatchlistItemsRouteContext) {
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
    const item = await addWatchlistItem(userId, watchlistId, {
      mediaType: body.mediaType === "series" ? "series" : "movie",
      movieId: typeof body.movieId === "number" ? body.movieId : null,
      notes: typeof body.notes === "string" ? body.notes : null,
      plannedWatchAt: typeof body.plannedWatchAt === "string" ? body.plannedWatchAt : null,
      rating: typeof body.rating === "number" ? body.rating : null,
      seriesId: typeof body.seriesId === "number" ? body.seriesId : null,
      status:
        body.status === "watched" || body.status === "watching" ? body.status : "to_watch",
    });

    return successResponse(item, { status: 201 });
  } catch (error) {
    return watchlistErrorResponse(error);
  }
}
