export function otpGenerator(): string {
  const code = crypto.getRandomValues(new Uint32Array(1))[0]! % 10000;
  return code.toString().padStart(4, '0');
}
