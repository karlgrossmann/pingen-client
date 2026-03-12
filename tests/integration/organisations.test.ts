import { describe, expect, it } from 'vitest';
import { createTestClient } from './setup.js';

describe('Organisations (integration)', () => {
  it('lists organisations', async () => {
    const client = createTestClient();

    const result = await client.organisations.list();

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toBeDefined();
    expect(result.meta.total).toBeGreaterThanOrEqual(0);
  });

  it('lists organisations with pagination', async () => {
    const client = createTestClient();

    const result = await client.organisations.list({ pageLimit: 1 });

    expect(result.meta.per_page).toBe(1);
  });

  it('gets a single organisation', async () => {
    const client = createTestClient();

    const list = await client.organisations.list({ pageLimit: 1 });
    if (list.data.length === 0) return;

    const orgId = list.data[0].id;
    const result = await client.organisations.get(orgId);

    expect(result.data.id).toBe(orgId);
    expect(result.data.attributes.name).toBeDefined();
    expect(result.data.attributes.status).toBeDefined();
  });
});
