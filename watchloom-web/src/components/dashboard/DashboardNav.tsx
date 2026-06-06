import { DashboardCard } from "./DashboardCard";

type UserRole = "user" | "editor" | "admin";

type DashboardNavProps = {
  role: UserRole;
};

const dashboardLinks = [
  {
    href: "/dashboard/watchlists",
    title: "My Watchlists",
    description: "Organize movies and shows into personal lists.",
    label: "Open watchlists",
  },
  {
    href: "/dashboard/favourites",
    title: "Favourites",
    description: "Keep standout movies and series within easy reach.",
    label: "View favourites",
  },
  {
    href: "/dashboard/reviews",
    title: "My Reviews",
    description: "Manage the public notes and ratings you have written.",
    label: "View reviews",
  },
  {
    href: "/dashboard/planned",
    title: "Planned Watching",
    description: "Check titles you have marked for future watching.",
    label: "See planned titles",
  },
  {
    href: "/movies",
    title: "Browse Movies",
    description: "Search the public movie catalog and find something new.",
    label: "Browse movies",
  },
  {
    href: "/series",
    title: "Browse Series",
    description: "Explore series, seasons, and episode guides.",
    label: "Browse series",
  },
];

const getPanelLinks = (role: UserRole) => {
  if (role === "admin") {
    return [
      {
        href: "/admin",
        title: "Admin Panel",
        description: "Manage users, roles, messages, and high-level catalog oversight.",
        label: "Open admin panel",
        tone: "admin" as const,
      },
      {
        href: "/editor",
        title: "Editor Panel",
        description: "Create and maintain movies, series, seasons, and episodes.",
        label: "Open editor panel",
        tone: "editor" as const,
      },
    ];
  }

  if (role === "editor") {
    return [
      {
        href: "/editor",
        title: "Editor Panel",
        description: "Create and maintain movies, series, seasons, and episodes.",
        label: "Open editor panel",
        tone: "editor" as const,
      },
    ];
  }

  return [];
};

export function DashboardNav({ role }: DashboardNavProps) {
  const panelLinks = getPanelLinks(role);

  return (
    <section className="space-y-6" aria-labelledby="dashboard-navigation-heading">
      <div>
        <h2 id="dashboard-navigation-heading" className="text-xl font-semibold tracking-tight">
          Your Watchloom
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          These areas are ready for the authenticated features coming next.
        </p>
      </div>

      {panelLinks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-label="Role panels">
          {panelLinks.map((link) => (
            <DashboardCard key={link.href} {...link} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardLinks.map((link) => (
          <DashboardCard key={`${link.href}:${link.title}`} {...link} />
        ))}
      </div>
    </section>
  );
}
