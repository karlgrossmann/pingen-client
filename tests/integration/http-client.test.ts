import { describe, expect, it } from 'vitest';
import { PingenError } from '../../src/core/types.js';
import { createTestClient } from './setup.js';

describe('HttpClient (integration)', () => {
  it('makes an authenticated GET request', async () => {
    const client = createTestClient();

    const result = await client.http.request<{ data: unknown }>({
      method: 'GET',
      path: '/organisations',
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty('data');
  });

  it('throws PingenError for non-existent resource', async () => {
    const client = createTestClient();

    try {
      await client.http.request({
        method: 'GET',
        path: '/organisations/00000000-0000-0000-0000-000000000000',
      });
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(PingenError);
      const pingenError = error as PingenError;
      expect(pingenError.status).toBeGreaterThanOrEqual(400);
    }
  });
});
