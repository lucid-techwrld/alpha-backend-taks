import {z} from "zod"


const decisions = ['advance', 'hold', 'reject'] as const;

export const SummarySchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  summary: z.string(),
  recommendedDecision: z.enum(decisions),
});
