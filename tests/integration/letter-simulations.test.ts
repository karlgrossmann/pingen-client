import { afterAll, describe, expect, it } from 'vitest';
import {
  cleanupTestLetters,
  createTestClient,
  getTestOrganisationId,
  ignoreConflict,
  uploadTestFile,
  waitForLetterStatus,
} from './setup.js';

const SIMULATION_TIMEOUT = 10_000;
const POLL_INTERVAL = 2_000;

/**
 * Helper: create a letter with a simulation filename, send it, and return the letter ID.
 */
async function createAndSendSimulationLetter(simulationFilename: string) {
  const client = createTestClient();
  const orgId = await getTestOrganisationId(client);
  const { file_url, file_url_signature } = await uploadTestFile(client);

  const created = await client.letters.create(orgId, {
    file_original_name: simulationFilename,
    file_url,
    file_url_signature,
    address_position: 'left',
    auto_send: false,
  });

  const letterId = created.data.id;

  // Wait for validation before sending
  const status = await waitForLetterStatus(
    client,
    orgId,
    letterId,
    ['valid', 'action_required', 'invalid'],
    { timeoutMs: 30_000 },
  );

  if (status !== 'valid') {
    throw new Error(
      `Letter ${letterId} (file: ${simulationFilename}) reached '${status}' instead of 'valid' — cannot proceed with simulation`,
    );
  }

  await client.letters.send(orgId, letterId, {
    delivery_product: 'cheap',
    print_mode: 'simplex',
    print_spectrum: 'grayscale',
  });

  return { client, orgId, letterId };
}

describe('Letter Simulations (integration)', { timeout: SIMULATION_TIMEOUT }, () => {
  afterAll(async () => {
    const client = createTestClient();
    const orgId = await getTestOrganisationId(client);
    await cleanupTestLetters(client, orgId);
  });

  it('undeliverable simulation reaches undeliverable status', async () => {
    const ctx = await createAndSendSimulationLetter('sdk-test_simulate_undeliverable.pdf');

    try {
      const finalStatus = await waitForLetterStatus(
        ctx.client,
        ctx.orgId,
        ctx.letterId,
        ['undeliverable'],
        { timeoutMs: SIMULATION_TIMEOUT, intervalMs: POLL_INTERVAL },
      );

      expect(finalStatus).toBe('undeliverable');

      // Verify letter events contain an undeliverable event
      const events = await ctx.client.letterEvents.list(ctx.orgId, ctx.letterId);
      const hasUndeliverable = events.data.some(
        (event) => event.attributes.code === 'undeliverable',
      );
      expect(hasUndeliverable).toBe(true);
    } finally {
      try {
        await ctx.client.letters.delete(ctx.orgId, ctx.letterId);
      } catch (e) {
        ignoreConflict(e);
      }
    }
  });

  it('unprintable simulation reaches invalid status', async () => {
    const ctx = await createAndSendSimulationLetter('sdk-test_simulate_unprintable.pdf');

    try {
      const finalStatus = await waitForLetterStatus(
        ctx.client,
        ctx.orgId,
        ctx.letterId,
        ['invalid'],
        { timeoutMs: SIMULATION_TIMEOUT, intervalMs: POLL_INTERVAL },
      );

      expect(finalStatus).toBe('invalid');
    } finally {
      try {
        await ctx.client.letters.delete(ctx.orgId, ctx.letterId);
      } catch (e) {
        ignoreConflict(e);
      }
    }
  });

  it('cancellable simulation allows cancellation', async () => {
    const ctx = await createAndSendSimulationLetter('sdk-test_simulate_cancellable.pdf');

    try {
      // Wait for the letter to reach the cancellable state ('accepted' in staging simulation)
      await waitForLetterStatus(ctx.client, ctx.orgId, ctx.letterId, ['accepted'], {
        timeoutMs: SIMULATION_TIMEOUT,
        intervalMs: POLL_INTERVAL,
      });

      // Cancel should succeed
      await ctx.client.letters.cancel(ctx.orgId, ctx.letterId);

      const finalStatus = await waitForLetterStatus(
        ctx.client,
        ctx.orgId,
        ctx.letterId,
        ['cancelled'],
        { timeoutMs: 30_000, intervalMs: POLL_INTERVAL },
      );

      expect(finalStatus).toBe('cancelled');
    } finally {
      try {
        await ctx.client.letters.delete(ctx.orgId, ctx.letterId);
      } catch (e) {
        ignoreConflict(e);
      }
    }
  });

  it('sent simulation reaches delivered-to-distributor status', async () => {
    const ctx = await createAndSendSimulationLetter('sdk-test_simulate_sent.pdf');

    try {
      const finalStatus = await waitForLetterStatus(
        ctx.client,
        ctx.orgId,
        ctx.letterId,
        ['sent', 'delivered'],
        { timeoutMs: SIMULATION_TIMEOUT, intervalMs: POLL_INTERVAL },
      );

      expect(['sent', 'delivered']).toContain(finalStatus);
    } finally {
      try {
        await ctx.client.letters.delete(ctx.orgId, ctx.letterId);
      } catch (e) {
        ignoreConflict(e);
      }
    }
  });
});
