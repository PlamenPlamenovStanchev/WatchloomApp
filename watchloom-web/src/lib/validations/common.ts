import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("A valid email is required.");

export const passwordSchema = z.string();

export const getFirstValidationMessage = (error: z.ZodError) => {
  return error.issues[0]?.message ?? "Invalid input.";
};
