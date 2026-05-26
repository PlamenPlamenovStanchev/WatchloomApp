import { count } from "drizzle-orm";

import { EditorCard } from "@/components/editor/EditorCard";
import { db } from "@/db";
import { genres, movies, series } from "@/db/schema";

export default function EditorPage() {
  const statsPromise = getEditorStats();

  return <EditorOverview statsPromise={statsPromise} />;
}

const getEditorStats = async () => {
  const [[movieStats], [seriesStats], [genreStats]] = await Promise.all([
    db.select({ total: count() }).from(movies),
    db.select({ total: count() }).from(series),
    db.select({ total: count() }).from(genres),
  ]);

  return {
    movies: movieStats?.total ?? 0,
    series: seriesStats?.total ?? 0,
    genres: genreStats?.total ?? 0,
  };
};

async function EditorOverview({
  statsPromise,
}: {
  statsPromise: ReturnType<typeof getEditorStats>;
}) {
  const stats = await statsPromise;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Catalog stats">
        <EditorCard title="Movies" description="Total movie records" value={stats.movies} />
        <EditorCard title="Series" description="Total series records" value={stats.series} />
        <EditorCard title="Genres" description="Total genre records" value={stats.genres} />
      </section>

      <section className="space-y-4" aria-labelledby="editor-quick-links-heading">
        <div>
          <h2 id="editor-quick-links-heading" className="text-xl font-semibold tracking-tight">
            Quick links
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Start with the main catalog areas. CRUD tools will be added later.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <EditorCard
            href="/editor/movies"
            title="Manage Movies"
            description="Review movie catalog entries and metadata."
            label="Open movies"
          />
          <EditorCard
            href="/editor/series"
            title="Manage Series"
            description="Review series catalog entries and metadata."
            label="Open series"
          />
          <EditorCard
            href="/editor/seasons"
            title="Manage Seasons/Episodes"
            description="Review season and episode structures."
            label="Open seasons"
          />
        </div>
      </section>
    </div>
  );
}
