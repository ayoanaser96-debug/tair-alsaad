# Sender App Audit — طير السعد

Read-only static audit of the **sender** mobile app (`apps/mobile`). Reflects the code as read this session. Every row below was verified by opening the referenced file; marks are static only. Anything not statically decidable is **UNVERIFIED** (not guessed as PASS).

Legend: **PASS** / **FAIL** / **N-A** / **UNVERIFIED**.
Severity: **S1** broken (does nothing / crashes / wrong screen) · **S2** degraded (missing loading/error state, silent failure, double-submit, data-loss risk) · **S3** polish (hardcoded string, inline color, RTL nit, rule violation, dead code).

---

## 1. Screen inventory

Navigation root: `app/_layout.tsx` (Slot + providers) → `app/index.tsx` (boot/router). Sender groups: `app/(sender)/_layout.tsx` (Stack) and `app/(sender)/(tabs)/_layout.tsx` (Tabs with custom `SenderTabBar`).

| Route | File | Reachable? | Guarded? |
|---|---|---|---|
| `/` boot/redirect | `app/index.tsx` | yes (entry) | routes by token+role (L24-42) |
| Home tab | `app/(sender)/(tabs)/index.tsx` | yes (tab) | implicit (401→logout) |
| Shipments tab | `app/(sender)/(tabs)/shipments.tsx` | yes (tab) | implicit |
| Notifications tab | `app/(sender)/(tabs)/notifications.tsx` | yes (tab) | implicit |
| Profile tab | `app/(sender)/(tabs)/profile.tsx` | yes (tab) | implicit |
| `send` tab | `app/(sender)/(tabs)/send.tsx` | **no** — `href:null` (`_layout` L17), no `router.push` anywhere | implicit |
| `track` tab | `app/(sender)/(tabs)/track.tsx` | **no** — `href:null` (`_layout` L18), no `router.push` anywhere | implicit |
| Create wizard | `app/(sender)/new/index.tsx` → `screens/sender/CreateShipmentWizard.tsx` | yes (FAB `SenderTabBar` L62, home quick actions, empty CTAs) | implicit |
| Create success | `app/(sender)/new/success.tsx` | yes (wizard `router.replace` on create, L114) | implicit |
| `new/dropoff` `new/package` `new/service` `new/review` | `app/(sender)/new/*.tsx` | redirect-only → `/(sender)/new` | N-A |
| Shipment detail | `app/(sender)/shipments/[id].tsx` | yes (home hero + cards, shipments rows) | implicit |
| Saved addresses | `app/(sender)/saved-addresses.tsx` | yes (profile prepend link, home quick action) | implicit |
| `history` | `app/(sender)/history.tsx` | **no** — nothing references `/(sender)/history` anymore | implicit |
| `wallet` | `app/(sender)/wallet.tsx` | **no** — only referenced from dead `send` tab | implicit |
| new-flow layout | `app/(sender)/new/_layout.tsx` | infra (Stack) | N-A |

Sender-referenced external targets confirmed to exist: `/(auth)/login`, `/welcome`, `/select-role` (`app/(authenticated)/select-role.tsx`), `/language`, `/legal`, `/receiver-track` (`app/(auth)/receiver-track.tsx`).

Modals/sheets (not routes): create discard `Alert` (`CreateShipmentWizard` L72); cancel-reason sheet, dispute sheet (`shipments/[id]` L236/L268, `ThemeBottomSheet`); saved-address add/edit full-screen `Modal` + delete-confirm `ThemeBottomSheet` (`saved-addresses` L196/L212); success share/copy `Alert`s. Dev-only route `app/design-lab.tsx` (not in sender nav).

---

## 2. Per-screen element audit

