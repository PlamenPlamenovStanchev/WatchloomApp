import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <AuthCard
        title="Reset your password"
        subtitle="Enter your account email and we will generate a secure reset link if the account exists."
      >
        <ForgotPasswordForm />
      </AuthCard>
    </main>
  );
}
