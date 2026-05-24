import { asc } from "drizzle-orm";

import { db } from "@/db";
import { genres } from "@/db/schema";

export const getGenres = async () => {
  return db.select().from(genres).orderBy(asc(genres.name));
};
