import { apiSuccess, getCatalogQueryParams, withApiErrorHandling } from "@/lib/api";
import { getMovies } from "@/services/movie.service";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const { page, pageSize, search, genre } = getCatalogQueryParams(request);
    const movies = await getMovies({ page, pageSize, search, genre });

    return apiSuccess(movies);
  });
}
