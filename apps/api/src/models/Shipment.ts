import type { HydratedDocument, InferRawDocType } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

const addressSchema = new Schema(
  {
    label: { type: String },
    city: { type: String, required: true },
    area: { type: String, required: true },
    street: { type: String },
    building: { type: String },
    notes: { type: String },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { _id: false },
);

const pricingSchema = new Schema(
  {
    base: { type: Number, required: true },
    distance: { type: Number, required: true },
    surcharge: { type: Number, required: true, default: 0 },
    surge: { type: Number, required: true }, // multiplier × 100, e.g. 120 => 1.2x
    total: { type: Number, required: true },
    driverPayout: { type: Number, required: true },
  },
  { _id: false },
);

const paymentSchema = new Schema(
  {
    method: {
      type: String,
      enum: ['cash_on_delivery', 'zaincash', 'fastpay', 'fib', 'asia_hawala'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'pending',
    },
    providerRef: { type: String },
    paidAt: { type: Date },
  },
  { _id: false },
);

const proofsSchema = new Schema(
  {
    pickupPhotoUrl: { type: String },
    deliveryPhotoUrl: { type: String },
    signatureUrl: { type: String },
  },
  { _id: false },
);

const shipmentRatingSchema = new Schema(
  {
    stars: { type: Number, enum: [1, 2, 3, 4, 5], required: true },
    comment: { type: String },
    at: { type: Date, required: true },
  },
  { _id: false },
);

const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'assigned',
        'arrived_pickup',
        'picked_up',
        'in_transit',
        'arrived_dropoff',
        'delivered',
        'cancelled',
        'disputed',
      ],
    },
    at: { type: Date, required: true },
    by: { type: Schema.Types.ObjectId },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false },
);

const shipmentPackageSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['envelope', 'small', 'medium', 'large', 'fragile', 'cold'],
      required: true,
    },
    weightTier: {
      type: String,
      enum: ['light', 'medium', 'heavy'],
      required: true,
    },
    description: { type: String },
    declaredValue: { type: Number },
  },
  { _id: false },
);

const receiverSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

const disputeSchema = new Schema(
  {
    reason: { type: String },
    photoUrls: { type: [String], default: [] },
    openedAt: { type: Date },
    resolution: { type: String },
    refundAmount: { type: Number },
    resolvedAt: { type: Date },
    resolved: { type: Boolean, default: false },
  },
  { _id: false },
);

const shipmentSchema = new Schema(
  {
    trackingCode: { type: String, required: true, unique: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', index: true },

    pickup: { type: addressSchema, required: true },
    dropoff: { type: addressSchema, required: true },

    receiver: { type: receiverSchema, required: true },

    package: { type: shipmentPackageSchema, required: true },

    service: { type: String, enum: ['standard', 'express', 'scheduled'], required: true },
    scheduledFor: { type: Date },

    pricing: { type: pricingSchema, required: true },
    payment: { type: paymentSchema, required: true },

    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'assigned',
        'arrived_pickup',
        'picked_up',
        'in_transit',
        'arrived_dropoff',
        'delivered',
        'cancelled',
        'disputed',
      ],
      default: 'pending',
      index: true,
    },

    statusHistory: { type: [statusHistorySchema], default: [] },

    pickupOtp: { type: String, required: true },
    deliveryOtp: { type: String, required: true },

    proofs: { type: proofsSchema, default: {} },
    rating: { type: shipmentRatingSchema },

    cancelledReason: { type: String },
    cancelledAt: { type: Date },

    dispute: { type: disputeSchema },
    etaMinutes: { type: Number },
  },
  { timestamps: true },
);

shipmentSchema.index({ 'pickup.city': 1, status: 1 });

export type ShipmentDocRaw = InferRawDocType<typeof shipmentSchema>;
export type ShipmentDocument = HydratedDocument<ShipmentDocRaw>;

export const ShipmentModel = mongoose.model('Shipment', shipmentSchema);
