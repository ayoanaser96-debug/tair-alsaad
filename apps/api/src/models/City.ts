import type { HydratedDocument, InferRawDocType } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

const pricingSchema = new Schema(
  {
    baseFare: { type: Number, required: true },
    perKm: { type: Number, required: true },
    minimumFare: { type: Number, required: true },
    packageMultipliers: { type: Schema.Types.Mixed, required: true },
    serviceMultipliers: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false },
);

const zonesSchema = new Schema(
  {
    name: { type: String, required: true },
    polygon: { type: [[[Number]]], required: true },
    surcharge: { type: Number, required: true },
  },
  { _id: false },
);

const citySchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, index: true },
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    active: { type: Boolean, default: true },
    pricing: { type: pricingSchema, required: true },
    zones: { type: [zonesSchema], default: [] },
  },
  { timestamps: false },
);

export type CityDocRaw = InferRawDocType<typeof citySchema>;
export type CityDocument = HydratedDocument<CityDocRaw>;

export const CityModel = mongoose.model('City', citySchema);
