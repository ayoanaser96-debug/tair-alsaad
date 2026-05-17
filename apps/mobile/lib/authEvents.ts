/** Cross-route unauthorized handler (wired from Root layout). */

type Handler = () => void;

let handler: Handler | null = null;

export function registerUnauthorized(fn: Handler) {
  handler = fn;
}

export function clearUnauthorizedRegistration() {
  handler = null;
}

export function triggerUnauthorized() {
  handler?.();
}
