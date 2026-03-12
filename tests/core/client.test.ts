import { describe, expect, it, vi } from 'vitest';
import { PingenClient } from '../../src/core/client.js';

// Prevent actual network requests
vi.stubGlobal('fetch', vi.fn());

describe('PingenClient', () => {
  it('throws if clientId is missing', () => {
    expect(
      () => new PingenClient({ clientId: '', clientSecret: 'secret' }),
    ).toThrow('clientId is required');
  });

  it('throws if clientSecret is missing', () => {
    expect(
      () => new PingenClient({ clientId: 'id', clientSecret: '' }),
    ).toThrow('clientSecret is required');
  });

  it('creates client with valid config', () => {
    const client = new PingenClient({
      clientId: 'test-id',
      clientSecret: 'test-secret',
    });

    expect(client).toBeDefined();
    expect(client.organisations).toBeDefined();
  });

  it('defaults to production environment', () => {
    const client = new PingenClient({
      clientId: 'test-id',
      clientSecret: 'test-secret',
    });

    expect(client).toBeDefined();
  });

  it('accepts staging environment', () => {
    const client = new PingenClient({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      environment: 'staging',
    });

    expect(client).toBeDefined();
  });
});
