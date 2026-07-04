# Tayr Al-Saad — Feature Gap Analysis (P2P Parcel Delivery)

Read-only assessment of the **sender** experience (with driver/receiver/web cross-checks where a flow spans apps) against the V1/V2 matrix. Judged as a P2P **parcel** courier app — not food delivery. Marks: **PRESENT** / **PARTIAL** / **ABSENT**. Effort for gaps: **S** (≤1 day), **M** (2–4 days), **L** (1–2 weeks).

Evidence is by file (and line where precise). "mobile" = `apps/mobile`, "api" = `apps/api`, "web" = `apps/web`.

---

## 1. Matrix

### V1 MUST-HAVE

| # | Item | Status | Evidence / what's missing | Effort |
|---|---|---|---|---|
| **Auth & account** ||||
| A1 | Phone + OTP auth | **PRESENT** | `app/(auth)/login.tsx`, `otp.tsx`, `components/auth/OtpCodeInput.tsx`; api `routes/auth.ts` (`/auth/otp/request`,`/verify`) | — |
| A2 | Token refresh | **PRESENT** | `lib/api.ts:76-134` (refresh chain + 401 retry + `/auth/refresh`) | — |
| A3 | Logout everywhere | **PARTIAL** | Local logout + server `/auth/logout` (`SharedProfileScreen.tsx:50`, `stores/authStore`). No "sign out all devices" / multi-session revoke UI. | S |
| A4 | Profile: name, phone, language AR/EN | **PRESENT** | `SharedProfileScreen.tsx:22-24` (name/phone), `app/language.tsx` (toggle) | — |
| A5 | Saved addresses add/edit/delete + labels (بيت/شغل) | **PRESENT** | `app/(sender)/saved-addresses.tsx`, `components/sender/SavedAddressCard.tsx:17-22` (بيت/شغل icons), `queries/me.ts` (add/patch/delete) | — |
| **Shipment lifecycle** ||||
| S1 | Create: pickup+dropoff via **map pin** | **PRESENT** | `components/sender/create/CreateRouteStep.tsx:75-93` (draggable map, use-my-location) | — |
| S1b | Create: pickup+dropoff via **search** | **ABSENT** | No address autocomplete/geocode/place-search anywhere; user types city/area free-text (`CreateRouteStep.tsx:116-128`). All "search" hits are `useLocalSearchParams`. | M |
| S2 | Create: package size | **PRESENT** | `CreatePackageStep.tsx:13-71` (small/medium/large) | — |
| S3 | Create: photos | **ABSENT** | No image picker in the create flow (`CreatePackageStep.tsx` has description + COD only). Photo capture exists only in the dispute flow. | M |
| S4 | Create: notes | **PRESENT** | `CreateRouteStep.tsx:120,128` (pickup/dropoff notes) | — |
| S5 | Create: COD toggle + amount | **PRESENT** | `CreatePackageStep.tsx:79-99` (toggle + amount, IQD formatted) | — |
| S6 | Price estimate before confirm + breakdown | **PRESENT** | `hooks/useDebouncedShipmentQuote`, `CreatePricingStep.tsx:115-133`, `components/sender/ShipmentPriceBreakdown.tsx` | — |
| S7 | Coupon apply/remove + validation feedback | **ABSENT** (mobile) | No coupon UI in mobile (grep `coupon/promo/discount` → 0 in `apps/mobile`). Backend + web-admin have promotions (`api/models`, `web/.../AdminPromotionsPage.tsx`) — not exposed to the sender. | M |
| S8 | Courier matching state + cancel + cancel policy surfaced | **PARTIAL** | Matching overlay `CreateMatchingOverlay.tsx` (no cancel on the overlay itself). Cancel available later on detail (`shipments/[id].tsx:224-232`, gated `pending/assigned`, else `cancelForbidden`). No explicit cancel-policy/fee text shown before cancelling. | M |
| S9 | Live tracking: position, timeline, ETA | **PRESENT** | `shipments/[id].tsx` (map + `StatusTimeline` + ETA), `hooks/useShipmentLiveChannel.ts` (socket) | — |
| S10 | Pickup OTP & delivery OTP handoff | **PARTIAL (broken for customer)** | Backend generates `pickupOtp`/`deliveryOtp` (`api/controllers/shipments.controller.ts:105-134,331,360`); **driver enters** the code (`app/(driver)/(tabs)/active.tsx:257,279` `OtpDigits`). **The sender never sees the pickup code and the receiver never sees the delivery code** — no screen renders `pickupOtp`/`deliveryOtp` (grep in `(sender)`/receiver → 0). WhatsApp notification sends only the track link, not the code (`api/services/shipmentNotifications.ts`). The by-the-book handoff cannot complete from the customer side. | M |
| S11 | Cancel/edit rules per state + clear feedback | **PARTIAL** | Cancel rules present + reason sheet + specific errors (`shipments/[id].tsx:236-266`). **Edit shipment after creation is ABSENT** (no edit route/flow). | M |
| S12 | Recipient tracking-link share (public page) | **PRESENT** | `app/(sender)/new/success.tsx:81-118` (copy link, WhatsApp, SMS); public web pages `web/src/pages/public/PublicTrackPage.tsx`, `TrackLandingPage.tsx`, `components/shared/TrackingMap.tsx`. (Map lib is a custom `TrackingMap`, not confirmed Leaflet.) | — |
| **Post-delivery** ||||
| P1 | Delivery confirmation | **PARTIAL** | Status reaches `delivered` (driver-driven). Receiver "acknowledge" is a static info `Alert`, not a real confirmation/POD (`(receiver)/tracking/[id].tsx:187-194`). No sender-side "confirm received". | M |
| P2 | Courier rating + optional comment | **PRESENT** | `components/sender/ShipmentRatingSection.tsx` (stars + comment), `queries/shipments.ts` `useRateShipmentMutation` → `/shipments/:id/rate` | — |
| P3 | History with status filters | **PRESENT** | `app/(sender)/(tabs)/shipments.tsx` (active/completed/cancelled segments, infinite scroll) | — |
| P4 | Detail with receipt (breakdown, COD, timestamps) | **PARTIAL** | Breakdown + timestamps present (`ShipmentPriceBreakdown.tsx`, `StatusTimeline`). **COD amount is not itemised** in the receipt (breakdown shows base/distance/surcharge/surge/total only). | S |
| **Communication** ||||
| C1 | Push notifications for every status change + permission ask | **ABSENT** | No `expo-notifications` anywhere in mobile (grep → 0); no permission-ask flow; no device-token registration. Status changes are pushed **server-side via WhatsApp only** (`api/workers/notifications.worker.ts` → `notifyShipmentViaWhatsApp`). | L |
| C2 | Contact courier: call button / in-app chat | **ABSENT** (sender) | No `tel:` / call button on the sender detail screen; no in-app chat (receiver `messages.tsx` is a placeholder stub). Receiver screen has WhatsApp-to-driver only (`(receiver)/tracking/[id].tsx:177-185`). Sender cannot reach the courier from the app. | S (call) / L (chat) |
| C3 | In-app notification center matching bell tab | **ABSENT** | Bell tab removed this release (`(tabs)/_layout.tsx` `href:null`, TODO(push)); `notifications.tsx` is an empty stub; `useUnreadNotificationCount()` hardcodes 0. | M |
| **Trust & safety** ||||
| T1 | Courier identity on tracking (name, photo, rating, vehicle) | **PRESENT** (sender) | `shipments/[id].tsx:163-198` (photo, name, vehicle, rating). Receiver shows name only (`(receiver)/tracking/[id].tsx:143-148`). | — |
| T2 | Support entry: FAQ/help + WhatsApp/phone escalation | **ABSENT** | No support/FAQ/help screen in mobile (all `help` grep hits are `helper`/gradle noise). Only a Legal screen exists. | M |
| T3 | Terms + privacy links (privacy: smartgateapp.com/privacy) | **PARTIAL (broken)** | `app/legal.tsx` renders links, **but the i18n keys `legal.privacy`, `legal.terms`, `legal.privacyUrl`, `legal.termsUrl` do not exist** (en.json `legal` block has only `title`, L471-472). Buttons show raw key strings and `Linking.openURL('legal.privacyUrl')` fails. The `smartgateapp.com/privacy` URL is configured nowhere. | S |
| **Quality** ||||
| Q1 | Offline/poor-network: queued retry on create; tracking reconnect | **PARTIAL** | Create failure surfaces a specific error `Alert` (`CreateShipmentWizard.tsx:119-125`) but there is **no offline queue / auto-retry**. Tracking: socket.io auto-reconnects and re-`emit('shipment:subscribe')` on every `connect` (`useShipmentLiveChannel.ts:61-63`), so it re-subscribes — but there is **no user-facing "reconnecting/offline" indicator**. | M |
| Q2 | Empty + error states on every list/fetch | **PRESENT** (sender) | Home/shipments/detail/saved-addresses all have skeleton + empty + `ErrorState` w/ retry. Legacy driver/receiver screens use plain text states. | — |
| Q3 | Full AR/EN parity (no single-language screen) | **PARTIAL** | Both locale files exist and all sender screens read from i18n. **Gap:** the Legal screen's `privacy`/`terms` strings are missing in BOTH languages (see T3), so that content is broken in AR and EN alike. | S |

