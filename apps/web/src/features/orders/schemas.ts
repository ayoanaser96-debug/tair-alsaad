import { z } from "zod";

export const statusLogEntrySchema = z.object({
  id: z.string(),
  status: z.string(),
  note: z.string().nullable(),
  createdAt: z.string(),
});

export const orderDtoSchema = z.object({
  id: z.string(),
  trackingCode: z.string(),
  status: z.string(),
  price: z.number(),
  receiverName: z.string(),
  receiverPhone: z.string(),
  pickupAddress: z.string(),
  dropAddress: z.string(),
  packageType: z.string(),
  paymentStatus: z.string(),
  createdAt: z.string(),
  sender: z.object({ id: z.string(), name: z.string(), phone: z.string() }),
  driver: z
    .object({
      id: z.string(),
      name: z.string(),
      phone: z.string(),
    })
    .nullable(),
  city: z.object({ id: z.string(), name: z.string(), country: z.string() }),
});

export const orderDetailSchema = orderDtoSchema.extend({
  paymentMethod: z.string().optional().default(""),
  notes: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
  extras: z.record(z.unknown()).nullable(),
  deliveryWindow: z.string().nullable(),
  scheduledAt: z.string().nullable(),
  rating: z.number().nullable(),
  reviewComment: z.string().nullable(),
  podPhotoUrl: z.string().nullable(),
  podSignatureUrl: z.string().nullable(),
  driver: z
    .object({
      id: z.string(),
      name: z.string(),
      phone: z.string(),
      avatarUrl: z.string().nullable(),
      vehicleInfo: z.string().nullable(),
    })
    .nullable(),
  statusHistory: z.array(statusLogEntrySchema),
});

export const senderOrderListSchema = z.object({
  orders: z.array(orderDetailSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
});

export const senderStatsSchema = z.object({
  totals: z.object({
    total: z.number(),
    inTransit: z.number(),
    delivered: z.number(),
    pendingPickup: z.number(),
  }),
  trends: z.object({
    total: z.number(),
    inTransit: z.number(),
    delivered: z.number(),
    pendingPickup: z.number(),
  }),
  deltaPct: z.object({
    total: z.number(),
    inTransit: z.number(),
    delivered: z.number(),
    pendingPickup: z.number(),
  }),
});

export type OrderDTO = z.infer<typeof orderDtoSchema>;
export type OrderDetail = z.infer<typeof orderDetailSchema>;
export type SenderOrderList = z.infer<typeof senderOrderListSchema>;
export type SenderStats = z.infer<typeof senderStatsSchema>;

export const rateOrderBodySchema = z.object({
  rating: z.number(),
  comment: z.string(),
});

export const savedAddressSchema = z.object({
  id: z.string(),
  label: z.string(),
  line1: z.string(),
  cityId: z.string().nullable(),
  phone: z.string().nullable(),
  contactName: z.string().nullable(),
  city: z
    .object({
      id: z.string(),
      name: z.string(),
      country: z.string(),
    })
    .nullable(),
});
export type SavedAddress = z.infer<typeof savedAddressSchema>;

export const savedAddressesResponseSchema = z.object({
  addresses: z.array(savedAddressSchema),
});

export const createSavedAddressBodySchema = z.object({
  label: z.string(),
  line1: z.string(),
  cityId: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  contactName: z.string().nullable().optional(),
});

export const updateSavedAddressBodySchema = createSavedAddressBodySchema.partial();

export const savedAddressSingleResponseSchema = z.object({
  address: savedAddressSchema,
});

export const appNotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  read: z.boolean(),
  orderId: z.string().nullable(),
  createdAt: z.string(),
});
export type AppNotification = z.infer<typeof appNotificationSchema>;

export const notificationsResponseSchema = z.object({
  notifications: z.array(appNotificationSchema),
});

export const savedPaymentMethodSchema = z.object({
  id: z.string(),
  label: z.string(),
  last4: z.string(),
  brand: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
});
export type SavedPaymentMethod = z.infer<typeof savedPaymentMethodSchema>;

export const paymentMethodsResponseSchema = z.object({
  paymentMethods: z.array(savedPaymentMethodSchema),
});

export const createPaymentMethodBodySchema = z.object({
  label: z.string(),
  last4: z.string(),
  brand: z.string(),
  isDefault: z.boolean().optional(),
});

export const paymentMethodSingleResponseSchema = z.object({
  paymentMethod: savedPaymentMethodSchema,
});

export const orderDetailResponseSchema = z.object({
  order: orderDetailSchema,
});
