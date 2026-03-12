import { describe, expect, it } from 'vitest';
import { createTestClient, getTestOrganisationId } from './setup.js';

describe('Webhooks (integration)', () => {
  it('full lifecycle: create → get → list → delete', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    // Create
    const created = await client.webhooks.create(orgId, {
      event_category: 'issues',
      url: 'https://example.com/webhook-test',
      signing_key: 'test-signing-key-integration',
    });

    expect(created.data).toBeDefined();
    expect(created.data.id).toBeDefined();
    expect(created.data.attributes.event_category).toBe('issues');
    expect(created.data.attributes.url).toBe('https://example.com/webhook-test');

    const webhookId = created.data.id;

    try {
      // Get
      const fetched = await client.webhooks.get(orgId, webhookId);

      expect(fetched.data.id).toBe(webhookId);
      expect(fetched.data.attributes.event_category).toBe('issues');

      // List — verify it appears
      const list = await client.webhooks.list(orgId);

      expect(list.data).toBeDefined();
      expect(Array.isArray(list.data)).toBe(true);

      const found = list.data.some((w) => w.id === webhookId);
      expect(found).toBe(true);
    } finally {
      // Delete — always clean up
      await client.webhooks.delete(orgId, webhookId);
    }
  });

  it('lists webhooks with pagination', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const result = await client.webhooks.list(orgId, { pageLimit: 1 });

    expect(result.meta.per_page).toBe(1);
  });
});
