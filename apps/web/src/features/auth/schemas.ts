import { z } from "zod";

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  role: z.string(),
  cityId: z.string().nullable(),
  createdAt: z.string(),
});

export const meUserSchema = authUserSchema.extend({
  city: z.object({ id: z.string(), name: z.string(), country: z.string() }).nullable(),
  wallet: z.object({ id: z.string(), balance: z.number() }).nullable(),
});

export const authResponseSchema = z.object({
  user: authUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const meResponseSchema = z.object({
  user: meUserSchema,
});

export const tokensResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const loginInputSchema = z.object({
  phone: z.string().min(3),
  password: z.string().min(1),
});

export const registerInputSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  password: z.string().min(8),
  role: z.enum(["SENDER", "DRIVER"]),
  cityId: z.string().nullable().optional(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type MeUser = z.infer<typeof meUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;
