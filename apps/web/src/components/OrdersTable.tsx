import type { OrderDTO } from "@/api";
import { OrderStatusBadge } from "@/components/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function OrdersTable({
  orders,
  showSender = false,
  showDriver = false,
}: {
  orders: OrderDTO[];
  showSender?: boolean;
  showDriver?: boolean;
}) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground">No orders yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tracking</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Route</TableHead>
          <TableHead className="text-right">Price</TableHead>
          {showSender ? <TableHead>Sender</TableHead> : null}
          {showDriver ? <TableHead>Driver</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((o) => (
          <TableRow key={o.id}>
            <TableCell className="font-mono text-xs">{o.trackingCode}</TableCell>
            <TableCell>
              <OrderStatusBadge status={o.status} size="sm" />
            </TableCell>
            <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground" title={`${o.pickupAddress} → ${o.dropAddress}`}>
              {o.city.name}: pickup → drop-off
            </TableCell>
            <TableCell className="text-right">{o.price}</TableCell>
            {showSender ? <TableCell className="text-xs">{o.sender.name}</TableCell> : null}
            {showDriver ? (
              <TableCell className="text-xs">{o.driver?.name ?? "—"}</TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
