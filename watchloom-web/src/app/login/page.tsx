import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

type LoginPageProps = {
  searchParams?: Promise<{
    registered?: string | string[];
  }>;
};

const getSearchParam = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const registered = getSearchParam(params.registered) === "1";

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <AuthCard
        title="Log in"
        subtitle="Access your watchlists, reviews, favourites, and account features."
      >
        <LoginForm registered={registered} />
      </AuthCard>
    </main>
  );
}
