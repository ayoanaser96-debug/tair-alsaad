import type { Types } from 'mongoose';

import { DriverModel } from '../models/Driver.js';
import { UserModel } from '../models/User.js';

type LeanShipment = Record<string, unknown> & {
  senderId?: Types.ObjectId | string;
  driverId?: Types.ObjectId | string;
};

function toPlain(doc: unknown): LeanShipment {
  if (!doc || typeof doc !== 'object') return {};
  const raw = doc as { toObject?: () => Record<string, unknown> };
  return (typeof raw.toObject === 'function' ? raw.toObject() : doc) as LeanShipment;
}

/** Attach sender contact fields and populated driver card for mobile receiver UX. */
export async function enrichShipmentDocs(docs: unknown[]): Promise<Record<string, unknown>[]> {
  if (!docs.length) return [];

  const plain = docs.map(toPlain);
  const senderIds = [
    ...new Set(plain.map((s) => String(s.senderId ?? '')).filter((id) => id.length > 0)),
  ];
  const driverMongoIds = [
    ...new Set(plain.map((s) => String(s.driverId ?? '')).filter((id) => id.length > 0)),
  ];

  const [senders, drivers] = await Promise.all([
    senderIds.length
      ? UserModel.find({ _id: { $in: senderIds } })
          .select({ name: 1, phone: 1 })
          .lean()
      : Promise.resolve([]),
    driverMongoIds.length
      ? DriverModel.find({ _id: { $in: driverMongoIds } })
          .select({ userId: 1, vehicle: 1 })
          .lean()
      : Promise.resolve([]),
  ]);

  const senderById = new Map(senders.map((u) => [String(u._id), u]));
  const driverById = new Map(drivers.map((d) => [String(d._id), d]));
  const driverUserIds = [...new Set(drivers.map((d) => String(d.userId)).filter(Boolean))];
  const driverUsers = driverUserIds.length
    ? await UserModel.find({ _id: { $in: driverUserIds } })
        .select({ name: 1, phone: 1, avatarUrl: 1, rating: 1 })
        .lean()
    : [];
  const driverUserById = new Map(driverUsers.map((u) => [String(u._id), u]));

  return plain.map((shipment) => {
    const sender = senderById.get(String(shipment.senderId ?? ''));
    const driverMongo = shipment.driverId ? driverById.get(String(shipment.driverId)) : undefined;
    const driverUser = driverMongo ? driverUserById.get(String(driverMongo.userId)) : undefined;

    const enriched: Record<string, unknown> = {
      ...shipment,
      ...(sender
        ? {
            senderName: sender.name ?? '',
            senderPhone: sender.phone ?? '',
          }
        : {}),
    };

    if (driverMongo && driverUser) {
      enriched.driverId = {
        _id: driverMongo._id,
        vehicle: driverMongo.vehicle,
        userId: {
          _id: driverUser._id,
          name: driverUser.name,
          phone: driverUser.phone,
          avatarUrl: driverUser.avatarUrl ?? null,
          rating: driverUser.rating ?? { average: 0, count: 0 },
        },
      };
    }

    return enriched;
  });
}

export async function enrichShipmentDoc(doc: unknown): Promise<Record<string, unknown>> {
  const [enriched] = await enrichShipmentDocs([doc]);
  return enriched ?? {};
}
