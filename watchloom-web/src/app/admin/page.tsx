import { count, eq } from "drizzle-orm";

import { AdminCard } from "@/components/admin/AdminCard";
import { db } from "@/db";
import { contactMessages, movies, series, users } from "@/db/schema";

export default function AdminPage() {
  const statsPromise = getAdminStats();

  return <AdminOverview statsPromise={statsPromise} />;
}

const getAdminStats = async () => {
  const [[userStats], [adminStats], [editorStats], [movieStats], [seriesStats], [messageStats]] =
    await Promise.all([
      db.select({ total: count() }).from(users),
      db.select({ total: count() }).from(users).where(eq(users.role, "admin")),
      db.select({ total: count() }).from(users).where(eq(users.role, "editor")),
      db.select({ total: count() }).from(movies),
      db.select({ total: count() }).from(series),
      db.select({ total: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
    ]);

  return {
    users: userStats?.total ?? 0,
    admins: adminStats?.total ?? 0,
    editors: editorStats?.total ?? 0,
    movies: movieStats?.total ?? 0,
    series: seriesStats?.total ?? 0,
    newContactMessages: messageStats?.total ?? 0,
  };
};

async function AdminOverview({
  statsPromise,
}: {
  statsPromise: ReturnType<typeof getAdminStats>;
}) {
  const stats = await statsPromise;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Admin summary">
        <AdminCard title="Users" description="Total registered accounts" value={stats.users} />
        <AdminCard title="Admins" description="Accounts with admin access" value={stats.admins} />
        <AdminCard title="Editors" description="Accounts with editor access" value={stats.editors} />
        <AdminCard title="Movies" description="Total movie records" value={stats.movies} />
        <AdminCard title="Series" description="Total series records" value={stats.series} />
        <AdminCard
          title="New Messages"
          description="Unread contact submissions"
          value={stats.newContactMessages}
        />
      </section>

      <section className="space-y-4" aria-labelledby="admin-quick-links-heading">
        <div>
          <h2 id="admin-quick-links-heading" className="text-xl font-semibold tracking-tight">
            Admin areas
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Management tools will be built into these sections next.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AdminCard
            href="/admin/users"
            title="Users"
            description="Review user accounts and roles."
            label="Open users"
          />
          <AdminCard
            href="/admin/contact-messages"
            title="Contact Messages"
            description="Review incoming contact submissions."
            label="Open messages"
          />
          <AdminCard
            href="/admin/catalog"
            title="Catalog"
            description="Monitor catalog administration areas."
            label="Open catalog"
          />
        </div>
      </section>
    </div>
  );
}
