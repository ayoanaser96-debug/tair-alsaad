# طير السعد · Tayr Al-Saad — Architecture

> A bilingual P2P courier delivery platform for Iraq.
> Built by **Utu** · Arabic-first · IQD-native · store-ready for Google Play and Apple App Store.

---

## 1. Brand

| | |
|---|---|
| **Arabic name** | طير السعد |
| **Latin name** | Tayr Al-Saad |
| **Meaning** | "Bird of fortune" — a cultural omen of good news arriving |
| **Tagline (AR)** | أمانتك بأمان · يطير ويوصل |
| **Tagline (EN)** | Trusted in flight, delivered on time |
| **Repo / package** | `tayralsaad` |
| **iOS bundle ID** | `iq.utu.tayralsaad` |
| **Android package** | `iq.utu.tayralsaad` |
| **Domain (suggested)** | `tayralsaad.com` / `tayralsaad.iq` |

**Visual direction:** stylized bird motif (subtle, single-line geometric — not literal). Editorial typography. Warm palette over off-white. No glassmorphism, no neon, no AI-template gradients.

**Color tokens (starting point — refine in Figma):**
```
--bg          #FBF8F3   warm off-white
--surface     #FFFFFF
--ink         #1F1B17   near-black warm
--ink-soft    #5C544A
--primary     #2F4A5C   muted indigo-slate (the sky)
--accent      #C7704E   dusty coral (the bird)
--success     #5A7A4F   olive
--danger      #A8453B
--border      #E8E1D5
```

**Typography:**
- Arabic display: **Tajawal** or **IBM Plex Sans Arabic** (weights 400/500/700)
- Latin display: **Fraunces** (headings) + **Inter** (body)
- Numerals: tabular figures for prices and tracking numbers

---

## 2. Roles

| Role | App? | Core actions |
|---|---|---|
| **Sender** (المرسِل) | Mobile app | Create shipment, pay, track, rate driver |
| **Driver** (السائق) | Mobile app | See nearby requests, accept, navigate, capture proof of delivery, request payout |
| **Receiver** (المستلِم) | **No app required** — receives SMS/WhatsApp link to public tracking page. Optional: open same mobile app and log in to see their shipments | Track live, confirm delivery with code |
| **Admin** (الإدارة) | Web dashboard | Approve drivers, manage cities/pricing, resolve disputes, run payouts |

> The receiver-as-app-user is a real trap. Most receivers in Iraq won't install an app to receive one package. SMS + WhatsApp link to a public tracking page covers 95% of cases. Keep the receiver flow lightweight.

---

## 3. Tech stack (locked)

### Monorepo
- **pnpm workspaces** + **Turborepo** — fast incremental builds, shared types

### Mobile (`apps/mobile`)
| Concern | Choice |
|---|---|
| Framework | React Native + **Expo SDK 51+** (managed) |
| Build | **EAS Build** → Play Store AAB + App Store IPA |
| Navigation | **Expo Router** (file-based, deep-link friendly) |
| Client state | **Zustand** |
| Server state | **TanStack Query** |
| Styling | **NativeWind** (Tailwind for RN) + design tokens package |
| Forms | **react-hook-form** + **zod** |
| i18n | **i18next** + `react-i18next`, with `I18nManager.forceRTL(true)` on Arabic |
| Maps | **react-native-maps** (Google Maps Android / Apple Maps iOS) |
| Realtime | **Socket.IO client** (driver location stream) |
| Push | **Expo Notifications** → FCM (Android) + APNs (iOS) |
| Secure storage | `expo-secure-store` (tokens), `AsyncStorage` (prefs) |
| Camera | `expo-camera` (proof-of-delivery, ID verification) |
| Location | `expo-location` + **foreground service** on Android for driver tracking |

### Web (`apps/web`) — Admin + public tracking
- **React + Vite**, React Router, Tailwind + **shadcn/ui**
- Same Zustand + TanStack Query stack
- Public route: `/track/:trackingCode` (no auth, indexable for receivers)

### Backend (`apps/api`)
| Concern | Choice |
|---|---|
| Runtime | **Node.js 20+** with **Express** |
| Database | **MongoDB** (Mongoose) — Atlas in prod |
| Auth | **JWT** (access 15min + refresh 30d), **phone OTP** (Twilio Verify or local SMS gateway) |
| Realtime | **Socket.IO** server (rooms per shipment) |
| Queue | **BullMQ** + **Redis** (notifications, payouts, retries) |
| Files | **Cloudinary** (proof-of-delivery photos, driver ID docs) |
| Maps | Google Maps Distance Matrix + Geocoding APIs |
| Payments | **ZainCash**, **FastPay**, **FIB**, **Asia Hawala** + cash-on-delivery |
| Logs | **Pino** structured logs |
| Errors | **Sentry** (mobile + backend) |
| Validation | **zod** shared schemas |

### Shared packages
- `packages/types` — Shipment, User, City, Payment TS types (single source of truth)
- `packages/tokens` — design tokens (colors, spacing, typography)
- `packages/utils` — IQD formatter, RTL helpers, status enums, distance calc
- `packages/i18n` — `en.json` + `ar.json`, namespaced

---

## 4. Repo structure

