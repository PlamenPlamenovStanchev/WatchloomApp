import Link from "next/link";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const authLinks = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-black/95">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-950 transition hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
          >
            Watchloom
          </Link>
          <nav className="hidden items-center gap-2 sm:flex" aria-label="Account navigation">
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.href === "/register"
                    ? "rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                    : "rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Primary navigation">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}
          <span className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 sm:hidden" aria-hidden="true" />
          <span className="flex gap-2 sm:hidden">
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                {link.label}
              </Link>
            ))}
          </span>
        </nav>
      </div>
    </header>
  );
}
