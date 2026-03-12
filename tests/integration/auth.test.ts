import { describe, expect, it } from 'vitest';
import { TokenManager } from '../../src/core/auth.js';
import { getIntegrationConfig } from './setup.js';

describe('Auth (integration)', () => {
  const config = getIntegrationConfig();

  it('obtains an access token from staging', async () => {
    const tokenManager = new TokenManager(
      config.clientId,
      config.clientSecret,
      config.environment,
    );

    const token = await tokenManager.getToken();

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('returns cached token on second call', async () => {
    const tokenManager = new TokenManager(
      config.clientId,
      config.clientSecret,
      config.environment,
    );

    const first = await tokenManager.getToken();
    const second = await tokenManager.getToken();

    expect(first).toBe(second);
  });

  it('obtains a token with specific scopes', async () => {
    const tokenManager = new TokenManager(
      config.clientId,
      config.clientSecret,
      config.environment,
      ['letter'],
    );

    const token = await tokenManager.getToken();

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });
});
