import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  WEBHOOK_SIGNATURE_HEADER,
  computeWebhookSignature,
  verifyWebhookSignature,
} from '../../src/webhooks/verify.js';

const SIGNING_KEY = 'test-signing-key-123';
const PAYLOAD = '{"event":"letter.sent","data":{"id":"123"}}';

function hmacSha256(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload).digest('hex');
}

describe('computeWebhookSignature', () => {
  it('returns the same value as Node.js crypto.createHmac', () => {
    const expected = hmacSha256(PAYLOAD, SIGNING_KEY);
    expect(computeWebhookSignature(PAYLOAD, SIGNING_KEY)).toBe(expected);
  });

  it('handles an empty payload', () => {
    const expected = hmacSha256('', SIGNING_KEY);
    expect(computeWebhookSignature('', SIGNING_KEY)).toBe(expected);
  });
});

describe('verifyWebhookSignature', () => {
  it('returns true for a valid signature', () => {
    const signature = hmacSha256(PAYLOAD, SIGNING_KEY);
    expect(verifyWebhookSignature(PAYLOAD, signature, SIGNING_KEY)).toBe(true);
  });

  it('returns false for an invalid signature', () => {
    expect(
      verifyWebhookSignature(PAYLOAD, 'invalid-signature', SIGNING_KEY),
    ).toBe(false);
  });

  it('returns false when the signing key is wrong', () => {
    const signature = hmacSha256(PAYLOAD, SIGNING_KEY);
    expect(verifyWebhookSignature(PAYLOAD, signature, 'wrong-key')).toBe(
      false,
    );
  });

  it('handles an empty payload', () => {
    const signature = hmacSha256('', SIGNING_KEY);
    expect(verifyWebhookSignature('', signature, SIGNING_KEY)).toBe(true);
  });

  it('is case-insensitive for hex signatures', () => {
    const signature = hmacSha256(PAYLOAD, SIGNING_KEY);
    expect(
      verifyWebhookSignature(PAYLOAD, signature.toUpperCase(), SIGNING_KEY),
    ).toBe(true);
  });
});

describe('WEBHOOK_SIGNATURE_HEADER', () => {
  it('is the lowercase header name', () => {
    expect(WEBHOOK_SIGNATURE_HEADER).toBe('signature');
  });
});
