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
    <form action={action} method="GET" className="watchloom-surface flex w-full flex-col gap-3 rounded-2xl p-2 sm:flex-row">
      <label htmlFor="catalog-search" className="sr-only">
        Search by title
      </label>
      <input
        id="catalog-search"
        name="q"
        type="search"
        defaultValue={searchValue}
        placeholder="Search by title..."
        className="h-11 min-w-0 flex-1 rounded-xl border border-transparent bg-white/70 px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 dark:bg-black/40 dark:text-zinc-50 dark:placeholder:text-zinc-500"
      />
      {genreValue ? <input type="hidden" name="genre" value={genreValue} /> : null}
      <button
        type="submit"
        className="watchloom-button-primary h-11 rounded-xl px-5 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-orange-500/20"
      >
        Search →
      </button>
    </form>
  );
}
