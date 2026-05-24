import { apiError, apiSuccess, withApiErrorHandling } from "@/lib/api";
import { getSeasonEpisodes } from "@/services/series.service";

type SeasonEpisodesRouteContext = {
  params: Promise<{
    seasonId: string;
  }>;
};

export async function GET(_request: Request, { params }: SeasonEpisodesRouteContext) {
  return withApiErrorHandling(async () => {
    const { seasonId } = await params;
    const parsedSeasonId = Number.parseInt(seasonId, 10);

    if (!Number.isInteger(parsedSeasonId) || parsedSeasonId <= 0) {
      return apiError("Season not found.", { status: 404 });
    }

    const episodes = await getSeasonEpisodes(parsedSeasonId);

    if (episodes.length === 0) {
      return apiError("Season not found.", { status: 404 });
    }

    return apiSuccess({
      seasonId: parsedSeasonId,
      items: episodes,
    });
  });
}
