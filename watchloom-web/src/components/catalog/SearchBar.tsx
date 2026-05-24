type SearchBarProps = {
  action: string;
  q?: string | null;
  search?: string | null;
  genre?: string | null;
};

export function SearchBar({ action, q, search, genre }: SearchBarProps) {
  const searchValue = q ?? search ?? "";
  const genreValue = genre?.trim();

  return (
    <form action={action} method="GET" className="flex w-full flex-col gap-3 sm:flex-row">
      <label htmlFor="catalog-search" className="sr-only">
        Search by title
      </label>
      <input
        id="catalog-search"
        name="q"
        type="search"
        defaultValue={searchValue}
        placeholder="Search by title..."
        className="h-11 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
      />
      {genreValue ? <input type="hidden" name="genre" value={genreValue} /> : null}
      <button
        type="submit"
        className="h-11 rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
      >
        Search
      </button>
    </form>
  );
}
