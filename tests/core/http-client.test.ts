import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenManager } from '../../src/core/auth.js';
import { HttpClient } from '../../src/core/http-client.js';
import {
  PingenError,
  PingenNotFoundError,
  PingenServiceUnavailableError,
  PingenRateLimitError,
  PingenTimeoutError,
} from '../../src/core/types.js';

describe('HttpClient', () => {
  const mockFetch = vi.fn();
  let mockTokenManager: TokenManager;

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockTokenManager = {
      getToken: vi.fn().mockResolvedValue('test-bearer-token'),
    } as unknown as TokenManager;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createClient() {
    return new HttpClient(mockTokenManager, 'https://api.pingen.com');
  }

  function mockJsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}) {
    mockFetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      headers: new Headers({ 'X-Request-Id': 'req-456', ...headers }),
      json: async () => data,
      text: async () => JSON.stringify(data),
    });
  }

  it('sends GET request with auth header', async () => {
    mockJsonResponse({ data: 'test' });
    const client = createClient();

    await client.request({ method: 'GET', path: '/letters' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.pingen.com/letters',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-bearer-token',
        }),
      }),
    );
  });

  it('sends POST request with JSON body', async () => {
    mockJsonResponse({ id: '1' }, 201);
    const client = createClient();

    await client.request({
      method: 'POST',
      path: '/letters',
      body: { name: 'Test Letter' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.pingen.com/letters',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/vnd.api+json',
          Authorization: 'Bearer test-bearer-token',
        }),
        body: JSON.stringify({ name: 'Test Letter' }),
      }),
    );
  });

  it('sends PATCH request', async () => {
    mockJsonResponse({ id: '1', name: 'Updated' });
    const client = createClient();

    await client.request({
      method: 'PATCH',
      path: '/letters/1',
      body: { name: 'Updated' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.pingen.com/letters/1',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('sends DELETE request via requestVoid', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers({ 'X-Request-Id': 'req-789' }),
      json: async () => {
        throw new Error('No content');
      },
    });
    const client = createClient();

    await client.requestVoid({ method: 'DELETE', path: '/letters/1' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.pingen.com/letters/1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('request throws PingenError on 204 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers({ 'X-Request-Id': 'req-204' }),
      json: async () => {
        throw new Error('No content');
      },
    });
    const client = createClient();

    try {
      await client.request({ method: 'GET', path: '/letters/1' });
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(PingenError);
      expect(error).toMatchObject({ status: 204 });
    }
  });

  it('appends query parameters to URL', async () => {
    mockJsonResponse({ data: [] });
    const client = createClient();

    await client.request({
      method: 'GET',
      path: '/letters',
      query: { page: '1', limit: '10' },
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('page=1');
    expect(url).toContain('limit=10');
  });

  it('passes custom headers', async () => {
    mockJsonResponse({ data: 'test' });
    const client = createClient();

    await client.request({
      method: 'GET',
      path: '/letters',
      headers: { 'X-Custom': 'value' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom': 'value',
          Authorization: 'Bearer test-bearer-token',
        }),
      }),
    );
  });

  it('throws PingenNotFoundError on 404 response', async () => {
    mockJsonResponse({ error: 'Not Found' }, 404);
    const client = createClient();

    try {
      await client.request({ method: 'GET', path: '/letters/999' });
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(PingenNotFoundError);
      expect(error).toBeInstanceOf(PingenError);
      expect(error).toMatchObject({
        status: 404,
        body: { error: 'Not Found' },
        requestId: 'req-456',
      });
    }
  });

  it('requestUrl returns Location header on 302 redirect', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 302,
      headers: new Headers({
        'X-Request-Id': 'req-redir',
        Location: 'https://s3.example.com/file.pdf',
      }),
    });

    const client = createClient();
    const url = await client.requestUrl({ method: 'GET', path: '/letters/1/file' });

    expect(url).toBe('https://s3.example.com/file.pdf');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.pingen.com/letters/1/file',
      expect.objectContaining({
        method: 'GET',
        redirect: 'manual',
      }),
    );
  });

  it('requestUrl throws PingenNotFoundError on 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'X-Request-Id': 'req-err' }),
      json: async () => ({ error: 'Not Found' }),
      text: async () => '{"error":"Not Found"}',
    });

    const client = createClient();

    try {
      await client.requestUrl({ method: 'GET', path: '/letters/999/file' });
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(PingenNotFoundError);
      expect(error).toBeInstanceOf(PingenError);
      expect(error).toMatchObject({ status: 404 });
    }
  });

  it('sends Accept header on all requests', async () => {
    mockJsonResponse({ data: 'test' });
    const client = createClient();

    await client.request({ method: 'GET', path: '/letters' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/vnd.api+json',
        }),
      }),
    );
  });

  it('requestUrl throws PingenError when redirect has no Location header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 301,
      headers: new Headers({ 'X-Request-Id': 'req-no-loc' }),
    });

    const client = createClient();

    try {
      await client.requestUrl({ method: 'GET', path: '/letters/1/file' });
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(PingenError);
      expect(error).toMatchObject({ status: 301 });
      expect((error as PingenError).message).toContain('missing Location header');
    }
  });

  it('parses JSON response', async () => {
    mockJsonResponse({ id: '1', name: 'Letter' });
    const client = createClient();

    const result = await client.request<{ id: string; name: string }>({
      method: 'GET',
      path: '/letters/1',
    });

    expect(result).toEqual({ id: '1', name: 'Letter' });
  });

  describe('retry', () => {
    it('retries GET on 503 up to maxRetries', async () => {
      vi.useFakeTimers();
      const client = new HttpClient(mockTokenManager, 'https://api.pingen.com', {
        maxRetries: 2,
        retryDelay: 100,
      });

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          headers: new Headers({ 'X-Request-Id': 'req-1' }),
          json: async () => ({ error: 'Service Unavailable' }),
          text: async () => 'Service Unavailable',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'X-Request-Id': 'req-2' }),
          json: async () => ({ data: 'success' }),
        });

      const promise = client.request({ method: 'GET', path: '/letters' });
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;

      expect(result).toEqual({ data: 'success' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });

    it('does NOT retry POST requests', async () => {
      const client = new HttpClient(mockTokenManager, 'https://api.pingen.com', {
        maxRetries: 2,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        headers: new Headers({ 'X-Request-Id': 'req-1' }),
        json: async () => ({ error: 'Service Unavailable' }),
        text: async () => 'Service Unavailable',
      });

      try {
        await client.request({ method: 'POST', path: '/letters', body: {} });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PingenServiceUnavailableError);
        expect(error).toBeInstanceOf(PingenError);
        expect(mockFetch).toHaveBeenCalledTimes(1);
      }
    });

    it('respects Retry-After header', async () => {
      vi.useFakeTimers();
      const client = new HttpClient(mockTokenManager, 'https://api.pingen.com', {
        maxRetries: 1,
        retryDelay: 100,
      });

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Headers({ 'X-Request-Id': 'req-1', 'Retry-After': '2' }),
          json: async () => ({ error: 'Too Many Requests' }),
          text: async () => 'Too Many Requests',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'X-Request-Id': 'req-2' }),
          json: async () => ({ data: 'ok' }),
        });

      const promise = client.request({ method: 'GET', path: '/letters' });
      await vi.advanceTimersByTimeAsync(2000);
      const result = await promise;

      expect(result).toEqual({ data: 'ok' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });
  });

  describe('timeout', () => {
    it('throws PingenTimeoutError when request times out', async () => {
      const client = new HttpClient(mockTokenManager, 'https://api.pingen.com', {
        timeout: 100,
      });

      mockFetch.mockImplementationOnce(
        (_url: string, init: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener('abort', () => {
              reject(new DOMException('The operation was aborted.', 'AbortError'));
            });
          }),
      );

      try {
        await client.request({ method: 'GET', path: '/letters' });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PingenTimeoutError);
        expect(error).toBeInstanceOf(PingenError);
        expect((error as PingenError).message).toContain('timed out');
        expect((error as PingenError).status).toBe(0);
      }
    });
  });
});
