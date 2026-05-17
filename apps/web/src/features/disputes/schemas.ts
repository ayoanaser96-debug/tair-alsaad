import { z } from "zod";

export const disputeRowSchema = z.object({
  id: z.string(),
  type: z.string(),
  orderId: z.string(),
  parties: z.string(),
  reportedAt: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  assignee: z.string().nullable(),
  status: z.enum(["open", "resolved"]),
});

export type DisputeRow = z.infer<typeof disputeRowSchema>;
