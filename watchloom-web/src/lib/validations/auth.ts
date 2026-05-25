import { z } from "zod";

import { emailSchema, passwordSchema } from "./common";

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(1, "Password is required."),
});

export const registerSchema = z.object({
  email: emailSchema,
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(80, "Username must be at most 80 characters."),
  password: passwordSchema.min(8, "Password must be at least 8 characters."),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required."),
  password: passwordSchema.min(8, "Password must be at least 8 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
