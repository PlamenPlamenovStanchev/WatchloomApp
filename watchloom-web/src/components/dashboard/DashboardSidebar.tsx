"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SafeUser } from "@/services/auth.service";

const dashboardLinks = [
  { href: "/dashboard", label: "Overview", icon: "⌂" },
  { href: "/dashboard/watchlists", label: "Watchlists", icon: "+" },
  { href: "/dashboard/favourites", label: "Favourites", icon: "♥" },
  { href: "/dashboard/reviews", label: "Reviews", icon: "★" },
  { href: "/dashboard/planned", label: "Planned Watching", icon: "◷" },
  { href: "/movies", label: "Browse Movies", icon: "▶" },
  { href: "/series", label: "Browse Series", icon: "▦" },
];

type DashboardSidebarProps = {
  user: SafeUser;
};

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="watchloom-surface rounded-3xl p-4 lg:sticky lg:top-6 lg:w-72 lg:self-start">
      <div className="border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{user.username}</p>
        <p className="mt-1 break-all text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
        <p className="watchloom-pill mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize">
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
              className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-zinc-950 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-950"
                  : "text-zinc-600 hover:bg-orange-50 hover:text-orange-800 dark:text-zinc-400 dark:hover:bg-orange-950/20 dark:hover:text-orange-200"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-xs" aria-hidden="true">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
