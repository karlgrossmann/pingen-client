import { ENDPOINTS, createPingenError, type PingenScope, type TokenResponse } from './types.js';

interface CachedToken {
  readonly accessToken: string;
  readonly expiresAt: number;
}

const TOKEN_EXPIRY_BUFFER_MS = 60_000;

export class TokenManager {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly identityUrl: string;
  private readonly scopes: readonly PingenScope[] | undefined;
  private cachedToken: CachedToken | null = null;
  private pendingRequest: Promise<string> | null = null;

  constructor(
    clientId: string,
    clientSecret: string,
    environment: 'production' | 'staging',
    scopes?: readonly PingenScope[],
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.identityUrl = ENDPOINTS[environment].identity;
    this.scopes = scopes;
  }

  async getToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.accessToken;
    }

    if (this.pendingRequest) {
      return this.pendingRequest;
    }

    this.pendingRequest = this.fetchToken().finally(() => {
      this.pendingRequest = null;
    });

    return this.pendingRequest;
  }

  private async fetchToken(): Promise<string> {
    const response = await fetch(`${this.identityUrl}/auth/access-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: this.buildRequestBody(),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw createPingenError(
        `Authentication failed: ${response.status} ${response.statusText}`,
        response.status,
        body,
        response.headers.get('X-Request-Id') ?? undefined,
      );
    }

    const data = (await response.json()) as TokenResponse;

    this.cachedToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000 - TOKEN_EXPIRY_BUFFER_MS,
    };

    return data.access_token;
  }

  private buildRequestBody(): URLSearchParams {
    const params: Record<string, string> = {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };

    if (this.scopes && this.scopes.length > 0) {
      params.scope = this.scopes.join(' ');
    }

    return new URLSearchParams(params);
  }
}
