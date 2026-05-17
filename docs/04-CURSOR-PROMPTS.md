# Cursor Prompts — طير السعد

Paste these into Cursor in order. Each one assumes the previous is complete. Keep `.cursorrules` in the repo root throughout.

> If **Prompt 1–2** (monorepo + shared packages) already exist (this repo ships with them), start at **Prompt 3**.

> Tip: run each prompt in **Agent / Composer** mode (not chat) so Cursor can create files. After each, do a quick code review before moving on. Don't skip ahead.

## Prompt 1 — Bootstrap the monorepo

```
Initialize a pnpm + Turborepo monorepo for the Tayr Al-Saad (طير السعد) delivery platform per the architecture in `docs/01-ARCHITECTURE.md` and `.cursorrules`.

Create:
- pnpm-workspace.yaml with apps/* and packages/*
- turbo.json with build, dev, lint, typecheck pipelines
- Root package.json with workspace scripts
- tsconfig.base.json with strict mode, path aliases for @tayralsaad/*
- .gitignore, .editorconfig, .nvmrc (20), .prettierrc, .eslintrc.cjs

Create empty workspace packages:
- packages/types       (entry: src/index.ts re-exports all)
- packages/tokens      (color, spacing, typography constants)
- packages/utils       (formatIQD, formatPhone, formatDate, generateTrackingCode)
- packages/i18n        (en.json, ar.json with starter keys: common.*, auth.*, status.*)

Create app shells (just package.json + src/index.ts for now):
- apps/api
- apps/mobile
- apps/web

Output: full file tree + every file's contents. Do not skip files.
```

---

## Prompt 2 — Shared types and tokens

```
Implement packages/types per 02-SCHEMA-AND-API.md.

Files:
- src/enums.ts — ShipmentStatus, PaymentMethod, PaymentStatus, Role, DriverStatus, PackageType, ServiceTier as union types
- src/user.ts — User, Address types
- src/driver.ts — Driver type (extending User by id reference)
- src/shipment.ts — Shipment type with all nested shapes (pickup, dropoff, receiver, package, pricing, payment, statusHistory entry, proofs, rating)
- src/city.ts — City type with pricing and zones
- src/payout.ts — PayoutBatch type
- src/api.ts — ApiSuccess<T>, ApiError shapes; helper type ApiResponse<T>
- src/index.ts — re-export everything

All types are pure TS, no runtime code. Use string literal unions for enums, not enum keyword.

Then implement packages/tokens:
- src/colors.ts: the 10 design tokens from architecture (bg, surface, ink, ink-soft, primary, accent, success, danger, border, plus white/black)
- src/spacing.ts: a 4px scale (0, 1, 2, 3, 4, 6, 8, 12, 16, 24 in REM units)
- src/typography.ts: fontFamilies (faunces, inter, tajawal), fontSizes, lineHeights, weights
- src/radius.ts: sm 6, md 12, lg 20, full 9999
- src/index.ts: export tokens object

Then implement packages/utils:
- src/iqd.ts: formatIQD(amount, locale: 'ar' | 'en') returning '10,000 د.ع' or '10,000 IQD'. Round to integer (no fractional IQD).
- src/phone.ts: normalizePhone (force +964 prefix), formatPhone for display
- src/tracking.ts: generateTrackingCode → 8-char uppercase alphanumeric, excluding ambiguous I, O, 0, 1
- src/date.ts: formatDate(date, locale), formatRelative(date, locale)
- src/rtl.ts: isRtl(locale), bidiWrap(text, dir)
- src/index.ts

Then packages/i18n:
- locales/en.json with namespaces: common, auth, status, shipment, driver, errors
- locales/ar.json mirror with translations
- src/index.ts exporting both as default

Provide each file in full.
```

---

## Prompt 3 — Backend foundation (Express + Mongoose + Auth)

