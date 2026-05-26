import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null);

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => !value || URL.canParse(value), "Enter a valid URL.")
  .transform((value) => value || null);

const optionalPositiveInteger = z
  .string()
  .trim()
  .transform((value) => (value ? Number(value) : null))
  .refine((value) => value === null || (Number.isInteger(value) && value > 0), {
    message: "Enter a positive whole number.",
  });

export const editorSeasonSchema = z.object({
  seasonNumber: z
    .string()
    .trim()
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "Season number must be a positive whole number.",
    }),
  title: optionalText,
  releaseYear: optionalPositiveInteger,
  posterUrl: optionalUrl,
});

export type EditorSeasonInput = z.infer<typeof editorSeasonSchema>;
