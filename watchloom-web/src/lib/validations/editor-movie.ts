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

export const slugifyMovieTitle = (title: string) => {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const editorMovieSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(200, "Title is too long."),
    slug: z.string().trim().max(220, "Slug is too long."),
    overview: optionalText,
    releaseYear: optionalPositiveInteger,
    durationMinutes: optionalPositiveInteger,
    director: optionalText,
    writer: optionalText,
    cast: optionalText,
    posterUrl: optionalUrl,
    backdropUrl: optionalUrl,
    genreIds: z.array(z.coerce.number().int().positive()).default([]),
  })
  .transform((input) => ({
    ...input,
    slug: input.slug || slugifyMovieTitle(input.title),
  }))
  .refine((input) => input.slug.length > 0, {
    message: "Slug is required.",
    path: ["slug"],
  })
  .refine((input) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug), {
    message: "Slug can contain lowercase letters, numbers, and hyphens.",
    path: ["slug"],
  });

export type EditorMovieInput = z.infer<typeof editorMovieSchema>;
