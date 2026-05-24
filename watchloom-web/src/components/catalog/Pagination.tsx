import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  q?: string | null;
  search?: string | null;
  genre?: string | null;
};

const createPageHref = ({
  basePath,
  page,
  q,
  search,
  genre,
}: Omit<PaginationProps, "currentPage" | "totalPages"> & { page: number }) => {
  const params = new URLSearchParams();
  const searchValue = q?.trim() || search?.trim();
  const genreValue = genre?.trim();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (searchValue) {
    params.set("q", searchValue);
  }

  if (genreValue) {
    params.set("genre", genreValue);
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
};

export function Pagination({ currentPage, totalPages, basePath, q, search, genre }: PaginationProps) {
  const normalizedTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), normalizedTotalPages);
  const previousPage = safeCurrentPage - 1;
  const nextPage = safeCurrentPage + 1;
  const hasPreviousPage = safeCurrentPage > 1;
  const hasNextPage = safeCurrentPage < normalizedTotalPages;
  const linkClass =
    "inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:ring-zinc-100";
  const disabledClass =
    "inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 px-4 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-600";

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
      {hasPreviousPage ? (
        <Link
          href={createPageHref({ basePath, page: previousPage, q, search, genre })}
          className={linkClass}
        >
          Previous
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          Previous
        </span>
      )}
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        Page {safeCurrentPage} of {normalizedTotalPages}
      </span>
      {hasNextPage ? (
        <Link
          href={createPageHref({ basePath, page: nextPage, q, search, genre })}
          className={linkClass}
        >
          Next
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  );
}
