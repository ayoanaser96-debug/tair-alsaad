import type { QuoteResponse } from '@tayralsaad/types';

import { CityModel } from '../models/City.js';
import { NotFoundError } from '../utils/httpError.js';

import { etaMinutes, haversineKm } from './geo.js';

const DEFAULT_SURGE = 118;

async function resolveCityPricing(cityKey: string): Promise<{ cityPricing: ParsedCityPricing }> {
  const key = cityKey.trim().toLowerCase();
  const doc = await CityModel.findOne({ key, active: true }).lean();

  if (!doc) {
    throw new NotFoundError(
      'CITY_NOT_READY',
      'الخدمة غير متاحة في هذه المدينة حالياً',
      'Delivery is unavailable in this city yet.',
    );
  }

  const packageMultipliers = doc.pricing.packageMultipliers as Record<string, number>;
  const serviceMultipliers = doc.pricing.serviceMultipliers as Record<string, number>;

  return {
    cityPricing: {
      baseFare: doc.pricing.baseFare,
      perKm: doc.pricing.perKm,
      minimumFare: doc.pricing.minimumFare,
      packageMultipliers,
      serviceMultipliers,
    },
  };
}

type ParsedCityPricing = {
  baseFare: number;
  perKm: number;
  minimumFare: number;
  packageMultipliers: Record<string, number>;
  serviceMultipliers: Record<string, number>;
};

function readMultiplier(map: Record<string, number>, k: string, fallback = 1): number {
  const v = Number(map[k]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export async function quoteShipment(input: {
  pickupCity: string;
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  packageType: string;
  service: string;
}): Promise<QuoteResponse> {
  const { cityPricing } = await resolveCityPricing(input.pickupCity);

  const distanceKm = haversineKm(input.pickup, input.dropoff);
  const pkgMult = readMultiplier(cityPricing.packageMultipliers, input.packageType);
  const servMult = readMultiplier(cityPricing.serviceMultipliers, input.service);

  const distanceAmount = Math.round(distanceKm * cityPricing.perKm);
  const basePortion = Math.round(cityPricing.baseFare);
  let subtotal = basePortion + distanceAmount;

  subtotal = Math.ceil(subtotal * pkgMult * servMult);
  const surge = DEFAULT_SURGE;
  let total = Math.ceil((subtotal * surge) / 100);
  if (total < cityPricing.minimumFare) total = cityPricing.minimumFare;

  const driverPayout = Math.floor(total * 0.8);

  return {
    pricing: {
      base: basePortion,
      distance: distanceAmount,
      surcharge: 0,
      surge,
      total,
      driverPayout,
    },
    etaMinutes: etaMinutes(distanceKm),
  };
}
