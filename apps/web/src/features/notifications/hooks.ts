/** Re-exports aligned with `features/*` layout; canonical keys live on `orderKeys.notifications`. */

export {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/features/orders/hooks";
export { orderKeys as notificationQueryKeys } from "@/features/orders/hooks";
