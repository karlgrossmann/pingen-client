import { describe, expect, it } from 'vitest';
import { createTestClient, getTestOrganisationId } from './setup.js';

describe('BatchEvents (integration)', () => {
  it('lists events for a batch', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    // Find an existing batch to query events for
    const batches = await client.batches.list(orgId, { pageLimit: 1 });
    if (batches.data.length === 0) return;

    const batchId = batches.data[0].id;
    const result = await client.batchEvents.list(orgId, batchId);

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toBeDefined();
  });
});
