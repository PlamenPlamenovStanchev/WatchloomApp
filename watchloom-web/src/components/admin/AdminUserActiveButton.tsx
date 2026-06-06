"use client";

type AdminUserActiveButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  isActive: boolean;
};

export function AdminUserActiveButton({ action, isActive }: AdminUserActiveButtonProps) {
  const nextActiveValue = isActive ? "false" : "true";
  const label = isActive ? "Deactivate" : "Activate";
  const confirmationMessage = isActive
    ? "Deactivate this user? They will no longer be able to use their account until reactivated."
    : "Reactivate this user account?";

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmationMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="isActive" value={nextActiveValue} />
      <button
        type="submit"
        className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:hover:bg-zinc-900"
      >
        {label}
      </button>
    </form>
  );
}
