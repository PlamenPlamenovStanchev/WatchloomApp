import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardPage() {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard summary">
        <DashboardCard title="Watchlists" value="Coming soon" description="Personal lists placeholder" />
        <DashboardCard title="Favourites" value="Coming soon" description="Saved titles placeholder" />
        <DashboardCard title="Reviews" value="Coming soon" description="Review activity placeholder" />
        <DashboardCard title="Planned" value="Coming soon" description="Future watching placeholder" />
      </section>
      <DashboardNav />
    </>
  );
}