### Home — `app/(sender)/(tabs)/index.tsx`
| Element | Expected | HANDLER | NAV | API | STATES | i18n | RTL/TOKENS |
|---|---|---|---|---|---|---|---|
| Avatar btn (L108) | → profile tab | PASS L111 | PASS `/(sender)/(tabs)/profile` | N-A | PASS | PASS `navigation.myAccount` | PASS tokens |
| Pull-to-refresh (L92) | refetch mine | PASS `refetch` | N-A | PASS `useMyShipmentsInfinite` | PASS `isRefetching` | N-A | N-A |
| Error retry (L126) | retry list | PASS `ErrorState` | N-A | PASS | PASS loading(L124)/empty(L128)/error(L126) | PASS | PASS |
| Empty CTA (L128) | → wizard | PASS | PASS `/(sender)/new` | N-A | PASS | PASS `sender.home.*` | PASS |
| Active card "Track" (L139) | → detail | PASS `onTrack` | PASS `/(sender)/shipments/{heroId}` | PASS `useShipmentDetail` | PASS | PASS | PASS |
| Quick actions ×3 (L152-157) | send/estimate/addresses | PASS | PASS (send+estimate→`/new`; addresses→`saved-addresses`) | N-A | PASS | PASS | PASS |
| "View all" (L162) | → shipments tab | PASS | PASS | N-A | PASS | PASS | PASS |
| Recent cards (L178) | → detail | PASS | PASS `/(sender)/shipments/{sid}` | N-A | PASS | PASS | PASS |

Note: "Estimate" and "Send" both route to the same `/new` wizard (no standalone estimator) — intentional. All three states present.

### Shipments tab — `app/(sender)/(tabs)/shipments.tsx`
| Element | Expected | HANDLER | NAV | API | STATES | i18n | RTL/TOKENS |
|---|---|---|---|---|---|---|---|
| Segment chips ×3 (L95) | filter | PASS `setSegment` | N-A | N-A | PASS a11y `selected` (L98-99) | PASS `shipmentNew.segment*` | PASS |
| Row press (L54) | → detail | PASS | PASS `/(sender)/shipments/{sid}` | N-A | PASS a11y label | PASS `status.*` | PASS |
| Pull-to-refresh (L134) | refetch | PASS | N-A | PASS | PASS | N-A | N-A |
| Infinite scroll (L150) | next page | PASS `fetchNextPage` | N-A | PASS | PASS footer(L142) | PASS `common.loading` | N-A |
| Empty/loading/error (L118-133) | states | PASS | active-empty CTA → `/new` | PASS | PASS all three | PASS | PASS |

### Notifications tab — `app/(sender)/(tabs)/notifications.tsx`
| Element | Expected | HANDLER | NAV | API | STATES | i18n | RTL |
|---|---|---|---|---|---|---|---|
| (static screen) | list notifications | N-A | N-A | **FAIL — no API** | empty-only | PASS | PASS |

`useUnreadNotificationCount()` (`lib/notifications/unread.ts`) hardcodes `return 0`; the tab badge never renders and the screen is a permanent `EmptyState`. Stub, not broken. **S2.**

### Profile tab — `app/(sender)/(tabs)/profile.tsx` + `components/authenticated/SharedProfileScreen.tsx`
| Element | Expected | HANDLER | NAV | API | STATES | i18n | RTL/TOKENS |
|---|---|---|---|---|---|---|---|
| Saved-addresses link (profile L19) | → saved-addresses | PASS | PASS `/(sender)/saved-addresses` | N-A | PASS | PASS `shipmentNew.addresses*` | PASS |
| Switch dashboard (Shared L31) | clear shell → select-role | PASS `clearDashboardShell` | PASS `/select-role` | PASS store | PASS | PASS `auth.switchDashboard` | S3 (legacy NativeWind) |
| Language (Shared L40) | → language | PASS | PASS `/language` | N-A | PASS | PASS | S3 |
| Legal (Shared L45) | → legal | PASS | PASS `/legal` | N-A | PASS | PASS | S3 |
| Logout (Shared L50) | logout → login | PASS `logout` | PASS `/(auth)/login` | PASS `authStore.logout` | PASS confirm `Alert` | PASS `auth.logout` | S3 |

`SharedProfileScreen` uses legacy `Screen` + NativeWind classes (`text-inkSoft`), not the theme kit — **S3** (classes map to tokens via tailwind config; no raw hex).

