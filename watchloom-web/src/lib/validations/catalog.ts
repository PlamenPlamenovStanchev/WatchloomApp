import { z } from "zod";

const optionalPositiveInteger = (defaultValue: number) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((value) => {
      if (value === undefined || value === null || value === "") {
        return defaultValue;
      }

      return typeof value === "string" ? Number(value) : value;
    })
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "Enter a positive whole number.",
    });

export const catalogQuerySchema = z.object({
  page: optionalPositiveInteger(1),
  pageSize: optionalPositiveInteger(12).refine((value) => value <= 100, {
    message: "Page size must be 100 or less.",
  }),
  search: z
    .string()
    .trim()
    .max(100, "Search query is too long.")
    .optional()
    .transform((value) => value || undefined),
});

export type CatalogQueryInput = z.infer<typeof catalogQuerySchema>;
