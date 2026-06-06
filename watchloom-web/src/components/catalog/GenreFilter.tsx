import Link from "next/link";

type Genre = {
  name: string;
  slug: string;
};

type GenreFilterProps = {
  genres: Genre[];
  basePath: string;
  currentGenre?: string | null;
  q?: string | null;
  search?: string | null;
};

const createGenreHref = ({
  basePath,
  genre,
  q,
  search,
}: {
  basePath: string;
  genre?: string | null;
  q?: string | null;
  search?: string | null;
}) => {
  const params = new URLSearchParams();
  const searchValue = q?.trim() || search?.trim();
  const genreValue = genre?.trim();

  if (searchValue) {
    params.set("q", searchValue);
  }

  if (genreValue) {
    params.set("genre", genreValue);
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
};

export function GenreFilter({
  genres,
  basePath,
  currentGenre,
  q,
  search,
}: GenreFilterProps) {
  const selectedGenre = currentGenre?.trim();
  const baseClass =
    "inline-flex h-9 items-center rounded-full border px-3 text-sm font-medium transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-orange-500/15";
  const activeClass = "border-orange-300 bg-orange-100 text-orange-900 shadow-sm shadow-orange-900/5 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200";
  const inactiveClass =
    "border-white/70 bg-white/50 text-zinc-700 hover:border-orange-200 hover:bg-orange-50 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-300 dark:hover:border-orange-900/60 dark:hover:bg-orange-950/20";

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Genre filter">
      <Link
        href={createGenreHref({ basePath, q, search })}
        className={`${baseClass} ${!selectedGenre ? activeClass : inactiveClass}`}
      >
        All genres
      </Link>
      {genres.map((genre) => {
        const isActive = selectedGenre === genre.slug;

        return (
          <Link
            key={genre.slug}
            href={createGenreHref({ basePath, genre: genre.slug, q, search })}
            className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
          >
            {genre.name}
          </Link>
        );
      })}
    </nav>
  );
}
