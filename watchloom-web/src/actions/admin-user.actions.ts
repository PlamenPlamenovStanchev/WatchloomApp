"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getFirstValidationMessage } from "@/lib/validations/common";
import { adminRoleSchema } from "@/lib/validations/admin-user";
import {
  AdminUserServiceError,
  deleteAdminUser,
  updateAdminUserActiveStatus,
  updateAdminUserRole,
} from "@/services/admin-user.service";

const requireAdmin = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin/users");
  }

  if (user.role !== "admin") {
    redirect("/forbidden");
  }

  return user;
};

const parseUserId = (value: string) => {
  const userId = Number(value);

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  return userId;
};

const redirectWithError = (userId: number, message: string): never => {
  redirect(`/admin/users/${userId}?error=${encodeURIComponent(message)}`);
};

const redirectToUsersWithSuccess = (message: string): never => {
  redirect(`/admin/users?success=${encodeURIComponent(message)}`);
};

export async function updateAdminUserRoleAction(userIdValue: string, formData: FormData) {
  const currentAdmin = await requireAdmin();
  const userId = parseUserId(userIdValue);
  const parsed = adminRoleSchema.safeParse({
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirectWithError(userId, getFirstValidationMessage(parsed.error));
  }

  try {
    const user = await updateAdminUserRole(currentAdmin.id, userId, parsed.data!.role);

    if (!user) {
      notFound();
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
  } catch (error) {
    if (error instanceof AdminUserServiceError) {
      redirectWithError(userId, error.message);
    }
    throw error;
  }

  redirectToUsersWithSuccess("Role updated.");
}

export async function updateAdminUserActiveAction(userIdValue: string, formData: FormData) {
  const currentAdmin = await requireAdmin();
  const userId = parseUserId(userIdValue);
  const isActive = formData.get("isActive") === "true";

  try {
    const user = await updateAdminUserActiveStatus(currentAdmin.id, userId, isActive);

    if (!user) {
      notFound();
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
  } catch (error) {
    if (error instanceof AdminUserServiceError) {
      redirectWithError(userId, error.message);
    }
    throw error;
  }

  redirectToUsersWithSuccess(isActive ? "User activated." : "User deactivated.");
}

export async function deleteAdminUserAction(userIdValue: string) {
  const currentAdmin = await requireAdmin();
  const userId = parseUserId(userIdValue);

  try {
    await deleteAdminUser(currentAdmin.id, userId);

    revalidatePath("/admin/users");
  } catch (error) {
    if (error instanceof AdminUserServiceError) {
      redirectWithError(userId, error.message);
    }
    throw error;
  }

  redirect("/admin/users");
}
