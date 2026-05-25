"use client";

import Link from "next/link";
import { useState } from "react";

import { resetPasswordSchema } from "@/lib/validations/auth";

type ResetPasswordFormProps = {
  token: string | null;
};

type ApiResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

type FieldErrors = {
  token?: string;
  password?: string;
  confirmPassword?: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(token ? null : "Reset token is missing.");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setSuccessMessage(null);

    const parsedInput = resetPasswordSchema.safeParse({ token, password });
    const nextFieldErrors: FieldErrors = {};

    if (!parsedInput.success) {
      const errors = parsedInput.error.flatten().fieldErrors;
      nextFieldErrors.token = errors.token?.[0];
      nextFieldErrors.password = errors.password?.[0];
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
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedInput.data),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        setFormError(result.success ? "Unable to reset password." : result.error);
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setSuccessMessage(result.message);
    } catch {
      setFormError("Unable to reset password right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {successMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          {successMessage}
        </div>
      ) : null}

      {formError || fieldErrors.token ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {formError ?? fieldErrors.token}
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="reset-password"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          New password
        </label>
        <input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={!token || Boolean(successMessage)}
          aria-invalid={fieldErrors.password ? "true" : "false"}
          aria-describedby={fieldErrors.password ? "reset-password-error" : undefined}
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          placeholder="At least 8 characters"
        />
        {fieldErrors.password ? (
          <p id="reset-password-error" className="text-sm text-red-600 dark:text-red-300">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="reset-confirm-password"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Confirm new password
        </label>
        <input
          id="reset-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={!token || Boolean(successMessage)}
          aria-invalid={fieldErrors.confirmPassword ? "true" : "false"}
          aria-describedby={
            fieldErrors.confirmPassword ? "reset-confirm-password-error" : undefined
          }
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          placeholder="Repeat new password"
        />
        {fieldErrors.confirmPassword ? (
          <p id="reset-confirm-password-error" className="text-sm text-red-600 dark:text-red-300">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={!token || Boolean(successMessage) || isSubmitting}
        className="flex h-11 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
      >
        {isSubmitting ? "Resetting password..." : "Reset password"}
      </button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href="/login"
          className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
        >
          Return to login
        </Link>
      </p>
    </form>
  );
}
