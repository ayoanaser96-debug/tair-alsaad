import { disputeRowSchema, type DisputeRow } from "@/features/disputes/schemas";
import { unwrap, type RawShipment } from "@/lib/api/adapters";
import { apiRequestUnchecked } from "@/lib/api/client";

type RawDisputeShipment = RawShipment & {
  dispute?: { reason?: string; openedAt?: string; resolved?: boolean };
};

/**
 * Real API: GET /admin/disputes -> { ok, data: { items, total } } where items are
 * shipment documents with a `dispute` subdocument. Mapped to the web's DisputeRow.
 */
export async function fetchDisputesListApi(): Promise<DisputeRow[]> {
  try {
    const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/admin/disputes" });
    const data = unwrap<{ items?: RawDisputeShipment[] }>(raw);
    return (data.items ?? []).map((s) =>
      disputeRowSchema.parse({
        id: String(s._id ?? s.id ?? ""),
        type: "shipment",
        orderId: s.trackingCode ?? String(s._id ?? ""),
        parties: s.receiver?.name ?? "—",
        reportedAt: s.dispute?.openedAt ?? new Date().toISOString(),
        priority: "medium" as const,
        assignee: null,
        status: s.dispute?.resolved ? ("resolved" as const) : ("open" as const),
      }),
    );
  } catch {
    return [];
  }
}
