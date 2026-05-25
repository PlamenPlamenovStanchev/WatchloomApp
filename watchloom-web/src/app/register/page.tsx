import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <AuthCard
        title="Create account"
        subtitle="Start saving titles, writing reviews, and building your Watchloom lists."
      >
        <RegisterForm />
      </AuthCard>
    </main>
  );
}
