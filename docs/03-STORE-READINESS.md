# Store Readiness — Google Play + Apple App Store

This is what gets a delivery app rejected, and how to avoid it. Work through this before submitting.

---

## 1. Common rejection reasons for delivery apps (battle scars)

| # | Reason | Where you'll trip |
|---|---|---|
| 1 | **Background location without strong justification** | Driver tracking |
| 2 | **No account deletion in-app** | Required by both stores since 2022/2024 |
| 3 | **Missing or generic privacy policy** | Apple + Google both require live URL |
| 4 | **Permissions requested without context** | Camera, location, contacts, notifications |
| 5 | **Login required to see anything** | App Store reviewers can't evaluate it — provide demo account |
| 6 | **Crashy beta builds** | EAS Build → run on real devices first |
| 7 | **Asking for ATT prompt incorrectly** | iOS only, only if you actually track for ads |
| 8 | **Payment outside store rules** | Physical delivery is exempt, but you must not facilitate digital goods |
| 9 | **Inadequate data safety form** | Google Play Data Safety section must match what the app actually does |
| 10 | **Driver-side app appears "business only"** | Apple wants a unified app or clearly justified two apps |

---

## 2. Apple App Store readiness

### Required URLs (live before submission)
- Privacy Policy: `https://tayralsaad.com/legal/privacy` (AR + EN)
- Terms of Use: `https://tayralsaad.com/legal/terms`
- Support: `https://tayralsaad.com/support` or email `support@tayralsaad.com`

### Info.plist usage descriptions (write specifically, not generically)
```
NSLocationWhenInUseUsageDescription
  AR: نحتاج موقعك لتحديد نقطة الاستلام أو التوصيل ولعرض السائقين القريبين منك.
  EN: We use your location to set pickup/dropoff points and to show nearby drivers.

NSLocationAlwaysAndWhenInUseUsageDescription   (drivers only build, or runtime-conditional)
  AR: عند تفعيل وضع السائق نحتاج تتبّع موقعك أثناء التوصيل ليتمكّن العميل من متابعة الشحنة لحظة بلحظة، حتى لو كان التطبيق في الخلفية.
  EN: When you are an active driver, we track your location during deliveries so customers can follow their shipment live, even when the app is in the background.

NSCameraUsageDescription
  AR: نستخدم الكاميرا لالتقاط صورة إثبات التسليم ولتصوير وثائق التحقق للسائقين.
  EN: We use the camera to capture proof of delivery and to capture verification documents for drivers.

NSPhotoLibraryAddUsageDescription
  AR: لحفظ إيصال التسليم أو صورة الشحنة على جهازك.
  EN: To save delivery receipts or shipment photos to your device.

NSContactsUsageDescription                     (only if you implement "pick from contacts")
  AR: لاختيار جهة الاتصال كمستلِم للشحنة دون كتابة الرقم يدوياً.
  EN: To pick a contact as the shipment receiver without typing the number manually.
```

### Capabilities (Xcode / EAS)
- Push Notifications
- Background Modes → Location updates (driver build path) + Remote notifications
- Maps (if using MapKit)
- Associated Domains (for universal links to tracking pages)

### Privacy nutrition label (App Store Connect → Privacy)
Match what the app does. For Tayr Al-Saad expect to declare:
- **Contact Info**: Name, Phone (linked to user, used for app functionality, NOT for tracking)
- **Location**: Precise location (linked to user, used for app functionality)
- **User Content**: Photos (linked to user, used for app functionality)
- **Identifiers**: User ID (linked to user, used for app functionality)
- **Diagnostics**: Crash data (NOT linked, used for app functionality) — Sentry

> "Linked to user" means tied to identity. "Used for tracking" means cross-app/cross-site for ads — we are NOT doing this. If you aren't, do NOT show the ATT prompt.

### Demo account for App Review
Provide a sender account + a driver account credential pair in the review notes. Without one, expect rejection. Example:
```
Sender: +9647000000001 / OTP: 123456 (test mode)
Driver: +9647000000002 / OTP: 123456 (test mode)
Server bypass: set NODE_ENV=staging on a reviewer-only endpoint
```

