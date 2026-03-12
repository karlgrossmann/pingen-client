import { createHmac, timingSafeEqual } from 'node:crypto';

export const WEBHOOK_SIGNATURE_HEADER = 'signature';

export function computeWebhookSignature(
  payload: string,
  signingKey: string,
): string {
  return createHmac('sha256', signingKey).update(payload).digest('hex');
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  signingKey: string,
): boolean {
  const expected = computeWebhookSignature(payload, signingKey);

  if (expected.length !== signature.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(expected, 'utf-8'),
    Buffer.from(signature.toLowerCase(), 'utf-8'),
  );
}
