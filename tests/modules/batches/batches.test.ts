import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../../../src/core/http-client.js';
import { Batches } from '../../../src/modules/batches/batches.js';
import type { Batch, BatchStatistics } from '../../../src/modules/batches/types.js';
import type { PaginatedResponse, SingleResponse } from '../../../src/common/types.js';

describe('Batches', () => {
  let mockHttpClient: HttpClient;
  let batches: Batches;

  const mockBatch: Batch = {
    id: 'batch-123',
    type: 'batches',
    attributes: {
      name: 'Test Batch',
      icon: 'campaign',
      status: 'valid',
      file_original_name: 'batch.pdf',
      letter_count: 10,
      address_position: 'left',
      print_mode: 'simplex',
      print_spectrum: 'color',
      price_currency: 'CHF',
      price_value: 15.0,
      source: 'api',
      submitted_at: '2024-01-01T00:00:00+00:00',
      created_at: '2024-01-01T00:00:00+00:00',
      updated_at: '2024-01-01T00:00:00+00:00',
    },
    relationships: { organisation: {}, events: {} },
    links: { self: '/organisations/org-1/batches/batch-123' },
  };

  const paginatedResponse: PaginatedResponse<Batch> = {
    data: [mockBatch],
    links: { first: '', last: '', prev: null, next: null, self: '' },
    meta: { current_page: 1, last_page: 1, per_page: 10, from: 1, to: 1, total: 1 },
  };

  const singleResponse: SingleResponse<Batch> = {
    data: mockBatch,
  };

  beforeEach(() => {
    mockHttpClient = {
      request: vi.fn(),
      requestVoid: vi.fn(),
    } as unknown as HttpClient;
    batches = new Batches(mockHttpClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('list', () => {
    it('calls GET /organisations/:orgId/batches', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      const result = await batches.list('org-1');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches',
        query: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('batch-123');
    });

    it('passes pagination params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await batches.list('org-1', { pageNumber: 2, pageLimit: 25 });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches',
        query: { 'page[number]': '2', 'page[limit]': '25' },
      });
    });

    it('passes include and fields params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await batches.list('org-1', {
        include: 'organisation',
        fieldsBatches: ['name', 'status'],
        fieldsOrganisations: ['name'],
      });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches',
        query: {
          include: 'organisation',
          'fields[batches]': 'name,status',
          'fields[organisations]': 'name',
        },
      });
    });
  });

  describe('create', () => {
    it('calls POST /organisations/:orgId/batches', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const data = {
        name: 'Test Batch',
        icon: 'campaign' as const,
        file_original_name: 'batch.pdf',
        file_url: 'https://example.com/batch.pdf',
        file_url_signature: 'sig-123',
        address_position: 'left' as const,
        grouping_type: 'zip' as const,
        grouping_options_split_type: 'file' as const,
      };

      const result = await batches.create('org-1', data);

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/organisations/org-1/batches',
        body: { data: { type: 'batches', attributes: data } },
      });
      expect(result.data.id).toBe('batch-123');
    });

    it('passes preset relationship when preset_id is provided', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const data = {
        name: 'Test Batch',
        icon: 'campaign' as const,
        file_original_name: 'batch.pdf',
        file_url: 'https://example.com/batch.pdf',
        file_url_signature: 'sig-123',
        address_position: 'left' as const,
        grouping_type: 'zip' as const,
        grouping_options_split_type: 'file' as const,
        preset_id: 'preset-xyz',
      };

      await batches.create('org-1', data);

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/organisations/org-1/batches',
        body: {
          data: {
            type: 'batches',
            attributes: {
              name: 'Test Batch',
              icon: 'campaign',
              file_original_name: 'batch.pdf',
              file_url: 'https://example.com/batch.pdf',
              file_url_signature: 'sig-123',
              address_position: 'left',
              grouping_type: 'zip',
              grouping_options_split_type: 'file',
            },
            relationships: {
              preset: { data: { id: 'preset-xyz', type: 'presets' } },
            },
          },
        },
      });
    });
  });

  describe('get', () => {
    it('calls GET /organisations/:orgId/batches/:batchId', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const result = await batches.get('org-1', 'batch-123');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches/batch-123',
        query: {},
      });
      expect(result.data.attributes.name).toBe('Test Batch');
    });

    it('passes fields params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      await batches.get('org-1', 'batch-123', { fieldsBatches: ['name'] });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches/batch-123',
        query: { 'fields[batches]': 'name' },
      });
    });
  });

  describe('update', () => {
    it('calls PATCH /organisations/:orgId/batches/:batchId', async () => {
      vi.mocked(mockHttpClient.requestVoid).mockResolvedValueOnce(undefined);

      await batches.update('org-1', 'batch-123', { name: 'Updated', icon: 'rocket' });

      expect(mockHttpClient.requestVoid).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/organisations/org-1/batches/batch-123',
        body: { data: { id: 'batch-123', type: 'batches', attributes: { name: 'Updated', icon: 'rocket' } } },
      });
    });
  });

  describe('delete', () => {
    it('calls DELETE /organisations/:orgId/batches/:batchId', async () => {
      vi.mocked(mockHttpClient.requestVoid).mockResolvedValueOnce(undefined);

      await batches.delete('org-1', 'batch-123');

      expect(mockHttpClient.requestVoid).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/organisations/org-1/batches/batch-123',
      });
    });

    it('passes with_letters option', async () => {
      vi.mocked(mockHttpClient.requestVoid).mockResolvedValueOnce(undefined);

      await batches.delete('org-1', 'batch-123', { with_letters: true });

      expect(mockHttpClient.requestVoid).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/organisations/org-1/batches/batch-123',
        body: { data: { id: 'batch-123', type: 'batches', attributes: { with_letters: true } } },
      });
    });
  });

  describe('send', () => {
    it('calls PATCH /organisations/:orgId/batches/:batchId/send', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const data = {
        delivery_products: [{ country: 'CH', delivery_product: 'fast' }],
        print_mode: 'simplex' as const,
        print_spectrum: 'color' as const,
      };

      const result = await batches.send('org-1', 'batch-123', data);

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/organisations/org-1/batches/batch-123/send',
        body: { data: { id: 'batch-123', type: 'batches', attributes: data } },
      });
      expect(result.data.id).toBe('batch-123');
    });
  });

  describe('cancel', () => {
    it('calls PATCH /organisations/:orgId/batches/:batchId/cancel', async () => {
      vi.mocked(mockHttpClient.requestVoid).mockResolvedValueOnce(undefined);

      await batches.cancel('org-1', 'batch-123');

      expect(mockHttpClient.requestVoid).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/organisations/org-1/batches/batch-123/cancel',
      });
    });
  });

  describe('getStatistics', () => {
    const mockStatistics: SingleResponse<BatchStatistics> = {
      data: {
        id: 'batch-123',
        type: 'batch_statistics',
        attributes: {
          letter_validating: 2,
          letter_groups: [{ name: 'Group A', count: 5 }],
          letter_countries: [{ country: 'CH', count: 10 }],
        },
        links: { self: '' },
      },
    };

    it('calls GET /organisations/:orgId/batches/:batchId/statistics', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockStatistics);

      const result = await batches.getStatistics('org-1', 'batch-123');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches/batch-123/statistics',
        query: {},
      });
      expect(result.data.attributes.letter_validating).toBe(2);
      expect(result.data.attributes.letter_countries).toHaveLength(1);
    });

    it('passes fields params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockStatistics);

      await batches.getStatistics('org-1', 'batch-123', { fieldsBatches: ['name'] });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/batches/batch-123/statistics',
        query: { 'fields[batches]': 'name' },
      });
    });
  });
});
