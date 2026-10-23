import { z } from "zod";

export const jerseyPlayerSchema = z.looseObject({
  team: z.unknown().optional(), number: z.unknown().optional(), name: z.string().optional(),
  role: z.unknown().optional(), tracked_moments: z.unknown().optional(), confidence: z.number().optional(),
});
export const resultHeaderSchema = z.looseObject({ title: z.unknown().optional(), score: z.unknown().optional() });
export const statsSchema = z.array(z.unknown());
export const eventsSchema = z.array(z.unknown());
export const jerseyMapSchema = z.array(jerseyPlayerSchema);
export type JerseyPlayer = z.infer<typeof jerseyPlayerSchema>;

export const parseResultHeader = (value: unknown) => resultHeaderSchema.safeParse(value);
export const parseStats = (value: unknown) => statsSchema.safeParse(value);
export const parseEvents = (value: unknown) => eventsSchema.safeParse(value);
export const parseJerseyMap = (value: unknown) => jerseyMapSchema.safeParse(value);
