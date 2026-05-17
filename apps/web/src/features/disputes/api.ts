import { z } from "zod";

import { disputeRowSchema, type DisputeRow } from "@/features/disputes/schemas";
import { apiRequestUnchecked } from "@/lib/api/client";

const listSchema = z.array(disputeRowSchema);

export async function fetchDisputesListApi(): Promise<DisputeRow[]> {
  try {
    const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/admin/disputes" });
    return listSchema.parse(raw);
  } catch {
    return [];
  }
}