```
Implement apps/api per 02-SCHEMA-AND-API.md.

Structure:
src/
  config/         env loader (zod-validated), db connection, redis connection
  models/         Mongoose schemas for User, Driver, Shipment, City, PayoutBatch
  middleware/     auth (JWT verify), requireRole, errorHandler, requestLogger, rateLimit
  routes/         auth.ts, me.ts, driver.ts, shipments.ts, track.ts, admin.ts
  controllers/    one per route file
  services/       authService, otpService (Twilio Verify stub), pricingService, dispatchService
  sockets/        index.ts (Socket.IO setup), shipmentRoom.ts, driverEvents.ts
  queues/         index.ts (BullMQ setup), notificationQueue.ts, payoutQueue.ts
  utils/          asyncHandler, apiResponse, signTokens, verifyTokens, otpGenerator
  app.ts          Express app composition
  server.ts       HTTP + Socket.IO bootstrap

Requirements:
- TypeScript strict, ESM
- Mongoose 8 schemas with proper indexes (phone unique, trackingCode unique, geo index on driver location)
- zod for all request validation, applied via a validate(schema) middleware
- JWT: access 15min, refresh 30d with rotation + reuse detection (store refresh token jti hashed in user doc)
- OTP service: stub that logs the code to console in dev; interface ready to swap for Twilio Verify
- Pricing service: distance from Google Maps Distance Matrix (mock in dev with haversine), apply city base + per-km + package multiplier + service multiplier + surge
- Phone OTP rate limit: 1 per minute per phone, 5 per hour
- Global error handler returns the ApiError shape from packages/types
- Pino logger with request id, child logger per request
- CORS configured for web origin

Implement ALL endpoints listed in 02-SCHEMA-AND-API.md. Use the shared types from @tayralsaad/types.

For dispatch: when a shipment is created with status pending, query online drivers within 5km serving that city, emit driver:new_request to each via Socket.IO room driver:{driverId}. First to call /shipments/:id/accept wins; the rest get 404 on accept.

Provide every file in full. Include a seed script (src/scripts/seed.ts) that creates: 8 Iraqi cities, 5 mock drivers, 5 mock senders, 10 mock shipments across statuses.
```

---

## Prompt 4 — Mobile foundation (Expo + Router + i18n + Auth)

```
Implement apps/mobile per .cursorrules and the architecture.

Setup:
- Expo SDK 51+ managed
- TypeScript strict
- Expo Router file-based (typed routes)
- NativeWind v4 with tailwind.config.js consuming tokens from @tayralsaad/tokens via a script that generates a tokens.ts the config imports
- i18next + react-i18next initialized in lib/i18n.ts, loading from @tayralsaad/i18n, with Localization.locale detection, default 'ar'
- I18nManager.forceRTL on language change with reload prompt
- Zustand stores: useAuthStore (user, tokens, hydrate from secure-store), useLanguageStore (current locale)
- TanStack Query with a single QueryClient, devtools off in prod
- Axios instance with interceptors: attach access token, refresh on 401, redirect to login on refresh fail
- Sentry init guarded by env

Screens to scaffold (file-based routing):
- app/_layout.tsx — providers (QueryClient, i18n init, theme, Sentry boundary), splash gate
- app/(auth)/_layout.tsx
- app/(auth)/phone.tsx — phone entry with +964 prefix locked, country flag, Continue button
- app/(auth)/otp.tsx — 4-input OTP with auto-paste, resend timer
- app/(auth)/role.tsx — choose Sender / Driver (skipped if user already has a role)
- app/(sender)/_layout.tsx — bottom tabs: Home, Shipments, Profile
- app/(sender)/index.tsx — placeholder home with "New shipment" CTA
- app/(driver)/_layout.tsx — bottom tabs: Requests, Active, Earnings, Profile
- app/(driver)/index.tsx — placeholder feed
- app/(shared)/language.tsx — AR/EN toggle with reload
- app/(shared)/legal.tsx — links to privacy / terms

Components:
- components/ui/Button.tsx — variants: primary, secondary, ghost, danger; sizes sm, md, lg; loading state
- components/ui/Input.tsx — with label, error, RTL-aware
- components/ui/Screen.tsx — safe area + background color wrapper
- components/ui/Bidi.tsx — wraps text with bidi marks

lib/:
- api.ts — axios instance
- queries/auth.ts — useRequestOtp, useVerifyOtp mutations
- queries/me.ts — useMe query
- i18n.ts — i18next setup
- secure.ts — secure-store wrappers (setToken, getToken, clear)

Wire phone → otp → role → tabs flow end-to-end against the API from prompt 3.

All UI text from i18n. Default language Arabic. Test RTL.

Provide every file in full.
```

