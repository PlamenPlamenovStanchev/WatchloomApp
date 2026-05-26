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
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      {value ? (
        <p className="mt-5 text-sm font-medium text-zinc-950 dark:text-zinc-50">{value}</p>
      ) : null}
      {label ? (
        <p className="mt-5 text-sm font-medium text-zinc-950 dark:text-zinc-50">{label}</p>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:ring-zinc-100"
    >
      {content}
    </Link>
  );
}
