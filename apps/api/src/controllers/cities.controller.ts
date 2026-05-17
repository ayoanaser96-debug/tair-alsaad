import type { Request, Response } from 'express';

import { CityModel } from '../models/City.js';
import { sendOk } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Public catalogue of service cities (no pricing). Used by booking UIs (web/mobile). */
export const publicCitiesListController = asyncHandler(async (_req: Request, res: Response) => {
  const cities = await CityModel.find({ active: true })
    .select({ key: 1, nameAr: 1, nameEn: 1 })
    .sort({ key: 1 })
    .lean();
  sendOk(res, { cities });
});
