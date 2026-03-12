/**
 * Available OAuth scopes for the Pingen API.
 * Pass one or more scopes in {@link PingenClientConfig.scopes} to restrict
 * the access token to specific resource types.
 */
export type PingenScope = 'letter' | 'batch' | 'template' | 'webhook' | 'organisation_read';

/**
 * Configuration options for the {@link PingenClient}.
 */
export interface PingenClientConfig {
  /** OAuth 2.0 client ID issued by the Pingen identity server. */
  readonly clientId: string;
  /** OAuth 2.0 client secret issued by the Pingen identity server. */
  readonly clientSecret: string;
  /**
   * Target environment for all API calls.
   * @defaultValue `'production'`
   */
  readonly environment?: 'production' | 'staging';
  /**
   * OAuth scopes to request when obtaining an access token.
   * Defaults to all available scopes when omitted.
   */
  readonly scopes?: readonly PingenScope[];
  /**
   * Maximum time in milliseconds to wait for a single HTTP request before
   * aborting with a {@link PingenTimeoutError}.
   * Falls back to the SDK default when omitted.
   */
  readonly timeout?: number;
  /**
   * Maximum number of automatic retries on transient failures (network errors,
   * 429 Too Many Requests, 503 Service Unavailable).
   * Falls back to the SDK default when omitted.
   */
  readonly maxRetries?: number;
  /**
   * Base delay in milliseconds between retry attempts. Actual delay may be
   * extended using exponential back-off or the `Retry-After` header.
   * Falls back to the SDK default when omitted.
   */
  readonly retryDelay?: number;
}

/**
 * OAuth token response returned by the Pingen identity server after a
 * successful client credentials grant.
 */
export interface TokenResponse {
  /** Token type, typically `'Bearer'`. */
  readonly token_type: string;
  /** Lifetime of the access token in seconds. */
  readonly expires_in: number;
  /** The access token string to include in API request headers. */
  readonly access_token: string;
}

/**
 * Options describing a single HTTP request to the Pingen API.
 */
export interface RequestOptions {
  /** HTTP method to use for the request. */
  readonly method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** API path relative to the base URL, e.g. `'/organisations'`. */
  readonly path: string;
  /** Optional request body, serialised to JSON automatically. */
  readonly body?: unknown;
  /** Optional query-string parameters appended to the URL. */
  readonly query?: Record<string, string>;
  /** Optional additional HTTP headers merged with the defaults. */
  readonly headers?: Record<string, string>;
}

/**
 * Base error class for all Pingen API errors. Extends the native `Error` with
 * additional context returned by the API.
 */
export class PingenError extends Error {
  /** HTTP status code returned by the API, or `0` for timeout errors. */
  readonly status: number;
  /** Raw response body returned by the API. */
  readonly body: unknown;
  /** Pingen request ID that can be used to trace the request in support. */
  readonly requestId: string | undefined;
  /**
   * Number of milliseconds to wait before retrying, derived from the
   * `Retry-After` response header. Present only on 429 and 503 responses.
   */
  readonly retryAfterMs: number | undefined;

  constructor(message: string, status: number, body: unknown, requestId?: string, retryAfterMs?: number) {
    super(message);
    this.name = 'PingenError';
    this.status = status;
    this.body = body;
    this.requestId = requestId;
    this.retryAfterMs = retryAfterMs;
  }
}

/** Thrown when the API returns a 400 Bad Request response. */
export class PingenBadRequestError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 400, body, requestId);
    this.name = 'PingenBadRequestError';
  }
}

/** Thrown when the API returns a 401 Unauthorized response. */
export class PingenUnauthorizedError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 401, body, requestId);
    this.name = 'PingenUnauthorizedError';
  }
}

/** Thrown when the API returns a 403 Forbidden response. */
export class PingenForbiddenError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 403, body, requestId);
    this.name = 'PingenForbiddenError';
  }
}

/** Thrown when the API returns a 404 Not Found response. */
export class PingenNotFoundError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 404, body, requestId);
    this.name = 'PingenNotFoundError';
  }
}

/** Thrown when the API returns a 405 Method Not Allowed response. */
export class PingenMethodNotAllowedError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 405, body, requestId);
    this.name = 'PingenMethodNotAllowedError';
  }
}

