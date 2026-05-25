"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginSchema } from "@/lib/validations/auth";

type LoginFormProps = {
  registered?: boolean;
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

export function LoginForm({ registered = false }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
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
