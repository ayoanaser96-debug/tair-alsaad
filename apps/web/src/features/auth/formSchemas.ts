import type { TFunction } from "i18next";
import { z } from "zod";

export function createLoginFormSchema(t: TFunction) {
  return z.object({
    phone: z
      .string()
      .min(1, { message: t("auth.validation.phone.required") })
      .min(3, { message: t("auth.validation.phone.minLogin") }),
    password: z.string().min(1, { message: t("auth.validation.password.required") }),
  });
}

export function createRegisterFormSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, { message: t("auth.validation.name.required") }),
    phone: z
      .string()
      .min(1, { message: t("auth.validation.phone.required") })
      .min(5, { message: t("auth.validation.phone.minRegister") }),
    password: z
      .string()
      .min(1, { message: t("auth.validation.password.required") })
      .min(8, { message: t("auth.validation.password.minRegister") }),
    role: z.enum(["SENDER", "DRIVER", "ADMIN"]),
    cityId: z.string().optional(),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>;
export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterFormSchema>>;
