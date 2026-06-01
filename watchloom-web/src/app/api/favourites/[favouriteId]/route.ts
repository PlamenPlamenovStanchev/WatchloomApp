import { errorResponse, successResponse } from "@/lib/api/response";
import { removeFavourite } from "@/services/favourite.service";

import { favouriteErrorResponse, getAuthenticatedUserId, parsePositiveId } from "../_utils";

type FavouriteRouteContext = {
  params: Promise<{
    favouriteId: string;
  }>;
};

export async function DELETE(request: Request, { params }: FavouriteRouteContext) {
  const userId = await getAuthenticatedUserId(request);
  const favouriteId = parsePositiveId((await params).favouriteId);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  if (!favouriteId) {
    return errorResponse("Favourite not found.", 404);
  }

  try {
    return (await removeFavourite(userId, favouriteId))
      ? successResponse(true)
      : errorResponse("Favourite not found.", 404);
  } catch (error) {
    return favouriteErrorResponse(error);
  }
}
