import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { contactMessages, users } from "@/db/schema";

type ContactMessageStatus = "new" | "read" | "resolved";

export type AdminContactMessageListItem = typeof contactMessages.$inferSelect & {
  linkedUser: {
    id: number;
    username: string;
    email: string;
    role: string;
  } | null;
};

export class AdminMessageServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "MESSAGE_NOT_FOUND" | "INVALID_STATUS" | "USER_NOT_FOUND",
  ) {
    super(message);
    this.name = "AdminMessageServiceError";
  }
}

const messageSelect = {
  message: contactMessages,
  user: {
    id: users.id,
    username: users.name,
    email: users.email,
    role: users.role,
  },
};

const toAdminMessage = (row: {
  message: typeof contactMessages.$inferSelect;
  user: { id: number; username: string; email: string; role: string } | null;
}): AdminContactMessageListItem => ({
  ...row.message,
  linkedUser: row.user,
});

const assertMessageExists = async (messageId: number) => {
  const message = await getAdminContactMessageById(messageId);

  if (!message) {
    throw new AdminMessageServiceError("Message was not found.", "MESSAGE_NOT_FOUND");
  }

  return message;
};

export const isEditorRequest = (message: Pick<AdminContactMessageListItem, "subject" | "message">) => {
  const text = `${message.subject} ${message.message}`.toLowerCase();

  return text.includes("editor") && (text.includes("request") || text.includes("access"));
};

export const getAdminContactMessages = async () => {
  const rows = await db
    .select(messageSelect)
    .from(contactMessages)
    .leftJoin(users, eq(contactMessages.userId, users.id))
    .orderBy(asc(contactMessages.status), desc(contactMessages.createdAt));

  return rows.map(toAdminMessage);
};

export const getAdminContactMessageById = async (messageId: number) => {
  const [row] = await db
    .select(messageSelect)
    .from(contactMessages)
    .leftJoin(users, eq(contactMessages.userId, users.id))
    .where(eq(contactMessages.id, messageId))
    .limit(1);

  return row ? toAdminMessage(row) : null;
};

export const updateAdminContactMessageStatus = async (
  messageId: number,
  status: ContactMessageStatus,
) => {
  if (status !== "new" && status !== "read" && status !== "resolved") {
    throw new AdminMessageServiceError("Invalid message status.", "INVALID_STATUS");
  }

  await assertMessageExists(messageId);

  const [message] = await db
    .update(contactMessages)
    .set({ status, updatedAt: new Date() })
    .where(eq(contactMessages.id, messageId))
    .returning();

  return message;
};

export const deleteAdminContactMessage = async (messageId: number) => {
  const [deleted] = await db
    .delete(contactMessages)
    .where(eq(contactMessages.id, messageId))
    .returning({ id: contactMessages.id });

  if (!deleted) {
    throw new AdminMessageServiceError("Message was not found.", "MESSAGE_NOT_FOUND");
  }

  return true;
};

export const promoteMessageUserToEditor = async (messageId: number) => {
  const message = await assertMessageExists(messageId);

  if (!message.linkedUser) {
    throw new AdminMessageServiceError("Message is not linked to a user.", "USER_NOT_FOUND");
  }

  const [user] = await db
    .update(users)
    .set({ role: "editor", updatedAt: new Date() })
    .where(eq(users.id, message.linkedUser.id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  if (!user) {
    throw new AdminMessageServiceError("Linked user was not found.", "USER_NOT_FOUND");
  }

  await updateAdminContactMessageStatus(messageId, "resolved");

  return user;
};
