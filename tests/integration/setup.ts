import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { PingenClient as PingenClientType } from '../../src/index.js';
import { PingenClient } from '../../src/index.js';
import { PingenError } from '../../src/core/types.js';

/**
 * Rethrow errors unless they are a PingenError with a 409 Conflict status.
 * 409 is expected when a resource is in a state that prevents the operation.
 */
export function ignoreConflict(error: unknown): void {
  if (error instanceof PingenError && error.status === 409) return;
  throw error;
}

export function getIntegrationConfig() {
  const clientId = process.env.PINGEN_CLIENT_ID;
  const clientSecret = process.env.PINGEN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Integration tests require PINGEN_CLIENT_ID and PINGEN_CLIENT_SECRET environment variables',
    );
  }

  return { clientId, clientSecret, environment: 'staging' as const };
}

export function createTestClient() {
  return new PingenClient(getIntegrationConfig());
}

let cachedOrgId: string | undefined;

export async function getTestOrganisationId(client?: PingenClient): Promise<string> {
  if (cachedOrgId) return cachedOrgId;

  const c = client ?? createTestClient();
  const result = await c.organisations.list({ pageLimit: 1 });

  if (result.data.length === 0) {
    throw new Error('No organisations found in staging — cannot run integration tests');
  }

  cachedOrgId = result.data[0].id;
  return cachedOrgId;
}

/**
 * Read the test PDF fixture (contains a valid address for Pingen processing).
 */
export function getTestPdf(): Buffer {
  return readFileSync(resolve(__dirname, '../assets/12-03-2026-Testbrief-Pingen-SDK.pdf'));
}

/**
 * Upload a test PDF via the file-upload endpoint and return the file URL + signature.
 */
export async function uploadTestFile(client: PingenClient): Promise<{
  file_url: string;
  file_url_signature: string;
}> {
  const details = await client.fileUploads.getDetails();
  const uploadUrl = details.data.attributes.url;
  const signature = details.data.attributes.url_signature;

  const pdf = getTestPdf();

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/pdf' },
    body: pdf,
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.status} ${response.statusText}`);
  }

  return {
    file_url: uploadUrl,
    file_url_signature: signature,
  };
}

/**
 * Poll a letter until it reaches a target status (or times out).
 */
export async function waitForLetterStatus(
  client: PingenClientType,
  orgId: string,
  letterId: string,
  targetStatuses: readonly string[],
  { timeoutMs = 15_000, intervalMs = 1_000 } = {},
): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await client.letters.get(orgId, letterId);
    const status = result.data.attributes.status;
    if (targetStatuses.includes(status)) return status;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Letter ${letterId} did not reach status ${targetStatuses.join('/')} within ${timeoutMs}ms`);
}

/**
 * Poll a batch until it reaches a target status (or times out).
 */
export async function waitForBatchStatus(
  client: PingenClientType,
  orgId: string,
  batchId: string,
  targetStatuses: readonly string[],
  { timeoutMs = 60_000, intervalMs = 2_000 } = {},
): Promise<string> {
  const start = Date.now();
  let lastStatus = '';
  while (Date.now() - start < timeoutMs) {
    const result = await client.batches.get(orgId, batchId);
    const status = result.data.attributes.status;
    if (status !== lastStatus) {
      lastStatus = status;
    }
    if (targetStatuses.includes(status)) return status;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Batch ${batchId} stuck in status '${lastStatus}', expected ${targetStatuses.join('/')} (timed out after ${timeoutMs}ms)`);
}

/** Prefixes used by integration test file names — used to identify resources to clean up. */
const TEST_FILE_PREFIXES = [
  'integration-test',
  'send-cancel-test',
  'integration-batch-test',
  'send-cancel-batch',
  'sdk-test_simulate',
];

function isTestResource(fileOriginalName: string): boolean {
  return TEST_FILE_PREFIXES.some((prefix) => fileOriginalName.startsWith(prefix));
}

/**
 * Delete all letters created by integration tests (identified by file_original_name prefix).
 * This also catches letters spawned by batches (e.g. "integration-batch-test_1.pdf").
 * Waits for each letter to finish processing before deleting.
 */
export async function cleanupTestLetters(client: PingenClientType, orgId: string): Promise<void> {
  const result = await client.letters.list(orgId, { pageLimit: 100 });

  for (const letter of result.data) {
    if (!isTestResource(letter.attributes.file_original_name)) continue;
    try {
      await waitForLetterStatus(client, orgId, letter.id, [
        'valid',
        'action_required',
        'invalid',
        'submitted',
        'accepted',
        'sent',
        'cancelled',
        'undeliverable',
        'unprintable',
        'error',
        'delivered',
      ], { timeoutMs: 30_000 });
      await client.letters.delete(orgId, letter.id);
    } catch {
      // Ignore — best-effort cleanup
    }
  }
}

/**
 * Delete all batches created by integration tests (identified by file_original_name prefix).
 * Waits for each batch to finish processing before deleting.
 */
export async function cleanupTestBatches(client: PingenClientType, orgId: string): Promise<void> {
  const result = await client.batches.list(orgId, { pageLimit: 100 });

  for (const batch of result.data) {
    if (!isTestResource(batch.attributes.file_original_name)) continue;
    try {
      await waitForBatchStatus(client, orgId, batch.id, [
        'valid',
        'action_required',
        'invalid',
        'error',
        'accepted',
        'submitted',
        'sent',
        'cancelled',
      ], { timeoutMs: 30_000 });
      await client.batches.delete(orgId, batch.id, { with_letters: true });
    } catch {
      // Ignore — best-effort cleanup
    }
  }
}
