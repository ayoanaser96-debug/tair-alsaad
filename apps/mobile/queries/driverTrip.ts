import type { Shipment } from '@tayralsaad/types';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api, unwrapResponse } from '@/lib/api';

import { driverKeys } from '@/queries/driver';

function invalidateTrip(qc: ReturnType<typeof useQueryClient>, shipmentId?: string) {
  void qc.invalidateQueries({ queryKey: driverKeys.activeShipment() });
  void qc.invalidateQueries({ queryKey: ['shipments', 'detailDriver', shipmentId ?? ''] });
  void qc.invalidateQueries({ queryKey: ['shipments', 'feed'] });
}

export function useArrivedPickupMutation(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/shipments/${shipmentId}/arrived-pickup`);
      return unwrapResponse<Shipment>(res.data as never);
    },
    onSuccess: () => invalidateTrip(qc, shipmentId),
  });
}

export function useConfirmPickupMutation(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { otp: string; photoUrl: string }) => {
      const res = await api.post(`/shipments/${shipmentId}/pickup`, body);
      return unwrapResponse<Shipment>(res.data as never);
    },
    onSuccess: () => invalidateTrip(qc, shipmentId),
  });
}

export function useArrivedDropMutation(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/shipments/${shipmentId}/arrived-dropoff`);
      return unwrapResponse<Shipment>(res.data as never);
    },
    onSuccess: () => invalidateTrip(qc, shipmentId),
  });
}

export function useConfirmDeliveryMutation(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { otp: string; photoUrl: string; signatureUrl?: string }) => {
      const res = await api.post(`/shipments/${shipmentId}/deliver`, body);
      return unwrapResponse<Shipment>(res.data as never);
    },
    onSuccess: () => invalidateTrip(qc, shipmentId),
  });
}
