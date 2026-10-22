import { z } from "zod";

export const matchSchema = z
  .object({
    homeTeam: z.string().trim().min(1, "Home team is required"),
    awayTeam: z.string().trim().min(1, "Away team is required"),
    matchDate: z.string().min(1, "Match date is required"),
    competition: z.string().trim().optional(),
  })
  .refine((d) => d.homeTeam.toLowerCase() !== d.awayTeam.toLowerCase(), {
    message: "Teams must be different",
    path: ["awayTeam"],
  });

export type MatchFormValues = z.infer<typeof matchSchema>;