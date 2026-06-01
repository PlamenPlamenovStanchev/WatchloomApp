import { errorResponse, successResponse } from "@/lib/api/response";
import {
  getUserFavouriteForMedia,
  removeFavouriteForMedia,
} from "@/services/favourite.service";

import {
  favouriteErrorResponse,
  getAuthenticatedUserId,
  parseMediaInput,
  parseMediaQuery,
  readJsonObject,
} from "../_utils";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const { mediaId, mediaType } = parseMediaQuery(request);

    return successResponse(await getUserFavouriteForMedia(userId, mediaType, mediaId));
  } catch (error) {
    return favouriteErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const { mediaId, mediaType } = parseMediaInput(await readJsonObject(request));

    return successResponse(await removeFavouriteForMedia(userId, mediaType, mediaId));
  } catch (error) {
    return favouriteErrorResponse(error);
  }
}
