import Link from "next/link";

type DashboardCardProps = {
  title: string;
  description: string;
  href?: string;
  label?: string;
  value?: string;
};

export function DashboardCard({ href, title, description, label, value }: DashboardCardProps) {
  const content = (
    <>
      <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-orange-100 text-sm font-semibold text-orange-800 transition group-hover:rotate-3 group-hover:scale-105 dark:bg-orange-950/40 dark:text-orange-200">
        {title.slice(0, 1)}
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      {value ? (
        <p className="mt-5 text-sm font-medium text-zinc-950 dark:text-zinc-50">{value}</p>
      ) : null}
      {label ? (
        <p className="mt-5 text-sm font-semibold text-orange-700 transition group-hover:translate-x-1 dark:text-orange-300">
          {label} →
        </p>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <div className="watchloom-surface rounded-3xl p-5">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="watchloom-surface group rounded-3xl p-5 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/15 dark:hover:border-orange-900/60"
    >
      {content}
    </Link>
  );
}