### Required user-facing features
- ✅ **Account deletion in-app** — Settings → "حذف الحساب / Delete account" → confirmation → soft-delete on server within 30 days
- ✅ **Sign out**
- ✅ **Language toggle** AR/EN (don't force device language only)
- ✅ **Report a problem** flow

### App Store Connect metadata
- App name (AR): `طير السعد` · subtitle: `توصيل بأمان`
- App name (EN): `Tayr Al-Saad` · subtitle: `Trusted delivery, on time`
- Primary category: **Business** (delivery driver) or **Travel** (consumer). For unified app: **Travel**.
- Age rating: 4+ (no objectionable content, no UGC chat unless gated)
- Screenshots: 6.7" iPhone + 6.5" iPhone + iPad if you ship iPad
- Each screenshot in AR variant and EN variant

---

## 3. Google Play readiness

### Permissions (declare in AndroidManifest, justify in Console)
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>  <!-- driver only -->
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION"/>
```

### Background location declaration (the big one)
Google requires a separate written justification + an in-app demo video. Without it, the listing gets blocked. Use this exact framing:

> Tayr Al-Saad is a delivery dispatch app. The driver role uses background location to enable live tracking by the customer while the driver is en route. Location is collected only when the driver is assigned to an active shipment and is stopped immediately when the shipment is marked Delivered, Cancelled, or the driver goes offline. Location is not used for advertising, profiling, or shared with third parties.

In-app: show a clear "You are now tracking deliveries" indicator while the foreground service is active.

### Foreground service for driver location
- Type: `location`
- Persistent notification: "طير السعد · جاري توصيل الشحنة" with "إيقاف" action
- Start only after driver accepts a shipment, stop on final status

### Data Safety form (Play Console → Data Safety)
Be exact. Mismatches with the privacy policy cause rejection. Declare:
| Data type | Collected | Shared | Optional | Purpose |
|---|---|---|---|---|
| Name | Yes | No | No | Account, fulfillment |
| Phone | Yes | No | No | Account, OTP, fulfillment |
| Precise location | Yes | No | No (driver), Yes (sender) | App functionality |
| Photos | Yes | No | No | App functionality (POD) |
| App crashes | Yes | Yes (Sentry) | No | Analytics |
| User-generated content (ratings) | Yes | No | Yes | App functionality |

**No ads, no analytics SDKs that track users across apps** unless you really need them.

### Required in-app
- ✅ Account deletion (same as iOS)
- ✅ Privacy policy link visible from settings + sign-in
- ✅ Target SDK = API 34 (Android 14) or higher
- ✅ 64-bit AAB
- ✅ Signed with a long-lived upload key (use Google Play App Signing)

### Play Console listing
- App name (default): `طير السعد - Tayr Al-Saad`
- Short description (AR + EN, 80 chars each)
- Full description (AR + EN, 4000 chars each)
- Screenshots: minimum 2, recommended 4-8 per language
- Feature graphic 1024×500
- App icon 512×512 (PNG, transparent or full bleed — pick one)
- Content rating questionnaire
- Target audience: 18+ (driver-facing); 13+ if sender-only build

---

## 4. Privacy policy outline (host at `tayralsaad.com/legal/privacy`)

Required sections — both AR and EN:

1. **Identity of the controller** — Utu, Baghdad, Iraq, contact email
2. **Data we collect** — name, phone, location, photos, device info
3. **Why we collect it** — fulfillment, dispatch, safety, payments, compliance
4. **Legal basis** (where applicable) — contract performance + legitimate interest
5. **Third parties** — list each: Twilio (or local SMS), Cloudinary, Google Maps, payment provider, Sentry, FCM/APNs
6. **Data retention** — accounts: until deletion or 24 months inactivity; shipment proof photos: 90 days; logs: 30 days
7. **Your rights** — access, correction, deletion, withdraw consent
8. **Account deletion** — step-by-step how + email fallback
9. **Children** — service is 18+, we do not knowingly collect from minors
10. **Security** — encryption in transit and at rest, OTP-only auth
11. **International transfers** — server location (Atlas region) + safeguards
12. **Changes to this policy** — notification mechanism
13. **Contact** — privacy@tayralsaad.com

---

## 5. Pre-submission checklist (run through this on a real device)

### Functional
- [ ] OTP flow works end-to-end with a real phone
- [ ] App opens to last-used language (default AR)
- [ ] Both AR and EN render correctly on every screen
- [ ] RTL layout passes manual review on every screen
- [ ] Foreground service notification appears when driver accepts a shipment
- [ ] Foreground service stops on delivered/cancelled/offline
- [ ] Account deletion works and removes PII server-side
- [ ] Sign out clears tokens from secure storage
- [ ] Permission prompts only appear at the moment of use, not at launch
- [ ] App handles airplane mode / no-signal gracefully (queue + retry)

### Performance
- [ ] Cold start under 3 seconds on a mid-range Android (e.g. Galaxy A14)
- [ ] No console errors in production build
- [ ] Crash-free sessions > 99.5% on internal testing
- [ ] Bundle size: AAB under 50MB, IPA under 50MB

### Legal
- [ ] Privacy policy live, accessible, AR + EN
- [ ] Terms of use live, accessible, AR + EN
- [ ] In-app links to both visible before sign-up
- [ ] Account deletion documented and accessible without login is possible via email

### Store assets
- [ ] App icon: 1024×1024 master, exports per platform
- [ ] Screenshots: 6-8 per language per platform
- [ ] Feature graphic for Play
- [ ] Demo account credentials for Apple Review
- [ ] Demo video for Play background location

### Builds
- [ ] EAS Build profile `production` configured
- [ ] Sentry uploads source maps in production builds
- [ ] iOS: build with distribution provisioning, ATS exceptions justified
- [ ] Android: signed AAB uploaded via Play App Signing
- [ ] Internal testing tracks active on both stores for one week before public release

---

## 6. After-launch monitoring

- Sentry crash rate threshold: alert if > 0.5% sessions affected
- API p99 latency alert: > 1.5s
- Driver foreground service uptime: track how often it dies mid-shipment
- Refund/dispute rate: weekly review
- OTP delivery success rate by carrier: alert if < 95%
