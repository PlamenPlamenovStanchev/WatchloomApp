"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getFirstValidationMessage } from "@/lib/validations/common";
import { createContactMessage } from "@/services/admin-message.service";

const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(255, "Email is too long."),
  subject: z.string().trim().min(1, "Subject is required.").max(200, "Subject is too long."),
  message: z.string().trim().min(1, "Message is required.").max(5000, "Message is too long."),
});

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
};

const redirectWithError = (message: string): never => {
  redirect(`/contact?error=${encodeURIComponent(message)}`);
};

export async function createContactMessageAction(formData: FormData) {
  const user = await getCurrentUser();
  const parsed = contactMessageSchema.safeParse({
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    subject: getString(formData, "subject"),
    message: getString(formData, "message"),
  });

  if (!parsed.success) {
    redirectWithError(getFirstValidationMessage(parsed.error));
  }

  const input = parsed.data!;

  await createContactMessage({
    ...input,
    userId: user?.id ?? null,
  });

  revalidatePath("/admin/contact-messages");
  revalidatePath("/admin");
  redirect("/contact?success=1");
}
