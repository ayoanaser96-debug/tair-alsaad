import mongoose from 'mongoose';

import { connectDb } from '../config/db.js';
import { CityModel } from '../models/City.js';
import { DriverModel } from '../models/Driver.js';
import { ShipmentModel } from '../models/Shipment.js';
import { UserModel } from '../models/User.js';

import { generateTrackingCode } from '@tayralsaad/utils';

const pkgMultiplier = (): Record<string, number> => ({
  envelope: 1,
  small: 1.05,
  medium: 1.15,
  large: 1.25,
  fragile: 1.35,
  cold: 1.4,
});

const svcMultiplier = (): Record<string, number> => ({
  standard: 1,
  express: 1.25,
  scheduled: 1.1,
});

function docsSpec() {
  return {
    idFrontUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    idBackUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    licenseUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    vehicleRegUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  };
}

async function purge() {
  await Promise.all([
    ShipmentModel.deleteMany({}),
    DriverModel.deleteMany({}),
    CityModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);
}

async function main() {
  await connectDb();
  console.info('[seed] clearing collections …');
  await purge();

  await CityModel.insertMany([
    { key: 'baghdad', nameAr: 'بغداد', nameEn: 'Baghdad', active: true,
      pricing: { baseFare: 5000, perKm: 1800, minimumFare: 8000,
        packageMultipliers: pkgMultiplier(), serviceMultipliers: svcMultiplier() }, zones: [] },
    { key: 'basra', nameAr: 'البصرة', nameEn: 'Basra', active: true,
      pricing: { baseFare: 4500, perKm: 1600, minimumFare: 7500,
        packageMultipliers: pkgMultiplier(), serviceMultipliers: svcMultiplier() }, zones: [] },
    { key: 'erbil', nameAr: 'أربيل', nameEn: 'Erbil', active: true,
      pricing: { baseFare: 4800, perKm: 1700, minimumFare: 7800,
        packageMultipliers: pkgMultiplier(), serviceMultipliers: svcMultiplier() }, zones: [] },
    { key: 'mosul', nameAr: 'الموصل', nameEn: 'Mosul', active: true,
      pricing: { baseFare: 4700, perKm: 1650, minimumFare: 7600,
        packageMultipliers: pkgMultiplier(), serviceMultipliers: svcMultiplier() }, zones: [] },
    { key: 'najaf', nameAr: 'النجف', nameEn: 'Najaf', active: true,
      pricing: { baseFare: 4300, perKm: 1500, minimumFare: 7200,
        packageMultipliers: pkgMultiplier(), serviceMultipliers: svcMultiplier() }, zones: [] },
    { key: 'karbala', nameAr: 'كربلاء', nameEn: 'Karbala', active: true,
      pricing: { baseFare: 4300, perKm: 1500, minimumFare: 7200,
        packageMultipliers: pkgMultiplier(), serviceMultipliers: svcMultiplier() }, zones: [] },
    { key: 'sulaymaniyah', nameAr: 'السليمانية', nameEn: 'Sulaymaniyah', active: true,
      pricing: { baseFare: 4600, perKm: 1650, minimumFare: 7400,
        packageMultipliers: pkgMultiplier(), serviceMultipliers: svcMultiplier() }, zones: [] },
    { key: 'kirkuk', nameAr: 'كركوك', nameEn: 'Kirkuk', active: true,
      pricing: { baseFare: 4500, perKm: 1600, minimumFare: 7300,
        packageMultipliers: pkgMultiplier(), serviceMultipliers: svcMultiplier() }, zones: [] },
  ]);

  await UserModel.create({
    phone: '+964779000099',
    name: 'مسؤول النظام',
    role: 'admin',
    preferredLanguage: 'ar',
    rating: { average: 5, count: 1 },
  });

  const senderPhones = ['+964771111101', '+964771111102', '+964771111103', '+964771111104', '+964771111105'];
  const senderNames = ['زينب العراقي', 'كاظم عبد الله', 'سارة حميد', 'علي محمد', 'نور عبد الرحيم'];
  const senders = await UserModel.insertMany(
    senderPhones.map((phone, idx) => ({
      phone,
      name: senderNames[idx] ?? `Sender ${idx + 1}`,
      role: 'sender' as const,
      preferredLanguage: idx % 2 === 0 ? 'ar' : 'en',
      rating: { average: 5, count: 1 },
    })),
  );

  const driverPhones = ['+964772222201', '+964772222202', '+964772222203', '+964772222204', '+964772222205'];
  const driverNames = ['حيدر عبد الله', 'مصطفى كريم', 'سجاد محمد', 'رعد علي', 'بشار خالد'];

  const driverUsers = await UserModel.insertMany(
    driverPhones.map((phone, idx) => ({
      phone,
      name: driverNames[idx] ?? `Driver ${idx}`,
      role: 'driver' as const,
      preferredLanguage: 'ar' as const,
      rating: { average: 4.6 + idx * 0.05, count: 40 + idx },
    })),
  );

  const geo = { lat: 33.3152, lng: 44.3661 };
  const offsets: Array<[number, number]> = [
    [0.001, 0.001],
    [-0.002, 0.002],
    [0.0025, -0.0015],
    [-0.001, -0.004],
    [0.004, 0.003],
  ];

  await Promise.all(
    driverUsers.map((user, idx) => {
      const [dLat, dLng] = offsets[idx]!;
      const model = ['Honda PCX', 'Bajaj Boxer', 'Yamaha NMAX', 'Honda Cargo', 'Suzuki Access'][idx]!;
      return DriverModel.create({
        userId: user._id,
        status: 'active',
        serviceCities: ['baghdad', 'basra'],
        isOnline: true,
        earnings: {
          available: 20_000 + idx * 2500,
          pendingPayout: 5000 + idx * 500,
          totalEarned: 180_000 + idx * 20_000,
        },
        currentLocation: { lat: geo.lat + dLat, lng: geo.lng + dLng, updatedAt: new Date() },
        vehicle: {
          type: 'motorcycle',
          plate: `BGD-${110 + idx}`,
          model,
          color: 'أسود',
        },
        documents: docsSpec(),
      });
    }),
  );

  const drivers = await DriverModel.find().sort({ createdAt: 1 }).lean();
  console.info('[seed] drivers ready:', drivers.length);

  const pickup = {
    label: 'المكتب',
    city: 'baghdad',
    area: 'الكرادة',
    street: 'شارع الأميرات',
    location: geo,
  };

  const dropoff = {
    label: 'المنزل',
    city: 'baghdad',
    area: 'المنصور',
    street: 'سكة 14',
    location: { lat: 33.3041, lng: 44.3455 },
  };

  const pricing = {
    base: 5000,
    distance: 5200,
    surcharge: 0,
    surge: 118,
    total: 16_900,
    driverPayout: 13_520,
  };

  type Template = {
    status: string;
    needsDriver?: boolean;
    extras?: Record<string, unknown>;
  };

  const templates: Template[] = [
    { status: 'pending' },
    { status: 'pending' },
    { status: 'assigned', needsDriver: true },
    { status: 'arrived_pickup', needsDriver: true },
    { status: 'picked_up', needsDriver: true },
    { status: 'in_transit', needsDriver: true },
    { status: 'arrived_dropoff', needsDriver: true },
    {
      status: 'delivered',
      needsDriver: true,
      extras: {
        rating: { stars: 5, comment: 'تجربة ممتازة', at: new Date() },
      },
    },
    {
      status: 'cancelled',
      extras: {
        cancelledReason: 'عدم الحاجة',
        cancelledAt: new Date(),
      },
    },
    {
      status: 'disputed',
      needsDriver: true,
      extras: {
        dispute: {
          reason: 'تأخر كبير',
          photoUrls: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
          openedAt: new Date(),
          resolved: false,
        },
      },
    },
  ];

  let idx = 0;
  for (const tpl of templates) {
    const sender = senders[idx % senders.length]!;
    const driverMongo = tpl.needsDriver ? drivers[idx % drivers.length] : undefined;

    const paymentCaptured = tpl.status === 'delivered';

    await ShipmentModel.create({
      trackingCode: `${generateTrackingCode()}`,
      senderId: sender._id,
      driverId: driverMongo ? driverMongo['_id'] : undefined,
      pickup,
      dropoff,
      receiver: {
        name: `مستلم ${idx + 1}`,
        phone: `+96478000${1000 + idx}`,
      },
      package: { type: 'medium', weightTier: 'light', declaredValue: 50_000 },
      service: 'standard',
      pricing,
      payment: {
        method: 'cash_on_delivery',
        status: paymentCaptured ? 'captured' : 'pending',
        ...(paymentCaptured ? { paidAt: new Date() } : {}),
      },
      status: tpl.status,
      statusHistory: [
        {
          status: tpl.status,
          at: new Date(),
          by: sender['_id'],
        },
      ],
      pickupOtp: '4821',
      deliveryOtp: '7395',
      proofs: {},
      etaMinutes: 34,
      ...(tpl.extras ?? {}),
    });
    idx += 1;
  }

  console.info('[seed] shipments:', await ShipmentModel.countDocuments());
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
