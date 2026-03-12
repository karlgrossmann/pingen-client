import { afterAll, describe, expect, it } from 'vitest';
import {
  cleanupTestLetters,
  createTestClient,
  getTestOrganisationId,
  ignoreConflict,
  uploadTestFile,
  waitForLetterStatus,
} from './setup.js';

describe('Letters (integration)', () => {
  afterAll(async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);
    await cleanupTestLetters(client, orgId);
  });

  it('calculates letter price', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const result = await client.letters.calculatePrice(orgId, {
      country: 'CH',
      paper_types: ['normal'],
      print_mode: 'simplex',
      print_spectrum: 'grayscale',
      delivery_product: 'cheap',
    });

    expect(result.data).toBeDefined();
    expect(result.data.attributes.currency).toBeDefined();
    expect(result.data.attributes.price).toBeGreaterThan(0);
  });

  it('lists letters', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const result = await client.letters.list(orgId);

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toBeDefined();
    expect(result.meta.total).toBeGreaterThanOrEqual(0);
  });

  it('lists letters with pagination', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const result = await client.letters.list(orgId, { pageLimit: 1 });

    expect(result.meta.per_page).toBe(1);
  });

  it('full lifecycle: upload → create → get → update → delete', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const { file_url, file_url_signature } = await uploadTestFile(client);

    const created = await client.letters.create(orgId, {
      file_original_name: 'integration-test.pdf',
      file_url,
      file_url_signature,
      address_position: 'left',
      auto_send: false,
    });

    expect(created.data).toBeDefined();
    expect(created.data.id).toBeDefined();
    expect(created.data.attributes.file_original_name).toBe('integration-test.pdf');
    expect(created.data.attributes.address_position).toBe('left');

    const letterId = created.data.id;

    try {
      // Get
      const fetched = await client.letters.get(orgId, letterId);
      expect(fetched.data.id).toBe(letterId);
      expect(fetched.data.attributes.file_original_name).toBe('integration-test.pdf');

      // Wait for letter to finish processing before updating
      const status = await waitForLetterStatus(client, orgId, letterId, [
        'valid',
        'action_required',
        'invalid',
      ]);

      // Update — only possible when letter is valid
      if (status === 'valid') {
        const updated = await client.letters.update(orgId, letterId, {
          paper_types: ['normal'],
        });
        expect(updated.data.id).toBe(letterId);
      }
    } finally {
      try {
        await client.letters.delete(orgId, letterId);
      } catch (e) {
        ignoreConflict(e);
      }
    }
  });

  it('send and cancel lifecycle', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const { file_url, file_url_signature } = await uploadTestFile(client);

    const created = await client.letters.create(orgId, {
      file_original_name: 'send-cancel-test_simulate_cancellable.pdf',
      file_url,
      file_url_signature,
      address_position: 'left',
      auto_send: false,
    });

    const letterId = created.data.id;

    try {
      // Wait for letter to be valid before sending
      const status = await waitForLetterStatus(client, orgId, letterId, [
        'valid',
        'action_required',
        'invalid',
      ]);

      // Can only send if valid
      if (status !== 'valid') return;

      const sent = await client.letters.send(orgId, letterId, {
        delivery_product: 'cheap',
        print_mode: 'simplex',
        print_spectrum: 'grayscale',
      });

      expect(sent.data.id).toBe(letterId);

      // Wait for letter to reach cancellable state before cancelling
      await waitForLetterStatus(client, orgId, letterId, ['accepted', 'sent']);

      // Cancel
      await client.letters.cancel(orgId, letterId);
    } finally {
      try {
        await client.letters.delete(orgId, letterId);
      } catch (e) {
        ignoreConflict(e);
      }
    }
  });
});
