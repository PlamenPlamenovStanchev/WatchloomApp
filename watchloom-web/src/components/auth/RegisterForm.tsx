"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registerSchema } from "@/lib/validations/auth";

type AuthApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string | { message?: string };
    };

type FieldErrors = {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
};

const getApiErrorMessage = (response: AuthApiResponse<unknown>) => {
  if (response.success) {
    return null;
  }

  return typeof response.error === "string"
    ? response.error
    : response.error.message ?? "Something went wrong.";
};

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsedInput = registerSchema.safeParse({ email, username, password });
    const nextFieldErrors: FieldErrors = {};

    if (!parsedInput.success) {
      const flattenedErrors = parsedInput.error.flatten().fieldErrors;
      nextFieldErrors.email = flattenedErrors.email?.[0];
      nextFieldErrors.username = flattenedErrors.username?.[0];
      nextFieldErrors.password = flattenedErrors.password?.[0];
    }

    if (password !== confirmPassword) {
      nextFieldErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.values(nextFieldErrors).some(Boolean) || !parsedInput.success) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedInput.data),
      });
      const result = (await response.json()) as AuthApiResponse<unknown>;

      if (!response.ok || !result.success) {
        setFormError(getApiErrorMessage(result) ?? "Unable to create account.");
        return;
      }

      router.push("/login?registered=1");
      router.refresh();
    } catch {
      setFormError("Unable to create account right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {formError}
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="register-username"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Username
        </label>
        <input
          id="register-username"
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-invalid={fieldErrors.username ? "true" : "false"}
          aria-describedby={fieldErrors.username ? "register-username-error" : undefined}
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          placeholder="Watchloom fan"
        />
        {fieldErrors.username ? (
          <p id="register-username-error" className="text-sm text-red-600 dark:text-red-300">
            {fieldErrors.username}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={fieldErrors.email ? "true" : "false"}
          aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          placeholder="you@example.com"
        />
        {fieldErrors.email ? (
          <p id="register-email-error" className="text-sm text-red-600 dark:text-red-300">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={fieldErrors.password ? "true" : "false"}
          aria-describedby={fieldErrors.password ? "register-password-error" : undefined}
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          placeholder="At least 8 characters"
        />
        {fieldErrors.password ? (
          <p id="register-password-error" className="text-sm text-red-600 dark:text-red-300">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="register-confirm-password"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Confirm password
        </label>
        <input
          id="register-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          aria-invalid={fieldErrors.confirmPassword ? "true" : "false"}
          aria-describedby={
            fieldErrors.confirmPassword ? "register-confirm-password-error" : undefined
          }
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          placeholder="Repeat password"
        />
        {fieldErrors.confirmPassword ? (
          <p id="register-confirm-password-error" className="text-sm text-red-600 dark:text-red-300">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-300 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-50 px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            Or continue with
          </span>
        </div>
      </div>

      <a
        href="/api/auth/google"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:hover:bg-zinc-900 dark:focus:ring-zinc-100"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google
      </a>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50">
          Log in
        </Link>
      </p>
    </form>
  );
}