### V2 / LATER — report only, do **not** build now

| Item | Status | Note |
|---|---|---|
| Scheduled pickups | **PRESENT already** | `CreatePricingStep.tsx:77-101` (scheduled tier + datetime picker). Ships today; nothing to do. |
| Multi-stop shipments | **ABSENT** | Later. |
| Wallet / online payment | **ABSENT** | Wallet stub was removed; confirm-step lists ZainCash/FastPay/FIB/Asia Hawala but only COD is the live path. COD-first market — later. |
| Referral program | **ABSENT** | Later. |
| Promo campaigns UI (consumer) | **ABSENT** (mobile) | Exists in web admin only. Later. |
| Business/merchant bulk dashboard | **ABSENT** | Later. |
| Insurance / declared value | **PARTIAL** | `declaredValue` field exists (reused for COD amount). No insurance product. Later. |
| Proof-of-delivery photo & signature | **ABSENT** | Dispute has a photo; no delivery POD photo/signature. Later. |
| Live chat with support / chatbot | **ABSENT** | Later. |

---

## 2. Top 5 gaps that most damage trust or completion (first-time Iraqi user)

1. **Handoff OTP is invisible to the customer (S10).** The backend issues a pickup code and a delivery code, and the driver app asks the courier to type them in — but neither the sender (at pickup) nor the receiver (at delivery) is ever shown the code to read out. For a first-time user this looks like the delivery simply *cannot be completed correctly*: the courier asks for "the code," the customer has no idea what code, and the parcel either stalls or the driver bypasses the check — which quietly defeats the entire anti-fraud purpose of the OTP handoff. This is the single most damaging gap because it breaks the core promise ("أمانتك بأمان") at the exact moment money and goods change hands. **Effort: M.**

