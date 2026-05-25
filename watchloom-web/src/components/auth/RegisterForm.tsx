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

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50">
          Log in
        </Link>
      </p>
    </form>
  );
}
