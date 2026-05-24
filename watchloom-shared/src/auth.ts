export type UserRole = "user" | "editor" | "admin";

export interface AuthUserDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