---

## Prompt 5 — Sender shipment creation flow

```
Build the full sender flow on apps/mobile.

Screens:
- app/(sender)/new/index.tsx — pickup picker (current location / map / saved address)
- app/(sender)/new/dropoff.tsx — dropoff picker + receiver name + phone
- app/(sender)/new/package.tsx — type chips (envelope/small/medium/large/fragile/cold), weight tier, optional description, declared value
- app/(sender)/new/service.tsx — service tier (standard/express/scheduled) with date/time picker for scheduled
- app/(sender)/new/review.tsx — quote summary, payment method radio, "Confirm" button
- app/(sender)/new/success.tsx — tracking code + share buttons (WhatsApp link, SMS) + "Track now"
- app/(sender)/shipments/index.tsx — list of my shipments, segmented filter (active / completed / cancelled)
- app/(sender)/shipments/[id].tsx — detail with live map, driver card, status timeline, cancel button when allowed

State:
- Use a Zustand "draft shipment" store that persists across the multi-step new-shipment flow.
- Reset on success or explicit cancel.

Map:
- Use react-native-maps; show pickup pin, dropoff pin, and a polyline (can be straight line in v1, real route later).
- "Use current location" button uses expo-location with foreground permission requested in context.

Quote:
- Call POST /shipments/quote on each meaningful change; debounce 400ms.
- Display: base, distance fee, surge if any, total in IQD via formatIQD.

Tracking detail screen:
- Subscribe to socket room shipment:{id} on mount, unsubscribe on unmount.
- Update driver pin live from shipment:driver_location.
- Show status timeline using statusHistory; localize statuses.

All strings in i18n. RTL-verified.

Provide every file in full + any new i18n keys added.
```

---

## Prompt 6 — Driver flow

```
Build the driver-side mobile flow.

Screens:
- app/(driver)/index.tsx — Requests feed: online toggle in header, list of nearby pending shipments (card: distance, payout, package, pickup area). Realtime via socket driver:{me.id}.
- app/(driver)/accept/[id].tsx — modal with full request details + Accept (with 30s countdown) / Decline.
- app/(driver)/active.tsx — Active shipment screen: live map, current status, big action button that changes per status (Arrived at pickup → Confirm pickup OTP+photo → Arrived at dropoff → Confirm delivery OTP+photo+signature)
- app/(driver)/earnings.tsx — available balance, pending payout, history list, "Request payout"
- app/(driver)/apply.tsx — vehicle info + document uploads (id front/back, license, vehicle reg). Status badge: pending review / active / suspended.

Background:
- When driver has an active shipment with status assigned/arrived_pickup/picked_up/in_transit/arrived_dropoff:
  - Start a foreground service (Android) / background location updates (iOS) with proper Info.plist + manifest config
  - Emit driver:location to socket every 5s with throttle
  - Show persistent notification "Tayr Al-Saad · توصيل جارٍ" with Stop action
- On terminal status (delivered/cancelled) or offline toggle: stop service immediately

Camera:
- expo-camera for pickup and delivery photos
- Upload to /uploads (returns Cloudinary signed URL), then pass URL to /shipments/:id/pickup or /deliver

OTP entry:
- 4-input UI, validates against the trip OTP on server

Strings i18n, RTL-verified. Robust to losing connection mid-trip (queue status updates and retry).

Provide every file in full.
```

