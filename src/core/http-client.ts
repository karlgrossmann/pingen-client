import type { TokenManager } from './auth.js';
import { PingenError, PingenTimeoutError, createPingenError, type RequestOptions } from './types.js';

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const IDEMPOTENT_METHODS = new Set(['GET', 'DELETE']);

const USER_AGENT = `pingen-client-typescript/${__SDK_VERSION__}`;

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1_000;
const MAX_RETRY_DELAY = 60_000;

export interface HttpClientConfig {
  readonly timeout?: number;
  readonly maxRetries?: number;
  readonly retryDelay?: number;
}

export class HttpClient {
  private readonly tokenManager: TokenManager;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(tokenManager: TokenManager, baseUrl: string, config?: HttpClientConfig) {
    this.tokenManager = tokenManager;
    this.baseUrl = baseUrl;
    this.timeout = config?.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = config?.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryDelay = config?.retryDelay ?? DEFAULT_RETRY_DELAY;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const response = await this.executeRequest(options);
    const requestId = response.headers.get('X-Request-Id') ?? undefined;

    if (response.status === 204) {
      throw createPingenError(
        `Unexpected 204 No Content for ${options.method} ${options.path}`,
        204,
        undefined,
        requestId,
      );
    }

    return (await response.json()) as T;
  }

  async requestVoid(options: RequestOptions): Promise<void> {
    await this.executeRequest(options);
  }

  async requestUrl(options: Pick<RequestOptions, 'method' | 'path' | 'query'>): Promise<string> {
    const token = await this.tokenManager.getToken();
    const url = this.buildUrl(options.path, options.query);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    let response: Response;
    try {
      response = await fetch(url, {
        method: options.method,
        headers: {
          Accept: 'application/vnd.api+json',
          'User-Agent': USER_AGENT,
          Authorization: `Bearer ${token}`,
        },
        redirect: 'manual',
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new PingenTimeoutError(
          `Request timed out after ${this.timeout}ms: ${options.method} ${options.path}`,
        );
      }
      throw new PingenError(
        `Network error: ${options.method} ${options.path}: ${error instanceof Error ? error.message : String(error)}`,
        0,
        undefined,
        undefined,
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const requestId = response.headers.get('X-Request-Id') ?? undefined;

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location');
      if (location) return location;

      throw createPingenError(
        `Redirect response missing Location header for ${options.method} ${options.path}`,
        response.status,
        undefined,
        requestId,
      );
    }

    if (!response.ok) {
      const body = await response.json().catch(() => response.text().catch(() => ''));
      throw createPingenError(
        `Request failed: ${options.method} ${options.path} ${response.status}`,
        response.status,
        body,
        requestId,
      );
    }

    throw createPingenError(
      `Expected redirect but got ${response.status} for ${options.method} ${options.path}`,
      response.status,
      undefined,
      requestId,
    );
  }

  private async executeRequest(options: RequestOptions, attempt = 0): Promise<Response> {
    const token = await this.tokenManager.getToken();
    const url = this.buildUrl(options.path, options.query);

    const headers: Record<string, string> = {
      Accept: 'application/vnd.api+json',
      'User-Agent': USER_AGENT,
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/vnd.api+json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    let response: Response;
    try {
      response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new PingenTimeoutError(
          `Request timed out after ${this.timeout}ms: ${options.method} ${options.path}`,
        );
      }
      throw new PingenError(
        `Network error: ${options.method} ${options.path}: ${error instanceof Error ? error.message : String(error)}`,
        0,
        undefined,
        undefined,
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (
      !response.ok &&
      RETRYABLE_STATUS_CODES.has(response.status) &&
      IDEMPOTENT_METHODS.has(options.method) &&
      attempt < this.maxRetries
    ) {
      const delay = this.parseRetryAfter(response.headers.get('Retry-After'));
      await this.sleep(delay);
      return this.executeRequest(options, attempt + 1);
    }

    const requestId = response.headers.get('X-Request-Id') ?? undefined;

    if (!response.ok) {
      const body = await response.json().catch(() => response.text().catch(() => ''));
      const retryAfterMs = RETRYABLE_STATUS_CODES.has(response.status)
        ? this.parseRetryAfter(response.headers.get('Retry-After'))
        : undefined;
      throw createPingenError(
        `Request failed: ${options.method} ${options.path} ${response.status}`,
        response.status,
        body,
        requestId,
        retryAfterMs,
      );
    }

    return response;
  }

  private parseRetryAfter(header: string | null): number {
    if (!header) return this.retryDelay;
    const parsed = parseInt(header, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return this.retryDelay;
    return Math.min(parsed * 1000, MAX_RETRY_DELAY);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildUrl(path: string, query?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }
}
