import type { HydratedDocument, InferRawDocType } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

const vehicleSchema = new Schema(
  {
    type: { type: String, enum: ['motorcycle', 'car', 'van'], required: true },
    plate: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
  },
  { _id: false },
);

const documentsSchema = new Schema(
  {
    idFrontUrl: { type: String, required: true },
    idBackUrl: { type: String, required: true },
    licenseUrl: { type: String, required: true },
    vehicleRegUrl: { type: String, required: true },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
);

const driverSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['pending_review', 'active', 'suspended', 'rejected'],
      default: 'pending_review',
    },
    vehicle: { type: vehicleSchema, required: true },
    documents: { type: documentsSchema, required: true },
    serviceCities: { type: [String], default: [], index: true },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date },
    },
    isOnline: { type: Boolean, default: false, index: true },
    earnings: {
      available: { type: Number, default: 0 },
      pendingPayout: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

driverSchema.index({ isOnline: 1, status: 1, serviceCities: 1 });

export type DriverDocRaw = InferRawDocType<typeof driverSchema>;
export type DriverDocument = HydratedDocument<DriverDocRaw>;

export const DriverModel = mongoose.model('Driver', driverSchema);
