import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../../../src/core/http-client.js';
import { BatchEvents } from '../../../src/modules/batch-events/batch-events.js';
import type { BatchEvent } from '../../../src/modules/batch-events/types.js';
import type { PaginatedResponse } from '../../../src/common/types.js';

describe('BatchEvents', () => {
  let mockHttpClient: HttpClient;
  let batchEvents: BatchEvents;

  const mockBatchEvent: BatchEvent = {
    id: 'event-123',
    type: 'batches_events',
    attributes: {
      code: 'batch.created',
      name: 'Batch Created',
      producer: 'system',
      location: 'Zurich',
      data: [],
      emitted_at: '2024-01-01T00:00:00+00:00',
      created_at: '2024-01-01T00:00:00+00:00',
      updated_at: '2024-01-01T00:00:00+00:00',
    },
    relationships: { batch: {} },
    links: { self: '/organisations/org-1/batches/batch-1/events/event-123' },
  };

  const paginatedResponse: PaginatedResponse<BatchEvent> = {
    data: [mockBatchEvent],
    links: { first: '', last: '', prev: null, next: null, self: '' },
    meta: { current_page: 1, last_page: 1, per_page: 10, from: 1, to: 1, total: 1 },
  };

  beforeEach(() => {
    mockHttpClient = {
      request: vi.fn(),
      requestVoid: vi.fn(),
    } as unknown as HttpClient;
    batchEvents = new BatchEvents(mockHttpClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('list', () => {
    it('calls GET /organisations/:orgId/batches/:batchId/events', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      const result = await batchEvents.list('org-1', 'batch-1');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches/batch-1/events',
        query: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('event-123');
    });

    it('passes pagination params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await batchEvents.list('org-1', 'batch-1', { pageNumber: 2, pageLimit: 25 });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches/batch-1/events',
        query: { 'page[number]': '2', 'page[limit]': '25' },
      });
    });

    it('passes fields in bracket notation', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await batchEvents.list('org-1', 'batch-1', {
        fieldsBatchesEvents: ['code', 'name'],
        fieldsBatches: ['status'],
      });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches/batch-1/events',
        query: {
          'fields[batches_events]': 'code,name',
          'fields[batches]': 'status',
        },
      });
    });

    it('passes include param', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await batchEvents.list('org-1', 'batch-1', { include: 'batch' });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches/batch-1/events',
        query: { include: 'batch' },
      });
    });

    it('passes language param', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await batchEvents.list('org-1', 'batch-1', { language: 'en' });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches/batch-1/events',
        query: { language: 'en' },
      });
    });

    it('passes all params together', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await batchEvents.list('org-1', 'batch-1', {
        pageNumber: 1,
        pageLimit: 10,
        fieldsBatchesEvents: ['code'],
        fieldsBatches: ['name'],
        include: 'batch',
        language: 'de',
      });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches/batch-1/events',
        query: {
          'page[number]': '1',
          'page[limit]': '10',
          'fields[batches_events]': 'code',
          'fields[batches]': 'name',
          include: 'batch',
          language: 'de',
        },
      });
    });
  });
});
