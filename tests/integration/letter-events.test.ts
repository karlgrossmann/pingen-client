import { describe, expect, it } from 'vitest';
import { createTestClient, getTestOrganisationId } from './setup.js';

describe('LetterEvents (integration)', () => {
  it('lists events for a letter', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    // Find an existing letter to query events for
    const letters = await client.letters.list(orgId, { pageLimit: 1 });
    if (letters.data.length === 0) return;

    const letterId = letters.data[0].id;
    const result = await client.letterEvents.list(orgId, letterId);

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toBeDefined();
  });

  it('lists issue events', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const result = await client.letterEvents.listIssues(orgId);

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toBeDefined();
  });

  it('lists undeliverable events', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const result = await client.letterEvents.listUndeliverable(orgId);

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toBeDefined();
  });

  it('lists sent events', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const result = await client.letterEvents.listSent(orgId);

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toBeDefined();
  });

  it('lists delivered events', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const result = await client.letterEvents.listDelivered(orgId);

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toBeDefined();
  });
});
