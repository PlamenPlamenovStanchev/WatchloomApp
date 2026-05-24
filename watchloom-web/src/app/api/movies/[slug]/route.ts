import { apiError, apiSuccess, withApiErrorHandling } from "@/lib/api";
import { getMovieBySlug } from "@/services/movie.service";

type MovieDetailRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: MovieDetailRouteContext) {
  return withApiErrorHandling(async () => {
    const { slug } = await params;
    const movie = await getMovieBySlug(slug);

    if (!movie) {
      return apiError("Movie not found.", { status: 404 });
    }

    return apiSuccess(movie);
  });
}