### Create wizard — `screens/sender/CreateShipmentWizard.tsx` + `components/sender/create/*`
| Element | Expected | HANDLER | NAV | API | STATES | i18n | DISABLED |
|---|---|---|---|---|---|---|---|
| Header back (L140) | prev step / discard | PASS `goBack` | PASS discard→`/(sender)/(tabs)` (L83) | N-A | PASS confirm `Alert` | PASS | N-A |
| Header close (L140) | discard | PASS `closeFlow` | PASS | N-A | PASS confirm | PASS `common.close` | N-A |
| Primary Next/Confirm (footer) | validate/advance/submit | PASS `goNext`/`submit` | PASS success replace w/ `id`+`tracking` (L114-117) | PASS `useCreateShipmentMutation` | PASS overlay(L165)+error `Alert`(L124) | PASS | PASS gated (L130-134) |
| Route: use-location (RouteStep L89) | GPS fill | PASS | N-A | PASS `expo-location` | PASS permission `Alert` | PASS `shipmentNew.useLocation` | N-A |
| Route: map pin drag (L80) | move pin | PASS `onMove` | N-A | N-A | N-A | N-A | N-A |
| Route: saved-addr apply (L99) | fill draft | PASS | N-A | PASS `useMe` | PASS | PASS | N-A |
| Route: 6 inputs ×2 (L116-144) | edit draft | PASS `patch*`/`setReceiver` | N-A | N-A | PASS field errors | PASS | N-A |
| Package: size cards ×3 (L49) | select type | PASS `setPackage` | N-A | N-A | N-A | PASS `shipmentNew.sizeCards.*` | N-A |
| Package: COD toggle + amount (L82/L89) | set payment/value | PASS | N-A | N-A | N-A | PASS | N-A |
| Pricing: tier cards ×3 (L61) | set service | PASS `selectTier` | N-A | PASS debounced quote | PASS quote err/stale (L103-113) | PASS `shipment.tier*` | N-A |
| Pricing: datetime picker (L88) | schedule | PASS `onChange` | N-A | N-A | PASS | PASS `shipmentNew.scheduledFor` | N-A |
| Confirm: payment select ×5 (L70) | set method | PASS `setPaymentMethod` | N-A | N-A | N-A | PASS `shipmentNew.pay*` | N-A |

Submit gate (`primaryDisabled`, L130-134) requires `lastQuote && paymentMethod && !isPending`; `draftToCreateShipmentBody` only returns null on invalid route/receiver, which the step-0 validator (L58-68) already blocks. No double-submit, no silent no-op. **PASS.**

### Success — `app/(sender)/new/success.tsx`
| Element | Expected | HANDLER | NAV | API | STATES | i18n | RTL |
|---|---|---|---|---|---|---|---|
| Close (L41) | → tabs | PASS | PASS `/(sender)/(tabs)` | N-A | PASS | PASS | PASS |
| Copy code (L73) | clipboard + toast | PASS | N-A | N-A | PASS `Alert` | PASS `common.copied` | N-A |
| Copy link (L81) | clipboard | PASS | N-A | N-A | PASS + disabled w/o url (L83) | PASS | N-A |
| Share WhatsApp (L91) | deep link | PASS | N-A | N-A | PASS `canOpenURL` fallback | PASS | N-A |
| Share SMS (L104) | deep link | PASS | N-A | N-A | PASS fallback | PASS | N-A |
| Track now (L120) | → detail | PASS | PASS + disabled w/o `sid` | N-A | PASS | PASS | PASS |