```
tayralsaad/
├── apps/
│   ├── mobile/                    Sender + Driver (role-switched after login)
│   │   ├── app/                   Expo Router
│   │   │   ├── (auth)/            phone OTP, role selection
│   │   │   ├── (sender)/          home, new-shipment, my-shipments, profile
│   │   │   ├── (driver)/          requests-feed, active-shipment, earnings, profile
│   │   │   └── (shared)/          settings, language, support, legal
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/                   api client, socket client, i18n setup, auth
│   │   ├── stores/                Zustand: auth, activeShipment, location
│   │   └── eas.json
│   │
│   ├── web/                       Admin dashboard + public tracking
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── admin/         overview, shipments, drivers, cities, payments, disputes
│   │       │   └── track/         public tracking (no auth, AR/EN)
│   │       └── ...
│   │
│   └── api/
│       └── src/
│           ├── routes/            REST endpoints
│           ├── controllers/
│           ├── models/            Mongoose schemas
│           ├── services/          business logic
│           ├── middleware/        auth, role guards, rate limit
│           ├── sockets/           realtime handlers
│           ├── queues/            BullMQ workers
│           └── utils/
│
├── packages/
│   ├── types/
│   ├── tokens/
│   ├── utils/
│   └── i18n/
│
├── .cursorrules                   Cursor agent instructions (see file)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 5. Bilingual + RTL strategy (non-negotiable rules)

These rules are enforced in `.cursorrules` and applied across every PR:

1. **All UI strings live in `packages/i18n/{en,ar}.json`.** No hardcoded strings in components. Period.
2. **Status values are stored as English enum keys** (`pending`, `assigned`, `picked_up`, `in_transit`, `delivered`, `cancelled`) and translated at render time only.
3. **Numbers and currency** use a single `formatIQD(amount)` util — never raw template strings.
4. **RTL on Arabic**: `I18nManager.forceRTL(true)` on language switch + app reload. All layouts must work in both LTR and RTL (use `start`/`end` instead of `left`/`right`).
5. **Mixed-direction text** (Arabic name + Latin tracking number) must use Unicode bidi marks (`\u200F` for RTL, `\u200E` for LTR) — wrap with a `<Bidi>` helper.
6. **Default language is Arabic**, fallback English. New users start in Arabic unless device locale says otherwise.
7. **Mock/seed content stays untranslated** (real Iraqi names, real cities). **Only UI chrome is translated.**

---

## 6. Key product flows (high-level)

### Sender creates a shipment
1. Pick pickup point (current location / map / saved address)
2. Pick dropoff point + receiver name + receiver phone
3. Choose package type (envelope / small box / medium box / fragile / cold) and weight tier
4. Choose service (same-day / express / scheduled)
5. See **quote** (distance × tier × surge), choose **payment method** (ZainCash / FastPay / FIB / cash-on-delivery)
6. Confirm → shipment goes to `pending` → broadcast to nearby eligible drivers

### Driver accepts and delivers
1. Sees request in feed (distance, payout, package type) — 30s timer
2. Accepts → shipment `assigned` → navigates to pickup
3. Marks "Arrived at pickup" → captures pickup photo + reads pickup OTP from sender
4. Marks "Picked up" → status `picked_up` → navigates to dropoff (location streams every 5s)
5. At dropoff: reads delivery OTP from receiver → captures delivery photo + optional signature
6. Marks "Delivered" → status `delivered` → earnings credited (cash-on-delivery: collects cash)

### Receiver tracks
1. Receives SMS: *"طير السعد: شحنتك بطريقها. تابعها هنا: tayralsaad.com/track/AB12CD34"*
2. Opens public tracking page → sees driver on map, ETA, driver name + photo + plate
3. On arrival, shares delivery OTP with driver
4. Gets follow-up SMS with delivery confirmation + photo

### Admin operations
- Approve new drivers (verify ID + vehicle docs from Cloudinary uploads)
- Set city pricing tiers, service zones, surge rules
- Resolve disputes (chat history, photos, location trail)
- Run weekly driver payouts (BullMQ job)

---

## 7. Realtime architecture

- **Socket.IO** rooms: `shipment:{id}` joined by sender, driver, receiver-anon
- Driver app emits `location:update` every 5 seconds while on an active shipment
- Server broadcasts `location:driver` and `status:change` to the room
- Receiver tracking page connects as anonymous socket with the tracking code (server validates code, joins them to room)

---

## 8. Security & compliance baseline

- **Phone OTP only** for user auth (no passwords). Rate-limit OTP requests (1/min, 5/hour per phone).
- **Refresh-token rotation** with reuse detection.
- **PII minimization**: receivers store phone + name only, no account required.
- **Encryption at rest** on MongoDB Atlas; **TLS 1.2+** everywhere.
- **Driver background checks**: ID + driving license verified manually by admin before activation.
- **Photo storage**: signed Cloudinary URLs, 30-day retention for delivery proofs, then archive.
- **Privacy policy + Terms** hosted at `tayralsaad.com/legal/{privacy,terms}` — required for stores.

---

## 9. What to build first (week-by-week)

| Week | Milestone |
|---|---|
| 1 | Monorepo + shared packages + API skeleton + auth (phone OTP) |
| 2 | Sender flow: shipment creation + quote + payment stub |
| 3 | Driver flow: feed + accept + status transitions |
| 4 | Realtime: socket-based location + tracking page on web |
| 5 | Payments integration (start with cash-on-delivery + ZainCash) |
| 6 | Admin dashboard MVP |
| 7 | Polish: notifications, edge cases, AR/EN review |
| 8 | Store readiness: privacy, screenshots, beta builds via EAS, internal testing |
