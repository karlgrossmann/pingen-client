import { describe, expect, it } from 'vitest';
import { createTestClient } from './setup.js';

describe('User (integration)', () => {
  it('gets current user', async () => {
    const client = createTestClient();

    const result = await client.user.get();

    expect(result.data).toBeDefined();
    expect(result.data.id).toBeDefined();
    expect(result.data.attributes.email).toBeDefined();
    expect(result.data.attributes.status).toBeDefined();
  });

  it('lists user associations', async () => {
    const client = createTestClient();

    const result = await client.user.listAssociations();

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toBeDefined();
    expect(result.meta.total).toBeGreaterThanOrEqual(0);
  });

  it('lists user associations with pagination', async () => {
    const client = createTestClient();

    const result = await client.user.listAssociations({ pageLimit: 1 });

    expect(result.meta.per_page).toBe(1);
  });
});
