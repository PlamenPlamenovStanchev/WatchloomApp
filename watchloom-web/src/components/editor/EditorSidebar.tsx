"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const editorLinks = [
  { href: "/editor", label: "Overview" },
  { href: "/editor/movies", label: "Manage Movies" },
  { href: "/editor/series", label: "Manage Series" },
  { href: "/editor/seasons", label: "Manage Seasons/Episodes" },
];

export function EditorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:sticky lg:top-6 lg:w-72 lg:self-start">
      <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
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
