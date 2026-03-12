import { describe, expect, it } from 'vitest';
import { PingenClient, PingenError } from '../../src/index.js';

describe('PingenClient (integration)', () => {
  it('rejects invalid credentials on staging', async () => {
    const client = new PingenClient({
      clientId: 'invalid-id',
      clientSecret: 'invalid-secret',
      environment: 'staging',
    });

    try {
      await client.http.request({ method: 'GET', path: '/organisations' });
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(PingenError);
      const pingenError = error as PingenError;
      expect(pingenError.status).toBeGreaterThanOrEqual(400);
    }
  });
});
