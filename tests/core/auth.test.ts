import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenManager } from '../../src/core/auth.js';
import { PingenError, PingenUnauthorizedError } from '../../src/core/types.js';

describe('TokenManager', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function createTokenManager(environment: 'production' | 'staging' = 'production') {
    return new TokenManager('test-client-id', 'test-client-secret', environment);
  }

  function mockTokenResponse(accessToken = 'test-token', expiresIn = 43200) {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token_type: 'Bearer',
        expires_in: expiresIn,
        access_token: accessToken,
      }),
    });
  }

  it('fetches a token with correct parameters', async () => {
    mockTokenResponse();
    const manager = createTokenManager();

    await manager.getToken();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://identity.pingen.com/auth/access-tokens',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: expect.any(URLSearchParams),
      },
    );

    const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
    expect(body.get('grant_type')).toBe('client_credentials');
    expect(body.get('client_id')).toBe('test-client-id');
    expect(body.get('client_secret')).toBe('test-client-secret');
    expect(body.has('scope')).toBe(false);
  });

  it('uses staging identity URL when environment is staging', async () => {
    mockTokenResponse();
    const manager = createTokenManager('staging');

    await manager.getToken();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://identity-staging.pingen.com/auth/access-tokens',
      expect.any(Object),
    );
  });

  it('returns the access token', async () => {
    mockTokenResponse('my-access-token');
    const manager = createTokenManager();

    const token = await manager.getToken();

    expect(token).toBe('my-access-token');
  });

  it('caches the token and does not re-fetch while valid', async () => {
    mockTokenResponse('cached-token', 43200);
    const manager = createTokenManager();

    const first = await manager.getToken();
    const second = await manager.getToken();

    expect(first).toBe('cached-token');
    expect(second).toBe('cached-token');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('refreshes the token when expired (with 60s buffer)', async () => {
    mockTokenResponse('token-1', 120);
    const manager = createTokenManager();

    await manager.getToken();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Advance time past expiry minus buffer (120s - 60s = 60s)
    vi.advanceTimersByTime(61_000);

    mockTokenResponse('token-2', 43200);
    const refreshed = await manager.getToken();

    expect(refreshed).toBe('token-2');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('does not refresh token before expiry buffer', async () => {
    mockTokenResponse('token-1', 120);
    const manager = createTokenManager();

    await manager.getToken();

    // Advance less than expiry minus buffer
    vi.advanceTimersByTime(50_000);

    const cached = await manager.getToken();
    expect(cached).toBe('token-1');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent token requests', async () => {
    mockTokenResponse('deduped-token');
    const manager = createTokenManager();

    const [first, second, third] = await Promise.all([
      manager.getToken(),
      manager.getToken(),
      manager.getToken(),
    ]);

    expect(first).toBe('deduped-token');
    expect(second).toBe('deduped-token');
    expect(third).toBe('deduped-token');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('includes single scope in token request', async () => {
    mockTokenResponse();
    const manager = new TokenManager('id', 'secret', 'production', ['letter']);

    await manager.getToken();

    const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
    expect(body.get('scope')).toBe('letter');
  });

  it('includes multiple scopes space-separated', async () => {
    mockTokenResponse();
    const manager = new TokenManager('id', 'secret', 'production', ['letter', 'batch', 'webhook']);

    await manager.getToken();

    const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
    expect(body.get('scope')).toBe('letter batch webhook');
  });

  it('omits scope param when scopes array is empty', async () => {
    mockTokenResponse();
    const manager = new TokenManager('id', 'secret', 'production', []);

    await manager.getToken();

    const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
    expect(body.has('scope')).toBe(false);
  });

  it('throws PingenUnauthorizedError on auth failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Invalid credentials',
      headers: new Headers({ 'X-Request-Id': 'req-123' }),
    });

    const manager = createTokenManager();

    try {
      await manager.getToken();
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(PingenUnauthorizedError);
      expect(error).toBeInstanceOf(PingenError);
      expect(error).toMatchObject({
        status: 401,
        body: 'Invalid credentials',
        requestId: 'req-123',
      });
    }
  });
});