### Shipment detail — `app/(sender)/shipments/[id].tsx` (+ `ShipmentPriceBreakdown`, `ShipmentRatingSection`, `StatusTimeline`, `ShipmentDetailSkeleton`)
| Element | Expected | HANDLER | NAV | API | STATES | i18n | RTL/TOKENS |
|---|---|---|---|---|---|---|---|
| Back (L111) | → back | PASS `router.back` | PASS | N-A | PASS | PASS `shipment.track` | PASS (chevron flips, `CreateFlowHeader` L19) |
| Loading | full-screen | N-A | N-A | PASS `useShipmentDetail` | PASS `ShipmentDetailSkeleton` (L116) | PASS | PASS |
| Error retry (L114) | retry | PASS `ErrorState` | N-A | PASS | PASS | PASS | PASS |
| Live channel | invalidate on socket events | PASS (see §5) | N-A | PASS | N-A | N-A | N-A |
| Cancel btn → sheet (L225) | open sheet | PASS `setReasonOpen` | N-A | N-A | PASS | PASS | PASS |
| Cancel submit (L248) | cancel shipment | PASS `cancelMut` | **PASS** `/(sender)/(tabs)/shipments` (L252) | PASS `useCancelShipmentMutation`→`POST /shipments/:id/cancel` | PASS loading+error `Alert`; disabled reason<3/pending (L247) | PASS | PASS |
| Dispute btn → sheet (L214) | open sheet | PASS | N-A | N-A | PASS | PASS | PASS |
| Dispute add photo (L289) | camera→upload | PASS | N-A | PASS `uploadShipmentPhoto` | PASS busy + perm/error `Alert` | PASS | PASS |
| Dispute submit (L326) | dispute | PASS `disputeMut` | N-A | PASS `useDisputeShipmentMutation`→`POST /shipments/:id/dispute` | PASS loading+error; disabled reason<3/no-photo/pending (L328); success `Alert` | PASS | PASS |
| Rating stars + submit (`ShipmentRatingSection` L117) | rate driver | PASS `rateMut` | N-A | PASS `useRateShipmentMutation`→`POST /shipments/:id/rate` | PASS loading+haptic+tick(L124); error `Alert`; disabled no-star/pending (L119) | PASS | PASS accent stars |
| Status timeline (`StatusTimeline`) | history list | N-A | N-A | N-A | N-A | PASS `status.*` | **S3 date locale** (below) |

### Saved addresses — `app/(sender)/saved-addresses.tsx` (+ `SavedAddressCard`, `SavedAddressSkeleton`)
| Element | Expected | HANDLER | NAV | API | STATES | i18n | RTL/TOKENS |
|---|---|---|---|---|---|---|---|
| Back (L149) | → back | PASS `router.back` | PASS | N-A | PASS | PASS | PASS |
| Loading/error/empty | states | PASS | N-A | PASS `useMe` | PASS skeleton(L155)/error(L152)/empty(L175) | PASS | PASS |
| Add btn (L170) | open form modal | PASS `openAdd` | N-A | N-A | PASS | PASS `shipmentNew.addAddress` | PASS |
| Card Edit (SavedAddressCard L67) | open form (edit) | PASS `openEdit` | N-A | N-A | PASS | PASS `shipmentNew.addressEdit` | PASS |
| Card Delete (SavedAddressCard L78) | open delete sheet | PASS `setDeleteTarget` | N-A | N-A | PASS | PASS `common.delete` | PASS |
| Form GPS (L243) | set loc | PASS `fillGps` | N-A | PASS `expo-location` | PASS perm `Alert` | PASS | N-A |
| Form map drag (L234) | set loc | PASS `onMove` | N-A | N-A | N-A | N-A | N-A |
| Form 6 inputs (L247-252) | edit form | PASS setters | N-A | N-A | PASS | PASS | PASS |
| Form Save (L254) | add (+ del if editing) | PASS `submitSave` | N-A | PASS `useAdd/DeleteSavedAddressMutation`→`POST/DELETE /me/addresses` | PASS loading; **generic error `errors.UNKNOWN` (L131)**; validate city/area (L109) | PASS | PASS |
| Delete confirm (L203) | delete | PASS `confirmDelete` | N-A | PASS `useDeleteSavedAddressMutation` | PASS loading; **generic error (L141)** | PASS | PASS |

Edit path = `delete` then `add` (no PATCH endpoint exists; `apps/api/src/routes/me.ts` has only POST + DELETE). If the re-add fails after the delete succeeds, the address is **lost**, surfaced only by generic `errors.UNKNOWN`. Data-loss risk + non-actionable copy. **S2.**

### Dead / legacy sender screens (opened, confirmed unreachable)
- `send.tsx`, `track.tsx` — hardcoded `Screen` + NativeWind; `href:null`, no pushes. Buttons wire to valid routes if ever reached. **S3.**
- `wallet.tsx` — static stub (3 i18n strings, no API); reachable only from dead `send` tab. **S3.**
- `history.tsx` — legacy duplicate of Shipments tab; **no error state**, no skeleton, uses `formatIQD` + NativeWind; now referenced by nothing. **S3 dead code** (was the previous S1 cancel target; cancel now → shipments tab, L252).

---

