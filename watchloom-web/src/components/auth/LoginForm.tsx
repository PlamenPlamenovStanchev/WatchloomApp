"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginSchema } from "@/lib/validations/auth";

type LoginFormProps = {
  registered?: boolean;
  error?: string | null;
};

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
  password?: string;
};

const getApiErrorMessage = (response: AuthApiResponse<unknown>) => {
  if (response.success) {
    return null;
  }

  return typeof response.error === "string"
    ? response.error
    : response.error.message ?? "Something went wrong.";
};

export function LoginForm({ registered = false, error = null }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(error === "google_auth_failed" ? "Google authentication failed. Please try again." : null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsedInput = loginSchema.safeParse({ email, password });

    if (!parsedInput.success) {
      setFieldErrors({
        email: parsedInput.error.flatten().fieldErrors.email?.[0],
        password: parsedInput.error.flatten().fieldErrors.password?.[0],
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedInput.data),
      });
      const result = (await response.json()) as AuthApiResponse<unknown>;

      if (!response.ok || !result.success) {
        setFormError(getApiErrorMessage(result) ?? "Invalid email or password");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("Unable to log in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {registered ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          Account created. Log in to continue.
        </div>
      ) : null}

      {formError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {formError}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="login-email" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={fieldErrors.email ? "true" : "false"}
          aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          placeholder="you@example.com"
        />
        {fieldErrors.email ? (
          <p id="login-email-error" className="text-sm text-red-600 dark:text-red-300">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="login-password"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={fieldErrors.password ? "true" : "false"}
          aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          placeholder="Your password"
        />
        {fieldErrors.password ? (
          <p id="login-password-error" className="text-sm text-red-600 dark:text-red-300">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
      >
        {isSubmitting ? "Logging in..." : "Log in"}
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
        <Link
          href="/forgot-password"
          className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
        >
          Forgot your password?
        </Link>
      </p>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        New to Watchloom?{" "}
        <Link href="/register" className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50">
          Create an account
        </Link>
      </p>
    </form>
  );
}
