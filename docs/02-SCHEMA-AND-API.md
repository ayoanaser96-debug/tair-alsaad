# Schema & API — طير السعد

Single source of truth for data shapes and endpoints. Mirror these types in `packages/types`.

---

## 1. Status enums (English keys, always)

```ts
export type ShipmentStatus =
  | 'pending'        // created, awaiting driver
  | 'assigned'       // driver accepted
  | 'arrived_pickup' // driver at pickup point
  | 'picked_up'      // package in driver's hands
  | 'in_transit'     // on the way to receiver
  | 'arrived_dropoff'
  | 'delivered'      // confirmed by receiver OTP
  | 'cancelled'
  | 'disputed';

export type PaymentMethod = 'cash_on_delivery' | 'zaincash' | 'fastpay' | 'fib' | 'asia_hawala';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';

export type Role = 'sender' | 'driver' | 'admin';
export type DriverStatus = 'pending_review' | 'active' | 'suspended' | 'rejected';
export type PackageType = 'envelope' | 'small' | 'medium' | 'large' | 'fragile' | 'cold';
export type ServiceTier = 'standard' | 'express' | 'scheduled';
```

---

## 2. Mongoose models (shapes)

### User
```ts
{
  _id: ObjectId,
  phone: string,              // "+9647712345678", unique, indexed
  name: string,
  role: Role,                 // default 'sender'; promoted to 'driver' after approval
  preferredLanguage: 'ar' | 'en',  // default 'ar'
  avatarUrl?: string,
  defaultAddresses: Address[],
  rating: { average: number, count: number },
  createdAt, updatedAt
}
```

### Driver (extends User by ref)
```ts
{
  _id: ObjectId,
  userId: ObjectId,           // → User
  status: DriverStatus,
  vehicle: {
    type: 'motorcycle' | 'car' | 'van',
    plate: string,
    model: string,
    color: string,
  },
  documents: {
    idFrontUrl: string,       // Cloudinary signed URL
    idBackUrl: string,
    licenseUrl: string,
    vehicleRegUrl: string,
    verifiedAt?: Date,
    verifiedBy?: ObjectId,
  },
  serviceCities: string[],    // ['baghdad', 'basra']
  currentLocation?: { lat: number, lng: number, updatedAt: Date },
  isOnline: boolean,
  earnings: {
    available: number,        // IQD, pending payout
    pendingPayout: number,
    totalEarned: number,
  },
  createdAt, updatedAt
}
```

### Address
```ts
{
  label?: string,             // "البيت" / "Home"
  city: string,               // canonical key, e.g. 'baghdad'
  area: string,               // free text, e.g. "الكرادة"
  street?: string,
  building?: string,
  notes?: string,
  location: { lat: number, lng: number },
}
```

### Shipment
```ts
{
  _id: ObjectId,
  trackingCode: string,       // 8 chars, uppercase, unique, e.g. "AB12CD34"
  senderId: ObjectId,         // → User
  driverId?: ObjectId,        // → Driver
  
  pickup: Address,
  dropoff: Address,
  
  receiver: {
    name: string,
    phone: string,
  },
  
  package: {
    type: PackageType,
    weightTier: 'light' | 'medium' | 'heavy',  // <1kg / 1-5kg / >5kg
    description?: string,
    declaredValue?: number,   // IQD, for insurance
  },
  
  service: ServiceTier,
  scheduledFor?: Date,        // for 'scheduled' tier
  
  pricing: {
    base: number,
    distance: number,
    surcharge: number,
    surge: number,            // multiplier × 100, e.g. 120 = 1.2x
    total: number,            // IQD, integer
    driverPayout: number,     // 80% of total typically
  },
  
  payment: {
    method: PaymentMethod,
    status: PaymentStatus,
    providerRef?: string,
    paidAt?: Date,
  },
  
  status: ShipmentStatus,
  statusHistory: Array<{
    status: ShipmentStatus,
    at: Date,
    by?: ObjectId,
    location?: { lat: number, lng: number },
  }>,
  
  pickupOtp: string,          // 4 digits, sender shows to driver
  deliveryOtp: string,        // 4 digits, receiver shows to driver
  
  proofs: {
    pickupPhotoUrl?: string,
    deliveryPhotoUrl?: string,
    signatureUrl?: string,
  },
  
  rating?: {
    stars: 1 | 2 | 3 | 4 | 5,
    comment?: string,
    at: Date,
  },
  
  cancelledReason?: string,
  cancelledAt?: Date,
  
  createdAt, updatedAt
}
```

### City (pricing/zones)
```ts
{
  _id: ObjectId,
  key: string,                // 'baghdad'
  nameAr: string,             // 'بغداد'
  nameEn: string,             // 'Baghdad'
  active: boolean,
  pricing: {
    baseFare: number,         // IQD
    perKm: number,
    minimumFare: number,
    packageMultipliers: Record<PackageType, number>,
    serviceMultipliers: Record<ServiceTier, number>,
  },
  zones: Array<{              // optional polygons
    name: string,
    polygon: number[][],      // [[lng, lat], ...]
    surcharge: number,
  }>,
}
```

