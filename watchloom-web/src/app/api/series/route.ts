import { apiSuccess, getCatalogQueryParams, withApiErrorHandling } from "@/lib/api";
import { getSeries } from "@/services/series.service";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const { page, pageSize, search, genre } = getCatalogQueryParams(request);
    const series = await getSeries({ page, pageSize, search, genre });

    return apiSuccess(series);
  });
}