2. **No in-app push notifications or permission ask (C1).** Status changes are broadcast only over WhatsApp server-side; the app itself never notifies. A first-time sender who closes the app after booking gets no "courier assigned / arrived / delivered" nudge, so they either sit on the tracking screen or lose confidence that anything is happening. In a market where WhatsApp delivery is not guaranteed (number mismatches, business-API limits), silent status is a top driver of anxious support contacts and abandoned second orders. **Effort: L** (native config + permission flow + token registration + server fan-out).

3. **No way to contact the courier from the sender app (C2).** During an active pickup the sender cannot call or message the assigned courier — there is no call button and no chat on the sender detail screen. Coordinating "which gate / which floor / I'm five minutes away" is the norm for Iraqi deliveries; without it, pickups fail or drag, and the user blames the app. A plain `tel:` call button is cheap and would remove a major completion blocker. **Effort: S** for a call button (chat is L, defer).

4. **No support/help escalation path (T2).** There is no FAQ and no WhatsApp/phone escalation anywhere in the app — only a Legal screen. When a first-time user hits any of the problems above (lost code, no notification, unreachable courier), they have nowhere to turn inside the app, which converts a recoverable hiccup into a lost customer and a 1-star review. A single support screen with a WhatsApp/phone button is high-leverage trust insurance. **Effort: M** (S if it's just a WhatsApp/phone launcher + a few FAQ entries).

5. **Terms & Privacy links are broken (T3, Q3).** `app/legal.tsx` references i18n keys (`legal.privacy`, `legal.terms`, `legal.privacyUrl`, `legal.termsUrl`) that don't exist, so the screen shows raw keys and tapping fails; the required `smartgateapp.com/privacy` URL is set nowhere. Beyond looking unfinished to a cautious first-time user handing over their phone number and address, missing/inaccessible privacy links are a concrete **App Store / Play Store rejection risk** and a legal exposure. It's the cheapest item on this list to fix. **Effort: S.**

---

## 3. Do-not-build note (food-delivery-shaped features)

Tayr Al-Saad is **person/business → courier → recipient parcel delivery**. Do **not** add, and do not treat as gaps, any of the following food/e-commerce constructs: restaurant or store listings, menus, product catalogs, item search/browse, shopping cart or basket, add-to-cart / quantity steppers, per-item modifiers or options, tip-the-restaurant, order-again-from-menu, or vendor storefronts. The "package" in this app is a single opaque parcel described by size/notes/COD — there is no catalog to model. Any request that implies a menu, cart, or product SKU is out of scope for this product and should be pushed back on rather than scaffolded.

---

*No source files were modified in this session. This document is the only output.*
