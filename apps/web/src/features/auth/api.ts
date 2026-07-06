import { apiRequestUnchecked } from "@/lib/api/client";
import {
  authResponseSchema,
  meResponseSchema,
  tokensResponseSchema,
  type AuthResponse,
  type LoginInput,
  type MeUser,
  type RegisterInput,
} from "@/features/auth/schemas";

type ApiOk<T> = { ok: true; data: T };

type BackendUser = {
  id?: string;
  _id?: string;
  name?: string;
  phone?: string;
  role?: string;
  createdAt?: string;
};

function normalizeRole(role: string | undefined): "SENDER" | "DRIVER" | "ADMIN" {
  const raw = (role ?? "").toLowerCase();
  if (raw === "admin") return "ADMIN";
  if (raw === "driver") return "DRIVER";
  return "SENDER";
}

function mapBackendUser(user: BackendUser) {
  return {
    id: String(user.id ?? user._id ?? ""),
    name: String(user.name ?? ""),
    phone: String(user.phone ?? ""),
    email: null,
    role: normalizeRole(user.role),
    cityId: null,
    createdAt: String(user.createdAt ?? new Date().toISOString()),
  };
}

function unwrapOk<T>(body: unknown): T {
  const b = body as ApiOk<T> | { ok: false; error?: { messageEn?: string; message?: string } };
  if (!b || typeof b !== "object" || !("ok" in b)) throw new Error("Unexpected API response");
  if (!b.ok) {
    const e = b.error;
    throw new Error((e?.messageEn ?? e?.message ?? "Request failed").trim());
  }
  return b.data;
}

export async function loginApi(body: LoginInput): Promise<AuthResponse> {
  const phone = body.phone.trim();
  const requestRes = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/auth/otp/request",
    data: { phone },
  });
  const requestData = unwrapOk<{ devCode?: string }>(requestRes);
  const code = requestData.devCode;
  if (!code) {
    throw new Error("OTP code not available in this environment. Use mobile OTP flow.");
  }
  const verifyRes = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/auth/otp/verify",
    data: { phone, code },
  });
  const verifyData = unwrapOk<{
    user: BackendUser;
    accessToken: string;
    refreshToken: string;
  }>(verifyRes);
  return authResponseSchema.parse({
    user: mapBackendUser(verifyData.user),
    accessToken: verifyData.accessToken,
    refreshToken: verifyData.refreshToken,
  });
}

export async function registerApi(body: RegisterInput): Promise<AuthResponse> {
  const phone = body.phone.trim();
  const requestRes = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/auth/otp/request",
    data: { phone },
  });
  const requestData = unwrapOk<{ devCode?: string }>(requestRes);
  const code = requestData.devCode;
  if (!code) {
    throw new Error("OTP code not available in this environment. Use mobile OTP flow.");
  }
  const verifyRes = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/auth/otp/verify",
    data: {
      name: body.name,
      phone,
      code,
      // API honors role only for brand-new signups; existing accounts keep theirs.
      role: body.role.toLowerCase(),
    },
  });
  const verifyData = unwrapOk<{
    user: BackendUser;
    accessToken: string;
    refreshToken: string;
  }>(verifyRes);
  return authResponseSchema.parse({
    user: mapBackendUser(verifyData.user),
    accessToken: verifyData.accessToken,
    refreshToken: verifyData.refreshToken,
  });
}

export async function adminLoginApi(email: string, password: string): Promise<AuthResponse> {
  const verifyRes = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/auth/admin/login",
    data: { email: email.trim(), password },
  });
  const verifyData = unwrapOk<{
    user: BackendUser;
    accessToken: string;
    refreshToken: string;
  }>(verifyRes);
  return authResponseSchema.parse({
    user: mapBackendUser(verifyData.user),
    accessToken: verifyData.accessToken,
    refreshToken: verifyData.refreshToken,
  });
}

export async function refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/auth/refresh",
    data: { refreshToken },
  });
  return tokensResponseSchema.parse(unwrapOk(raw));
}

/** Uses Axios auth interceptor (Bearer from store). */
export async function fetchMeApi(): Promise<MeUser> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "GET",
    url: "/me",
  });
  const user = unwrapOk<BackendUser>(raw);
  const mapped = { ...mapBackendUser(user), city: null, wallet: null };
  return meResponseSchema.parse({ user: mapped }).user;
}