### PayoutBatch
```ts
{
  _id: ObjectId,
  driverId: ObjectId,
  shipmentIds: ObjectId[],
  amount: number,             // IQD
  method: 'bank_transfer' | 'zaincash' | 'cash',
  status: 'pending' | 'processing' | 'completed' | 'failed',
  reference?: string,
  processedAt?: Date,
  createdAt,
}
```

---

## 3. REST API

All routes prefixed `/api/v1`. JSON in/out. Auth via `Authorization: Bearer <accessToken>`.

### Auth
```
POST   /auth/otp/request          { phone }                 → { ok, expiresIn }
POST   /auth/otp/verify           { phone, code, name? }    → { user, accessToken, refreshToken }
POST   /auth/refresh              { refreshToken }          → { accessToken, refreshToken }
POST   /auth/logout                                         → 204
```

### User
```
GET    /me                                                  → User
PATCH  /me                        { name?, preferredLanguage?, avatarUrl? }
POST   /me/addresses              Address                    → User
DELETE /me/addresses/:id                                    → User
```

### Driver
```
POST   /driver/apply              { vehicle, documents }    → Driver (status pending_review)
GET    /driver/me                                           → Driver
PATCH  /driver/online             { isOnline }              → Driver
POST   /driver/location           { lat, lng }              → 204  (also emit via socket)
GET    /driver/earnings                                     → { available, pendingPayout, totalEarned, recent[] }
POST   /driver/payout/request                               → PayoutBatch
```

### Shipments — sender
```
POST   /shipments/quote           { pickup, dropoff, package, service }  → { pricing, etaMinutes }
POST   /shipments                 quote payload + receiver + paymentMethod → Shipment
GET    /shipments/mine            ?status&page                → { items, total }
GET    /shipments/:id                                       → Shipment
POST   /shipments/:id/cancel      { reason }                → Shipment
POST   /shipments/:id/rate        { stars, comment }        → Shipment
```

### Shipments — driver
```
GET    /shipments/feed            ?lat&lng&radius            → Shipment[]   (pending only, within radius)
POST   /shipments/:id/accept                                → Shipment      (status → assigned)
POST   /shipments/:id/arrived-pickup
POST   /shipments/:id/pickup      { otp, photoUrl }         → Shipment      (status → picked_up)
POST   /shipments/:id/arrived-dropoff
POST   /shipments/:id/deliver     { otp, photoUrl, signatureUrl? }  → Shipment  (status → delivered)
POST   /shipments/:id/dispute     { reason, photoUrls[] }   → Shipment
```

### Public tracking (no auth)
```
GET    /track/:trackingCode                                 → {
  status, pickupCity, dropoffCity, receiver: { firstName },
  driver?: { firstName, photoUrl, rating, vehicle: { type, plate } },
  driverLocation?: { lat, lng, at },
  etaMinutes?, statusHistory: [{ status, at }]
}
```

### Admin
```
GET    /admin/overview                                      → KPIs
GET    /admin/drivers             ?status&page              → paginated
PATCH  /admin/drivers/:id/status  { status, reason? }       → Driver
GET    /admin/shipments           filters                   → paginated
GET    /admin/cities                                        → City[]
PATCH  /admin/cities/:id          partial                   → City
GET    /admin/disputes            ?status                   → paginated
POST   /admin/disputes/:id/resolve { resolution, refundAmount? }
GET    /admin/payouts             filters                   → paginated
POST   /admin/payouts/:id/process { reference }             → PayoutBatch
```

---

## 4. Socket.IO events

### Rooms
- `shipment:{shipmentId}` — sender + driver + receiver (anon)
- `driver:{driverId}` — driver's own private room (for direct dispatch)
- `admin` — all admins

### Client → server
```
socket.emit('driver:location', { lat, lng })          // driver only, throttled to 5s
socket.emit('shipment:subscribe', { trackingCode })   // public, receiver tracking
```

### Server → client
```
socket.on('shipment:status', { shipmentId, status, at })
socket.on('shipment:driver_assigned', { shipmentId, driver })
socket.on('shipment:driver_location', { shipmentId, lat, lng, at })
socket.on('shipment:eta', { shipmentId, etaMinutes })
socket.on('driver:new_request', { shipment })         // direct dispatch
```

---

## 5. Common response shapes

### Success
```json
{ "ok": true, "data": { ... } }
```

### Error
```json
{
  "ok": false,
  "error": {
    "code": "OTP_INVALID",
    "message": "رمز التحقق غير صحيح",
    "messageEn": "Invalid verification code"
  }
}
```

Error codes are stable strings. Mobile/web map them to user-facing translations via `t('errors.OTP_INVALID')` with the server-provided message as fallback.
