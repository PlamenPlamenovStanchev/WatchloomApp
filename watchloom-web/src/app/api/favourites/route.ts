import { errorResponse, successResponse } from "@/lib/api/response";
import { addFavourite, getUserFavourites } from "@/services/favourite.service";

import {
  favouriteErrorResponse,
  getAuthenticatedUserId,
  parseMediaInput,
  readJsonObject,
} from "./_utils";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    return successResponse(await getUserFavourites(userId));
  } catch (error) {
    return favouriteErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const { mediaId, mediaType } = parseMediaInput(await readJsonObject(request));

    return successResponse(await addFavourite(userId, mediaType, mediaId), { status: 201 });
  } catch (error) {
    return favouriteErrorResponse(error);
  }
}
