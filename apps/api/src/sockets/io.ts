import type { Server } from 'node:http';

import { Server as IOServer } from 'socket.io';

import { dynamicSocketIoCorsOrigin } from '../config/corsDynamic.js';
import { DriverModel } from '../models/Driver.js';
import { ShipmentModel } from '../models/Shipment.js';
import { verifyAccessToken } from '../utils/verifyTokens.js';

let io: IOServer | undefined;

export function attachSocket(httpServer: Server): IOServer {
  io = new IOServer(httpServer, {
    cors: {
      origin: dynamicSocketIoCorsOrigin(),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const tokenRaw = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : '';
    if (!tokenRaw) {
      socket.data.user = undefined;
      return next();
    }
    try {
      const decoded = verifyAccessToken(tokenRaw);
      socket.data.user = { userId: decoded.sub, role: decoded.role };
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: AppSocket) => {
    socket.data.driverLocationEmittedAt ??= 0;

    void joinRoleRooms(socket).catch(() => undefined);

    socket.on('driver:location', ({ lat, lng }) => void handleDriverLocation(socket, lat, lng));
    socket.on('shipment:subscribe', ({ trackingCode }) =>
      void handleShipmentSubscribe(socket, trackingCode),
    );
  });

  return io;
}

type AppSocket = import('socket.io').Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user?: { userId: string; role: string }; driverLocationEmittedAt?: number }
>;

export function getIo(): IOServer | undefined {
  return io;
}

/** Shipment subscriber rooms + `admin` room for live dashboards. */
export function broadcastDriverShipmentLocations(
  driverMongoId: string,
  shipmentIds: string[],
  lat: number,
  lng: number,
): void {
  const svr = io;
  if (!svr) return;
  const atIso = new Date().toISOString();
  for (const id of shipmentIds) {
    svr.to(`shipment:${id}`).emit('shipment:driver_location', {
      shipmentId: id,
      lat,
      lng,
      at: atIso,
    });
  }
  svr.to('admin').emit('admin:driver_location', {
    driverId: driverMongoId,
    shipmentIds,
    lat,
    lng,
    at: atIso,
  });
}

async function joinRoleRooms(socket: AppSocket) {
  const userId = socket.data.user?.userId;
  const role = socket.data.user?.role;

  if (role === 'admin') {
    await socket.join('admin');
    return;
  }

  if (role !== 'driver' || !userId) return;

  const driver = await DriverModel.findOne({ userId }).select({ _id: 1 }).lean();
  if (driver?._id) {
    await socket.join(`driver:${driver._id.toString()}`);
  }
}

async function handleDriverLocation(socket: AppSocket, lat: unknown, lng: unknown) {
  const userId = socket.data.user?.userId;
  if (!userId || socket.data.user?.role !== 'driver') return;
  const la = typeof lat === 'number' ? lat : Number(lat);
  const ln = typeof lng === 'number' ? lng : Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return;

  const now = Date.now();
  if (now - socket.data.driverLocationEmittedAt! < 5000) return;
  socket.data.driverLocationEmittedAt = now;

  const updated = await DriverModel.findOneAndUpdate(
    { userId },
    {
      currentLocation: { lat: la, lng: ln, updatedAt: new Date() },
    },
    { new: true },
  ).lean();

  const driverMongoId = updated?._id;
  if (!driverMongoId) return;

  const active = await ShipmentModel.find({
    driverId: driverMongoId,
    status: { $in: ['assigned', 'arrived_pickup', 'picked_up', 'in_transit', 'arrived_dropoff'] },
  })
    .select({ _id: 1 })
    .lean();

  const shipmentIds = active.map((s) => s._id!.toString());
  broadcastDriverShipmentLocations(driverMongoId.toString(), shipmentIds, la, ln);
}

async function handleShipmentSubscribe(socket: AppSocket, trackingRaw: unknown) {
  const code = typeof trackingRaw === 'string' ? trackingRaw.trim().toUpperCase() : '';
  if (!code) return;

  const shipment = await ShipmentModel.findOne({ trackingCode: code }).select({ _id: 1 }).lean();
  if (!shipment?._id) return;

  await socket.join(`shipment:${shipment._id.toString()}`);
}
