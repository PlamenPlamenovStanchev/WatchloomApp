import { apiError, apiSuccess, withApiErrorHandling } from "@/lib/api";
import { getSeriesBySlug } from "@/services/series.service";

type SeriesDetailRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: SeriesDetailRouteContext) {
  return withApiErrorHandling(async () => {
    const { slug } = await params;
    const series = await getSeriesBySlug(slug);

    if (!series) {
      return apiError("Series not found.", { status: 404 });
    }

    return apiSuccess(series);
  });
}
