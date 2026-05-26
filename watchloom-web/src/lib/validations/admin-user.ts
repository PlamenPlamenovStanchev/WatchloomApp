import { z } from "zod";

export const adminRoleSchema = z.object({
  role: z.enum(["user", "editor", "admin"], {
    message: "Select a valid role.",
  }),
});

export type AdminRoleInput = z.infer<typeof adminRoleSchema>;
