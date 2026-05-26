import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null);

const optionalPositiveInteger = z
  .string()
  .trim()
  .transform((value) => (value ? Number(value) : null))
  .refine((value) => value === null || (Number.isInteger(value) && value > 0), {
    message: "Enter a positive whole number.",
  });

const optionalDate = z
  .string()
  .trim()
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
    message: "Enter a valid air date.",
  })
  .transform((value) => value || null);

export const editorEpisodeSchema = z.object({
  episodeNumber: z
    .string()
    .trim()
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "Episode number must be a positive whole number.",
    }),
  title: z.string().trim().min(1, "Title is required.").max(200, "Title is too long."),
  overview: optionalText,
  durationMinutes: optionalPositiveInteger,
  airDate: optionalDate,
});

export type EditorEpisodeInput = z.infer<typeof editorEpisodeSchema>;
