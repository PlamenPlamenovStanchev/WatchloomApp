import { errorResponse, successResponse } from "@/lib/api/response";
import { createWatchlist, getUserWatchlists } from "@/services/watchlist.service";

import { getAuthenticatedUserId, readJsonObject, watchlistErrorResponse } from "./_utils";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    return successResponse(await getUserWatchlists(userId));
  } catch (error) {
    return watchlistErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const body = await readJsonObject(request);
    const watchlist = await createWatchlist(userId, {
      description: typeof body.description === "string" ? body.description : null,
      name: typeof body.name === "string" ? body.name : "",
    });

    return successResponse(watchlist, { status: 201 });
  } catch (error) {
    return watchlistErrorResponse(error);
  }
}
