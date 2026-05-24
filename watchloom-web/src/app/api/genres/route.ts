import { apiSuccess, withApiErrorHandling } from "@/lib/api";
import { getGenres } from "@/services/genre.service";

export async function GET() {
  return withApiErrorHandling(async () => {
    const genres = await getGenres();

    return apiSuccess({
      items: genres,
    });
  });
}
