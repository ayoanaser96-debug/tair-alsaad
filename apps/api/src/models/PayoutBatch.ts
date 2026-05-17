import type { HydratedDocument, InferRawDocType } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

const payoutBatchSchema = new Schema(
  {
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    shipmentIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Shipment' }], default: [] },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['bank_transfer', 'zaincash', 'cash'], required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    reference: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true },
);

export type PayoutBatchDocRaw = InferRawDocType<typeof payoutBatchSchema>;
export type PayoutBatchDocument = HydratedDocument<PayoutBatchDocRaw>;

export const PayoutBatchModel = mongoose.model('PayoutBatch', payoutBatchSchema);
