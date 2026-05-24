import { apiError, apiSuccess, withApiErrorHandling } from "@/lib/api";
import { getSeriesBySlug, getSeriesSeasons } from "@/services/series.service";

type SeriesSeasonsRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: SeriesSeasonsRouteContext) {
  return withApiErrorHandling(async () => {
    const { slug } = await params;
    const series = await getSeriesBySlug(slug);

    if (!series) {
      return apiError("Series not found.", { status: 404 });
    }

    const seasons = await getSeriesSeasons(series.id);

    return apiSuccess({
      series,
      items: seasons,
    });
  });
}
