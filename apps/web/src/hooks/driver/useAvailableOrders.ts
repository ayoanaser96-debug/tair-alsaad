/**
 * Available orders for drivers (polls when online).
 * Data comes from GET /orders (driver bundle); maps to legacy AvailableOffer UI shape.
 */
export { useAvailableOrdersList as useAvailableOrders } from "@/features/drivers/hooks";