## 3. Dead code
- `app/(sender)/(tabs)/send.tsx`, `.../track.tsx` — unreachable tabs (`href:null`, no `router.push`).
- `app/(sender)/wallet.tsx` — reachable only from dead `send` tab → effectively unreachable stub.
- `app/(sender)/history.tsx` — no inbound references (`rg "\(sender\)/history"` → 0 outside itself); safe to delete.
- `lib/notifications/unread.ts` — unused `import { useEffect }` (L1); function never uses it.
- `app/(sender)/new/{dropoff,package,service,review}.tsx` — thin redirect shims to `/(sender)/new` (intentional back-compat, not harmful).

## 4. Silent failures
- **Saved-address save/delete** — was generic `errors.UNKNOWN`. **FIXED** — specific validation/network/not-found/generic messages + retry (`lib/addressErrors.ts`, `saved-addresses.tsx:52-69,130,141`).
- **Notifications** — no request, permanent empty. **DEFERRED** — removed from the tab bar this release (`(tabs)/_layout.tsx`), `TODO(push)` left on the hidden route.
- **Home hero detail** (`useShipmentDetail`, index L49) — a failed hero-detail fetch silently falls back to the list item; acceptable by design (list item carries enough data). **PASS.**
- All other async actions (create, cancel, dispute, rate, photo upload) surface server messages via `HttpApiError` + `Alert`. **PASS.**

## 5. Cross-cutting wiring
- **Socket.IO** (`hooks/useShipmentLiveChannel.ts`) — client listens `shipment:status`, `shipment:driver_assigned`, `shipment:driver_location`, `shipment:eta`. Backend emits exactly these: `apps/api/src/sockets/emitShipment.ts` (status/driver_assigned/eta) and `io.ts:72` (driver_location). Subscribe = `shipment:subscribe {trackingCode}` → server resolves to room `shipment:<id>` (`io.ts:42,145`). Payloads carry `shipmentId`; client filters by `sid` (L76,81). Cleanup on unmount: `removeAllListeners()` + `disconnect()` (L86-89). Effect deps `[mongoShipmentId, trackingCode]`. **PASS.**
- **Deep links / notification taps** — URL scheme `tayralsaad` set (`app.config.ts:6`); expo-router handles route deep-links. **No `expo-notifications` handler exists** anywhere in `apps/mobile` (grep: 0 matches), so there are no push-tap routes to verify. **UNVERIFIED / N-A (no push wiring implemented).**
- **Auth guard** — `(sender)` group has **no explicit guard**; protection is the global 401 interceptor registered in `app/_layout.tsx:34` → `logout()` + `queryClient.clear()` + `router.replace('/(auth)/login')`. `useMe`/shipment queries are `enabled` only with a token. Token-expiry lands on login without a crash. **PASS (implicit guard)** — noting there is no route-level redirect if a token is simply absent on a deep-linked sender route (the API call 401s and redirects). **UNVERIFIED at pure-navigation level.**

## 6. Additional findings (TOKENS / rules)
- **StatusTimeline** — was `toLocaleDateString`/`toLocaleTimeString` without a locale. **FIXED** — shared `formatDate(date, locale, {withTime})` (`packages/utils/src/index.ts:24-46`, `StatusTimeline.tsx:26-33`).
- **ThemeBottomSheet backdrop** — was missing `accessibilityLabel`. **FIXED** (`ThemeBottomSheet.tsx:30`).
- **ThemeBottomSheet spacing** — literals replaced with theme tokens. **FIXED** (`ThemeBottomSheet.tsx:38-45`).
- **ShipmentRouteMap** — inline hex pin colors. **FIXED** — pickup=primary, dropoff=accent, driver=success from tokens (`ShipmentRouteMap.tsx:29-33,77-82`).
- **Dead screens + unused import** — **FIXED** (deleted `send`/`track`/`wallet`/`history`, cleaned `unread.ts`).
- Legacy NativeWind on `SharedProfileScreen` predates the theme kit — classes resolve to tokens via tailwind config, no raw hex in JSX. **S3 (remaining, out of scope).**

