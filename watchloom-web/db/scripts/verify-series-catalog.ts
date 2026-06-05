import "dotenv/config";

import { count, sql } from "drizzle-orm";

import { db, pool } from "../../src/db";
import { episodes, seasons, series } from "../../src/db/schema";

async function main() {
  const [seriesCounts, seasonCounts, episodeCounts, duplicateSeries, duplicateSeasons, duplicateEpisodes, withoutSeasons, withoutEpisodes] =
    await Promise.all([
      db.select({ total: count() }).from(series),
      db.select({ total: count() }).from(seasons),
      db.select({ total: count() }).from(episodes),
      db.execute(sql`select slug, count(*) from series group by slug having count(*) > 1`),
      db.execute(sql`select series_id, season_number, count(*) from seasons group by series_id, season_number having count(*) > 1`),
      db.execute(sql`select season_id, episode_number, count(*) from episodes group by season_id, episode_number having count(*) > 1`),
      db.execute(sql`select count(*)::int as total from series s where not exists (select 1 from seasons se where se.series_id = s.id)`),
      db.execute(sql`select count(*)::int as total from seasons se where not exists (select 1 from episodes e where e.season_id = se.id)`),
    ]);

  const [seriesCount] = seriesCounts;
  const [seasonCount] = seasonCounts;
  const [episodeCount] = episodeCounts;
  console.log(`series: ${seriesCount.total}`);
  console.log(`seasons: ${seasonCount.total}`);
  console.log(`episodes: ${episodeCount.total}`);
  console.log(`duplicate series slugs: ${duplicateSeries.rows.length}`);
  console.log(`duplicate seasons: ${duplicateSeasons.rows.length}`);
  console.log(`duplicate episodes: ${duplicateEpisodes.rows.length}`);
  console.log(`series without seasons: ${withoutSeasons.rows[0]?.total ?? 0}`);
  console.log(`seasons without episodes: ${withoutEpisodes.rows[0]?.total ?? 0}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => pool.end());
