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
    "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:focus:ring-zinc-100";
  const activeClass = "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950";
  const inactiveClass =
    "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900";

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
