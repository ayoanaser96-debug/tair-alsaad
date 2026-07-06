import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const addressSchema = z.object({
  label: z.string().optional(),
  city: z.string().min(1),
  area: z.string().min(1),
  street: z.string().optional(),
  building: z.string().optional(),
  notes: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

export const otpRequestSchema = z.object({
  phone: z.string().min(6),
});

export const otpVerifySchema = z.object({
  phone: z.string(),
  code: z.string().length(4),
  name: z.string().trim().optional(),
  // Optional role for brand-new signups only. Existing accounts keep their role.
  // Admin is intentionally excluded: it can never be self-registered and is
  // provisioned by staff/seed only.
  role: z.enum(['sender', 'driver']).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const patchMeSchema = z.object({
  name: z.string().optional(),
  preferredLanguage: z.enum(['ar', 'en']).optional(),
  avatarUrl: z.string().url().optional(),
});

export const driverApplySchema = z.object({
  vehicle: z.object({
    type: z.enum(['motorcycle', 'car', 'van']),
    plate: z.string(),
    model: z.string(),
    color: z.string(),
  }),
  documents: z.object({
    idFrontUrl: z.string().url(),
    idBackUrl: z.string().url(),
    licenseUrl: z.string().url(),
    vehicleRegUrl: z.string().url(),
  }),
});

export const driverOnlineSchema = z.object({
  isOnline: z.boolean(),
});

export const driverLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const shipmentPackageQuoteSchema = z.object({
  type: z.enum(['envelope', 'small', 'medium', 'large', 'fragile', 'cold']),
  weightTier: z.enum(['light', 'medium', 'heavy']),
  description: z.string().optional(),
  declaredValue: z.number().optional(),
});

const shipmentQuoteFields = z.object({
  pickup: addressSchema,
  dropoff: addressSchema,
  package: shipmentPackageQuoteSchema,
  service: z.enum(['standard', 'express', 'scheduled']),
  scheduledFor: z.coerce.date().optional(),
});

export const quoteShipmentBodySchema = shipmentQuoteFields.superRefine((val, ctx) => {
  if (val.service === 'scheduled' && !val.scheduledFor) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['scheduledFor'], message: 'required' });
  }
});

export const createShipmentSchema = shipmentQuoteFields
  .extend({
    receiver: z.object({
      name: z.string().min(1),
      phone: z.string(),
    }),
    paymentMethod: z.enum(['cash_on_delivery', 'zaincash', 'fastpay', 'fib', 'asia_hawala']),
  })
  .superRefine((val, ctx) => {
    if (val.service === 'scheduled' && !val.scheduledFor) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['scheduledFor'], message: 'required' });
    }
  });

export const cancelShipmentSchema = z.object({
  reason: z.string().min(3),
});

export const rateShipmentSchema = z.object({
  stars: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  comment: z.string().optional(),
});

export const shipmentPickupVerifySchema = z.object({
  otp: z.string().length(4),
  photoUrl: z.string().url(),
});

export const shipmentDeliverSchema = z.object({
  otp: z.string().length(4),
  photoUrl: z.string().url(),
  signatureUrl: z.string().url().optional(),
});

export const shipmentDisputeSchema = z.object({
  reason: z.string().min(3),
  photoUrls: z.array(z.string().url()).min(1),
});

export const feedQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().min(1).max(50).default(15),
});

export const shipmentsMineQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional(),
});

export const disputeResolveSchema = z.object({
  resolution: z.string().min(3),
  refundAmount: z.number().optional(),
});

export const adminDriverStatusSchema = z.object({
  status: z.enum(['pending_review', 'active', 'suspended', 'rejected']),
  reason: z.string().optional(),
});

export const adminPayoutProcessSchema = z.object({
  reference: z.string(),
});

export const adminShipmentsQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional(),
  city: z.string().optional(),
  trackingCode: z.string().optional(),
});

export const adminDisputesQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['open', 'resolved']).optional(),
});

export const adminDriversQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending_review', 'active', 'suspended', 'rejected']).optional(),
});

/** Partial city payload for PATCH /admin/cities/:id (matches City model fields loosely). */
export const adminCityPatchSchema = z
  .object({
    key: z.string().min(1).optional(),
    nameAr: z.string().min(1).optional(),
    nameEn: z.string().min(1).optional(),
    active: z.boolean().optional(),
    pricing: z
      .object({
        baseFare: z.number().optional(),
        perKm: z.number().optional(),
        minimumFare: z.number().optional(),
        packageMultipliers: z.record(z.string(), z.number()).optional(),
        serviceMultipliers: z.record(z.string(), z.number()).optional(),
      })
      .optional(),
    zones: z
      .array(
        z.object({
          name: z.string().min(1),
          polygon: z.array(z.array(z.array(z.number()))),
          surcharge: z.number(),
        }),
      )
      .optional(),
  })
  .strict();

export const mongoIdSchema = z.string().regex(/^[a-f0-9]{24}$/);
