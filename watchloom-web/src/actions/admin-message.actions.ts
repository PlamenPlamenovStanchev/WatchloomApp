"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  AdminMessageServiceError,
  deleteAdminContactMessage,
  promoteMessageUserToEditor,
  updateAdminContactMessageStatus,
} from "@/services/admin-message.service";

type ContactMessageStatus = "new" | "read" | "resolved";

const requireAdmin = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin/contact-messages");
  }

  if (user.role !== "admin") {
    redirect("/forbidden");
  }

  return user;
};

const parseMessageId = (value: string) => {
  const messageId = Number(value);

  if (!Number.isInteger(messageId) || messageId <= 0) {
    notFound();
  }

  return messageId;
};

const redirectWithError = (messageId: number, message: string): never => {
  redirect(`/admin/contact-messages/${messageId}?error=${encodeURIComponent(message)}`);
};

const redirectWithSuccess = (messageId: number, message: string): never => {
  redirect(`/admin/contact-messages/${messageId}?success=${encodeURIComponent(message)}`);
};

export async function updateAdminMessageStatusAction(
  messageIdValue: string,
  status: ContactMessageStatus,
) {
  await requireAdmin();

  const messageId = parseMessageId(messageIdValue);

  try {
    await updateAdminContactMessageStatus(messageId, status);
    revalidatePath("/admin/contact-messages");
    revalidatePath(`/admin/contact-messages/${messageId}`);
  } catch (error) {
    if (error instanceof AdminMessageServiceError) {
      redirectWithError(messageId, error.message);
    }
    throw error;
  }

  redirectWithSuccess(messageId, "Message status updated.");
}

export async function deleteAdminMessageAction(messageIdValue: string) {
  await requireAdmin();

  const messageId = parseMessageId(messageIdValue);

  try {
    await deleteAdminContactMessage(messageId);
    revalidatePath("/admin/contact-messages");
  } catch (error) {
    if (error instanceof AdminMessageServiceError) {
      redirectWithError(messageId, error.message);
    }
    throw error;
  }

  redirect("/admin/contact-messages");
}

export async function promoteMessageUserToEditorAction(messageIdValue: string) {
  await requireAdmin();

  const messageId = parseMessageId(messageIdValue);

  try {
    await promoteMessageUserToEditor(messageId);
    revalidatePath("/admin/contact-messages");
    revalidatePath(`/admin/contact-messages/${messageId}`);
    revalidatePath("/admin/users");
  } catch (error) {
    if (error instanceof AdminMessageServiceError) {
      redirectWithError(messageId, error.message);
    }
    throw error;
  }

  redirectWithSuccess(messageId, "Linked user promoted to editor.");
}