---

## Prompt 7 — Public tracking + web admin

```
Build apps/web with two surfaces: public tracking and admin dashboard.

Stack: React + Vite + Tailwind + shadcn/ui + React Router + TanStack Query + i18next.

Public tracking (no auth):
- /track/:trackingCode — calls GET /track/:code, shows:
  - Status pill (translated)
  - Map (use mapbox-gl or react-leaflet) with pickup, dropoff, driver location updating via socket
  - Driver card: photo, first name, vehicle type + plate, rating
  - Timeline of status history
  - "Share" button (copies link)
  - AR/EN toggle in header, default AR

Admin dashboard (auth via /auth endpoints, role admin required):
- /admin → Overview: KPI cards (active shipments today, drivers online, completed today, GMV today in IQD), recent shipments table, revenue mini-chart
- /admin/shipments → table with filters (status, city, date range), drawer for detail with manual override actions
- /admin/drivers → tabs: Pending Review (with doc preview + approve/reject), Active, Suspended
- /admin/cities → grid of city cards with edit dialog for pricing + zones
- /admin/payments → payouts table with "Process batch" action
- /admin/disputes → list with resolution flow

Design:
- Editorial: Fraunces for headings, Inter for body, warm off-white bg, muted indigo primary
- shadcn/ui components customized to the tokens
- All numbers via formatIQD
- All strings via i18n (admin defaults to EN but supports AR)

Provide every file in full.
```

---

## Prompt 8 — Store readiness + EAS configuration

```
Prepare apps/mobile for store submission per 03-STORE-READINESS.md.

Updates:
- app.json / app.config.ts:
  - name "طير السعد", slug "tayralsaad"
  - ios.bundleIdentifier "iq.utu.tayralsaad", supportsTablet false, infoPlist with all NSUsageDescription strings from 03-STORE-READINESS.md (AR primary, EN as comment)
  - ios.config.usesNonExemptEncryption false
  - android.package "iq.utu.tayralsaad", versionCode managed by EAS, permissions list, foreground service for location
  - userInterfaceStyle "light", orientation "portrait"
  - extra.eas.projectId placeholder
  - locales: ar, en
- eas.json:
  - profiles: development, preview (internal distribution), production (store)
  - Auto increment build numbers
  - Sentry plugin to upload source maps in production

Add screens:
- app/(shared)/account-delete.tsx — confirm dialog → calls DELETE /me, signs out
- app/(shared)/legal/privacy.tsx — webview to https://tayralsaad.com/legal/privacy with offline fallback
- app/(shared)/legal/terms.tsx — same pattern

Add to settings screen:
- Language toggle
- Delete account button (destructive style)
- Sign out
- App version + build

Add a runtime ErrorBoundary that reports to Sentry and shows a friendly screen with "Try again" + "Report a problem" linking to support email.

Add a NoSignalBanner component that listens to NetInfo and shows a top banner when offline; queues mutations via a simple in-memory retry layer for status updates.

Provide every file changed in full + a checklist of what still needs to be done manually in EAS / App Store Connect / Play Console (signing certs, store listing fields, screenshots, demo accounts).
```

---

## Notes on running these in Cursor

1. **Always include `.cursorrules` in repo root** before the first prompt — Cursor picks it up automatically.
2. **Reference the doc files by name** in follow-up prompts: "per 02-SCHEMA-AND-API.md section 3, add the endpoint X". Cursor will read them.
3. **After each prompt, run** `pnpm typecheck` and `pnpm lint` before moving to the next. Fixing type errors as you go saves hours.
4. **Don't accept generated code blindly.** Review the first batch carefully; once Cursor learns your style from existing code it gets dramatically better.
5. **Iterate on i18n keys**: when Cursor adds a new string in only one language, immediately ask "add the AR translation for these new keys" — easy to forget.
6. **RTL is the #1 thing Cursor will skip.** Always test in Arabic mode before moving on. Many bugs appear only there.
