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
  { href: "/docs", label: "API Docs", icon: "API" },
  { href: "/movies", label: "Browse Movies", icon: "▶" },
  { href: "/series", label: "Browse Series", icon: "▦" },
];

const getRolePanelLinks = (role: SafeUser["role"]) => {
  if (role === "admin") {
    return [
      {
        href: "/admin",
        label: "Admin Panel",
        className: "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-purple-900/20",
      },
      {
        href: "/editor",
        label: "Editor Panel",
        className: "bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-cyan-900/20",
      },
    ];
  }

  if (role === "editor") {
    return [
      {
        href: "/editor",
        label: "Editor Panel",
        className: "bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-cyan-900/20",
      },
    ];
  }

  return [];
};

type DashboardSidebarProps = {
  user: SafeUser;
};

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const rolePanelLinks = getRolePanelLinks(user.role);

  return (
    <aside className="watchloom-surface rounded-3xl p-4 lg:sticky lg:top-6 lg:w-72 lg:self-start">
      <div className="border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{user.username}</p>
        <p className="mt-1 break-all text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
        <p className="watchloom-pill mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize">
          {user.role}
        </p>
      </div>

      {rolePanelLinks.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {rolePanelLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 ${link.className}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}

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
