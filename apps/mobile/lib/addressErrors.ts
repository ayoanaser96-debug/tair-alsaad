import { HttpApiError } from '@/lib/api';

export type AddressErrorInfo = {
  /** i18n key under `shipmentNew.*` describing the failure class. */
  key: string;
  /** Whether retrying the same action could plausibly succeed. */
  retryable: boolean;
};

/** Map an API failure to a specific, actionable saved-address message + retryability. */
export function resolveAddressError(error: unknown): AddressErrorInfo {
  if (error instanceof HttpApiError) {
    if (error.code === 'NETWORK') {
      return { key: 'shipmentNew.addressErrNetwork', retryable: true };
    }
    if (error.status === 404 || error.code === 'NOT_FOUND') {
      return { key: 'shipmentNew.addressErrNotFound', retryable: false };
    }
    if (error.status === 400 || error.status === 422 || error.code === 'VALIDATION_FAILED') {
      return { key: 'shipmentNew.addressErrValidation', retryable: false };
    }
    return { key: 'shipmentNew.addressErrGeneric', retryable: true };
  }
  return { key: 'shipmentNew.addressErrGeneric', retryable: true };
}