/** Thrown when the API returns a 406 Not Acceptable response. */
export class PingenNotAcceptableError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 406, body, requestId);
    this.name = 'PingenNotAcceptableError';
  }
}

/** Thrown when the API returns a 409 Conflict response. */
export class PingenConflictError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 409, body, requestId);
    this.name = 'PingenConflictError';
  }
}

/** Thrown when the API returns a 410 Gone response. */
export class PingenGoneError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 410, body, requestId);
    this.name = 'PingenGoneError';
  }
}

/** Thrown when the API returns a 415 Unsupported Media Type response. */
export class PingenUnsupportedMediaError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 415, body, requestId);
    this.name = 'PingenUnsupportedMediaError';
  }
}

/** Thrown when the API returns a 422 Unprocessable Entity response. */
export class PingenValidationError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 422, body, requestId);
    this.name = 'PingenValidationError';
  }
}

/** Thrown when the API returns a 424 Failed Dependency response. */
export class PingenDependencyError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 424, body, requestId);
    this.name = 'PingenDependencyError';
  }
}

/** Thrown when the API returns a 429 Too Many Requests response. */
export class PingenRateLimitError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string, retryAfterMs?: number) {
    super(message, 429, body, requestId, retryAfterMs);
    this.name = 'PingenRateLimitError';
  }
}

/** Thrown when the API returns a 500 Internal Server Error response. */
export class PingenServerError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string) {
    super(message, 500, body, requestId);
    this.name = 'PingenServerError';
  }
}

/** Thrown when the API returns a 503 Service Unavailable response. */
export class PingenServiceUnavailableError extends PingenError {
  constructor(message: string, body: unknown, requestId?: string, retryAfterMs?: number) {
    super(message, 503, body, requestId, retryAfterMs);
    this.name = 'PingenServiceUnavailableError';
  }
}

/** Thrown when a request exceeds the configured timeout. */
export class PingenTimeoutError extends PingenError {
  constructor(message: string) {
    super(message, 0, undefined);
    this.name = 'PingenTimeoutError';
  }
}

const STATUS_CODE_MAP: Record<number, new (...args: never[]) => PingenError> = {
  400: PingenBadRequestError,
  401: PingenUnauthorizedError,
  403: PingenForbiddenError,
  404: PingenNotFoundError,
  405: PingenMethodNotAllowedError,
  406: PingenNotAcceptableError,
  409: PingenConflictError,
  410: PingenGoneError,
  415: PingenUnsupportedMediaError,
  422: PingenValidationError,
  424: PingenDependencyError,
  429: PingenRateLimitError,
  500: PingenServerError,
  503: PingenServiceUnavailableError,
};

/**
 * Factory that creates the appropriate {@link PingenError} subclass based on
 * the HTTP status code returned by the API.
 *
 * @param message - Human-readable error description.
 * @param status - HTTP status code from the API response, or `0` for timeouts.
 * @param body - Raw response body returned by the API.
 * @param requestId - Optional Pingen request ID from the response headers.
 * @param retryAfterMs - Optional retry delay in milliseconds derived from the
 *   `Retry-After` header (relevant for 429 and 503 responses).
 * @returns A {@link PingenError} subclass instance matching the status code,
 *   or a base {@link PingenError} when no specific subclass is registered.
 */
export function createPingenError(
  message: string,
  status: number,
  body: unknown,
  requestId?: string,
  retryAfterMs?: number,
): PingenError {
  const ErrorClass = STATUS_CODE_MAP[status];
  if (!ErrorClass) {
    return new PingenError(message, status, body, requestId, retryAfterMs);
  }
  if (status === 429) {
    return new PingenRateLimitError(message, body, requestId, retryAfterMs);
  }
  if (status === 503) {
    return new PingenServiceUnavailableError(message, body, requestId, retryAfterMs);
  }
  return new (ErrorClass as new (message: string, body: unknown, requestId?: string) => PingenError)(
    message,
    body,
    requestId,
  );
}

/**
 * API endpoint URLs for production and staging environments.
 * Each environment exposes an `identity` URL used for OAuth token requests and
 * an `api` URL used for all resource requests.
 */
export const ENDPOINTS = {
  production: {
    identity: 'https://identity.pingen.com',
    api: 'https://api.pingen.com',
  },
  staging: {
    identity: 'https://identity-staging.pingen.com',
    api: 'https://api-staging.pingen.com',
  },
} as const;
