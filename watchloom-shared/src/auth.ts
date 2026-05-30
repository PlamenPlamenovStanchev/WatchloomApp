import { z } from "zod";

export type UserRole = "user" | "editor" | "admin";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().trim().email(),
  username: z.string().trim().min(3).max(80),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export interface AuthUserDto {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}
