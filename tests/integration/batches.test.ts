import { afterAll, describe, expect, it } from 'vitest';
import {
  cleanupTestBatches,
  cleanupTestLetters,
  createTestClient,
  getTestOrganisationId,
  ignoreConflict,
  uploadTestFile,
  waitForBatchStatus,
} from './setup.js';

describe('Batches (integration)', () => {
  afterAll(async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);
    // Delete batches first (with_letters), then sweep any orphaned letters
    await cleanupTestBatches(client, orgId);
    await cleanupTestLetters(client, orgId);
  });

  it('lists batches', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const result = await client.batches.list(orgId);

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toBeDefined();
    expect(result.meta.total).toBeGreaterThanOrEqual(0);
  });

  it('lists batches with pagination', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const result = await client.batches.list(orgId, { pageLimit: 1 });

    expect(result.meta.per_page).toBe(1);
  });

  it('full lifecycle: upload → create → get → update → getStatistics → delete', { timeout: 120_000 }, async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const { file_url, file_url_signature } = await uploadTestFile(client);

    const created = await client.batches.create(orgId, {
      name: 'Integration Test Batch',
      icon: 'document',
      file_original_name: 'integration-batch-test.pdf',
      file_url,
      file_url_signature,
      address_position: 'left',
      grouping_type: 'merge',
      grouping_options_split_type: 'page',
      grouping_options_split_size: 1,
    });

    expect(created.data).toBeDefined();
    expect(created.data.id).toBeDefined();
    expect(created.data.attributes.name).toBe('Integration Test Batch');

    const batchId = created.data.id;

    try {
      // Get
      const fetched = await client.batches.get(orgId, batchId);
      expect(fetched.data.id).toBe(batchId);
      expect(fetched.data.attributes.name).toBe('Integration Test Batch');

      // Wait for batch to finish processing before updating
      const status = await waitForBatchStatus(client, orgId, batchId, [
        'valid',
        'action_required',
        'invalid',
        'error',
      ]);

      // Update and statistics — only possible when batch is valid
      if (status === 'valid') {
        await client.batches.update(orgId, batchId, {
          name: 'Updated Integration Test Batch',
        });

        const afterUpdate = await client.batches.get(orgId, batchId);
        expect(afterUpdate.data.attributes.name).toBe('Updated Integration Test Batch');
      }

      // Get statistics
      const stats = await client.batches.getStatistics(orgId, batchId);
      expect(stats.data).toBeDefined();
      expect(stats.data.attributes).toBeDefined();
    } finally {
      try {
        await client.batches.delete(orgId, batchId, { with_letters: true });
      } catch (e) {
        ignoreConflict(e);
      }
    }
  });

  it('send lifecycle', async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);

    const { file_url, file_url_signature } = await uploadTestFile(client);

    const created = await client.batches.create(orgId, {
      name: 'Send Test Batch',
      icon: 'rocket',
      file_original_name: 'send-cancel-batch.pdf',
      file_url,
      file_url_signature,
      address_position: 'left',
      grouping_type: 'merge',
      grouping_options_split_type: 'page',
      grouping_options_split_size: 1,
    });

    const batchId = created.data.id;

    try {
      // Wait for batch to be ready
      const status = await waitForBatchStatus(client, orgId, batchId, [
        'valid',
        'action_required',
        'error',
      ]);

      // Can only send if valid
      if (status !== 'valid') return;

      const sent = await client.batches.send(orgId, batchId, {
        delivery_products: [{ country: 'CH', delivery_product: 'cheap' }],
        print_mode: 'simplex',
        print_spectrum: 'grayscale',
      });

      expect(sent.data.id).toBe(batchId);

      // Verify batch reaches sent status
      const finalStatus = await waitForBatchStatus(client, orgId, batchId, ['sent']);
      expect(finalStatus).toBe('sent');
    } finally {
      try {
        await client.batches.delete(orgId, batchId, { with_letters: true });
      } catch (e) {
        ignoreConflict(e);
      }
    }
  });
});