## 7. Summary — counts by severity (post-fix)
| Severity | Original | Remaining | Items |
|---|---|---|---|
| **S1** (broken) | 0 | 0 | None. |
| **S2** (degraded) | 3 | 0 | (a) notifications stub → **deferred** (removed from bar, TODO(push)); (b) saved-address generic errors → **FIXED**; (c) saved-address edit data-loss → **FIXED** (PATCH). |
| **S3** (polish) | 6 | 1 | dead code/unused import → **FIXED**; StatusTimeline date locale → **FIXED**; ThemeBottomSheet a11y + spacing → **FIXED**; ShipmentRouteMap inline hex → **FIXED**. **Remaining:** legacy NativeWind on `SharedProfileScreen` (out of scope). |

## 8. Fix log — this batch
All changes verified with `pnpm run typecheck`: **zero new errors** vs `typecheck-baseline.txt` (still the same 4 known baseline errors; deleting `history.tsx` also retired baseline entry `app/(sender)/history.tsx(55,87)`).

| # | Item | What changed | Files (file:line) |
|---|---|---|---|
| 1 | {S2} Saved-address edit → PATCH | Replaced delete-then-add with a single owner-scoped `PATCH /me/addresses/:id`; optimistic cache update with rollback on error and `invalidate` reconcile; specific error + retry on failure. | `queries/me.ts:32-41` (`patchSavedAddress`), `queries/me.ts:71-98` (`useUpdateSavedAddressMutation`), `app/(sender)/saved-addresses.tsx:128-135` (edit path), `:65` (import). **Assumption:** endpoint exists per task; not present in checked-out `apps/api/src/routes/me.ts` (backend not edited). |
| 2 | {S2} Saved-address error classes | New classifier maps failures to validation / network / not-found / generic with retry where retryable; replaces `errors.UNKNOWN`. New AR+EN keys (Iraqi register). | `lib/addressErrors.ts` (new), `app/(sender)/saved-addresses.tsx:52-69` (`showAddressError`), `:130,:141` (usage), `packages/i18n/src/locales/{ar,en}.json` (`shipmentNew.addressErr{Validation,Network,NotFound,Generic}`). |
| 3 | {S2} Notifications off the bar | Notifications hidden via `href:null` with `TODO(push)`; screen file kept compilable. Tab bar rebuilt for 3 tabs balanced around the centered FAB (left/right groups + reserved FAB slot); removed fragile sliding-dot math (per-tab focused dot) and dead unread badge. | `app/(sender)/(tabs)/_layout.tsx:14-18`, `components/navigation/SenderTabBar.tsx` (rewrite). |
| 4 | Auth guard (route-level) | `(sender)` layout waits for hydration then `<Redirect href="/(auth)/login">` when no token/user — before children mount, no flash. 401 interceptor untouched (second line of defense). | `app/(sender)/_layout.tsx:5-22`. |
| 5 | {S3} StatusTimeline dates | All timeline dates/times routed through a new shared `formatDate(date, locale, {withTime})` (correct AR month names/numerals); removed bare `toLocaleDateString`. | `packages/utils/src/index.ts:24-46` (new `formatDate`), `components/shipment/StatusTimeline.tsx:2-5,26-33`. |
| 6 | {S3} Dead code | Deleted `send.tsx`, `track.tsx`, `wallet.tsx`, `(sender)/history.tsx`; removed their layout entries; removed unused `useEffect` import. Grep confirms no remaining nav references. | deleted 4 files; `app/(sender)/_layout.tsx`, `app/(sender)/(tabs)/_layout.tsx`, `lib/notifications/unread.ts`. |
| 7 | {S3} ThemeBottomSheet | Backdrop `accessibilityLabel={t('common.close')}`; padding/handle spacing moved to theme tokens. | `components/ui/ThemeBottomSheet.tsx:28-45,62-81`. |
| 8 | {S3} ShipmentRouteMap | Pin colors from theme tokens (pickup=primary, dropoff=accent, driver=success); removed inline hex. | `components/shipment/ShipmentRouteMap.tsx:7,29-33,77-82`. |

Notes: The saved-address `PATCH` client is wired per the task's statement that the backend now provides it; it is **not** visible in the currently checked-out `apps/api/src/routes/me.ts` (which lists only GET/PATCH `/me`, POST + DELETE `/me/addresses`). No backend files were modified — confirm the route is deployed. Item 3 leaves 3 visible tabs; the FAB is centered via a reserved center slot with a 2/1 left/right split (documented deviation from the literal "4 tabs", since removing notifications leaves three).
