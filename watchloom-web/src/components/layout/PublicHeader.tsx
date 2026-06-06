import Link from "next/link";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";

import { LogoutButton } from "./LogoutButton";

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

export async function PublicHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = !!token;

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/75 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-black/55">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-950 transition hover:text-orange-700 dark:text-zinc-50 dark:hover:text-orange-200"
          >
            <span className="flex size-8 items-center justify-center rounded-2xl bg-zinc-950 text-sm text-white shadow-lg shadow-orange-900/10 transition group-hover:rotate-3 group-hover:scale-105 dark:bg-zinc-50 dark:text-zinc-950">
              W
            </span>
            <span>Watchloom</span>
          </Link>
          <nav className="hidden items-center gap-2 sm:flex" aria-label="Account navigation">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-200"
                >
                  Dashboard
                </Link>
                <Link
                  href="/docs"
                  className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-200"
                >
                  Docs
                </Link>
                <LogoutButton />
              </>
            ) : (
              authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    link.href === "/register"
                      ? "watchloom-button-primary rounded-full px-4 py-2 text-sm font-medium transition"
                      : "rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-200"
                  }
                >
                  {link.label}
                </Link>
              ))
            )}
          </nav>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-2 sm:justify-start" aria-label="Primary navigation">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group inline-flex items-center rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white/80 hover:text-orange-700 hover:shadow-sm dark:text-zinc-300 dark:hover:bg-zinc-900/80 dark:hover:text-orange-200"
            >
              {link.label}
            </Link>
          ))}
          <span className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 sm:hidden" aria-hidden="true" />
          <span className="flex gap-2 sm:hidden">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-200"
                >
                  Dashboard
                </Link>
                <Link
                  href="/docs"
                  className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-200"
                >
                  Docs
                </Link>
                <LogoutButton />
              </>
            ) : (
              authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-200"
                >
                  {link.label}
                </Link>
              ))
            )}
          </span>
        </nav>
      </div>
    </header>
  );
}
