/**
 * Available orders for drivers (polls when online).
 * Data comes from GET /driver/active-shipment (+ future /shipments/feed); maps to legacy AvailableOffer UI shape.
 */
export { useAvailableOrdersList as useAvailableOrders } from "@/features/drivers/hooks";
