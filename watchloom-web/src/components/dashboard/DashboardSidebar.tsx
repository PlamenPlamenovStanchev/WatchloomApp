"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SafeUser } from "@/services/auth.service";

const dashboardLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/watchlists", label: "Watchlists" },
  { href: "/dashboard/favourites", label: "Favourites" },
  { href: "/dashboard/reviews", label: "Reviews" },
  { href: "/dashboard/planned", label: "Planned Watching" },
  { href: "/movies", label: "Browse Movies" },
  { href: "/series", label: "Browse Series" },
];

type DashboardSidebarProps = {
  user: SafeUser;
};

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:sticky lg:top-6 lg:w-72 lg:self-start">
      <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{user.username}</p>
        <p className="mt-1 break-all text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
        <p className="mt-3 inline-flex rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium capitalize text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          {user.role}
        </p>
      </div>

      <nav className="mt-4 grid gap-1" aria-label="Dashboard navigation">
        {dashboardLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`));

          return (
            <Link
              key={`${link.href}:${link.label}`}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
