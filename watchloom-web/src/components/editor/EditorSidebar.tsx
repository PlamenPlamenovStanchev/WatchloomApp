"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const editorLinks = [
  { href: "/editor", label: "Overview", icon: "OV" },
  { href: "/editor/movies", label: "Manage Movies", icon: "MV" },
  { href: "/editor/series", label: "Manage Series", icon: "TV" },
  { href: "/editor/seasons", label: "Manage Seasons/Episodes", icon: "SE" },
];

export function EditorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="watchloom-surface rounded-3xl p-4 lg:sticky lg:top-6 lg:w-72 lg:self-start">
      <div className="border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Editor Panel</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Catalog workspace
        </p>
      </div>

      <nav className="mt-4 grid gap-1" aria-label="Editor navigation">
        {editorLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/editor" && pathname.startsWith(`${link.href}/`));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-lg shadow-cyan-900/20"
                  : "text-zinc-600 hover:bg-orange-50 hover:text-orange-800 dark:text-zinc-400 dark:hover:bg-orange-950/20 dark:hover:text-orange-200"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-xs font-semibold" aria-hidden="true">
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
