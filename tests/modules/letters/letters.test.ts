import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../../../src/core/http-client.js';
import { Letters } from '../../../src/modules/letters/letters.js';
import type { Letter, PriceResult } from '../../../src/modules/letters/types.js';
import type { PaginatedResponse, SingleResponse } from '../../../src/common/types.js';

describe('Letters', () => {
  let mockHttpClient: HttpClient;
  let letters: Letters;

  const mockLetter: Letter = {
    id: 'letter-123',
    type: 'letters',
    attributes: {
      status: 'valid',
      file_original_name: 'test.pdf',
      file_pages: 2,
      address: 'Test Street 1, 8000 Zurich',
      address_position: 'left',
      country: 'CH',
      delivery_product: 'fast',
      print_mode: 'simplex',
      print_spectrum: 'color',
      price_currency: 'CHF',
      price_value: 1.5,
      paper_types: ['normal'],
      fonts: [{ name: 'Helvetica', is_embedded: true }],
      source: 'api',
      tracking_number: '',
      submitted_at: '2024-01-01T00:00:00+00:00',
      created_at: '2024-01-01T00:00:00+00:00',
      updated_at: '2024-01-01T00:00:00+00:00',
    },
    relationships: { organisation: {}, events: {}, batch: {} },
    links: { self: '/organisations/org-1/letters/letter-123' },
  };

  const paginatedResponse: PaginatedResponse<Letter> = {
    data: [mockLetter],
    links: { first: '', last: '', prev: null, next: null, self: '' },
    meta: { current_page: 1, last_page: 1, per_page: 10, from: 1, to: 1, total: 1 },
  };

  const singleResponse: SingleResponse<Letter> = {
    data: mockLetter,
  };

  beforeEach(() => {
    mockHttpClient = {
      request: vi.fn(),
      requestVoid: vi.fn(),
      requestUrl: vi.fn(),
    } as unknown as HttpClient;
    letters = new Letters(mockHttpClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('list', () => {
    it('calls GET /organisations/:orgId/letters', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      const result = await letters.list('org-1');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters',
        query: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('letter-123');
    });

    it('passes pagination params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await letters.list('org-1', { pageNumber: 2, pageLimit: 25 });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters',
        query: { 'page[number]': '2', 'page[limit]': '25' },
      });
    });

    it('passes include and fields params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await letters.list('org-1', {
        include: 'organisation',
        fieldsLetters: ['status', 'address'],
        fieldsOrganisations: ['name'],
      });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters',
        query: {
          include: 'organisation',
          'fields[letters]': 'status,address',
          'fields[organisations]': 'name',
        },
      });
    });
  });

  describe('create', () => {
    it('calls POST /organisations/:orgId/letters', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const data = {
        file_original_name: 'test.pdf',
        file_url: 'https://example.com/test.pdf',
        file_url_signature: 'sig-123',
        address_position: 'left' as const,
        auto_send: false,
      };

      const result = await letters.create('org-1', data);

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/organisations/org-1/letters',
        body: { data: { type: 'letters', attributes: data } },
      });
      expect(result.data.id).toBe('letter-123');
    });

    it('passes preset relationship when preset_id is provided', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const data = {
        file_original_name: 'test.pdf',
        file_url: 'https://example.com/test.pdf',
        file_url_signature: 'sig-123',
        address_position: 'left' as const,
        auto_send: false,
        preset_id: 'preset-abc',
      };

      await letters.create('org-1', data);

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/organisations/org-1/letters',
        body: {
          data: {
            type: 'letters',
            attributes: {
              file_original_name: 'test.pdf',
              file_url: 'https://example.com/test.pdf',
              file_url_signature: 'sig-123',
              address_position: 'left',
              auto_send: false,
            },
            relationships: {
              preset: { data: { id: 'preset-abc', type: 'presets' } },
            },
          },
        },
      });
    });

    it('passes optional delivery options', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const data = {
        file_original_name: 'test.pdf',
        file_url: 'https://example.com/test.pdf',
        file_url_signature: 'sig-123',
        address_position: 'left' as const,
        auto_send: true,
        delivery_product: 'fast' as const,
        print_mode: 'duplex' as const,
        print_spectrum: 'color' as const,
      };

      await letters.create('org-1', data);

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/organisations/org-1/letters',
        body: { data: { type: 'letters', attributes: data } },
      });
    });
  });

  describe('get', () => {
    it('calls GET /organisations/:orgId/letters/:letterId', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const result = await letters.get('org-1', 'letter-123');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/letter-123',
        query: {},
      });
      expect(result.data.attributes.status).toBe('valid');
    });

    it('passes include and fields params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      await letters.get('org-1', 'letter-123', {
        include: 'batch',
        fieldsBatches: ['name'],
      });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/letter-123',
        query: {
          include: 'batch',
          'fields[batches]': 'name',
        },
      });
    });
  });

  describe('update', () => {
    it('calls PATCH /organisations/:orgId/letters/:letterId', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const result = await letters.update('org-1', 'letter-123', {
        paper_types: ['normal', 'qr'],
      });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/organisations/org-1/letters/letter-123',
        body: { data: { id: 'letter-123', type: 'letters', attributes: { paper_types: ['normal', 'qr'] } } },
      });
      expect(result.data.id).toBe('letter-123');
    });
  });

  describe('delete', () => {
    it('calls DELETE /organisations/:orgId/letters/:letterId', async () => {
      vi.mocked(mockHttpClient.requestVoid).mockResolvedValueOnce(undefined);

      await letters.delete('org-1', 'letter-123');

      expect(mockHttpClient.requestVoid).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/organisations/org-1/letters/letter-123',
      });
    });
  });

  describe('send', () => {
    it('calls PATCH /organisations/:orgId/letters/:letterId/send', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const data = {
        delivery_product: 'fast' as const,
        print_mode: 'simplex' as const,
        print_spectrum: 'color' as const,
      };

      const result = await letters.send('org-1', 'letter-123', data);

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/organisations/org-1/letters/letter-123/send',
        body: { data: { id: 'letter-123', type: 'letters', attributes: data } },
      });
      expect(result.data.id).toBe('letter-123');
    });
  });

  describe('cancel', () => {
    it('calls PATCH /organisations/:orgId/letters/:letterId/cancel', async () => {
      vi.mocked(mockHttpClient.requestVoid).mockResolvedValueOnce(undefined);

      await letters.cancel('org-1', 'letter-123');

      expect(mockHttpClient.requestVoid).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/organisations/org-1/letters/letter-123/cancel',
      });
    });
  });

  describe('getFile', () => {
    it('calls GET /organisations/:orgId/letters/:letterId/file and returns redirect URL', async () => {
      vi.mocked(mockHttpClient.requestUrl).mockResolvedValueOnce('https://s3.example.com/file.pdf');

      const url = await letters.getFile('org-1', 'letter-123');

      expect(mockHttpClient.requestUrl).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/letter-123/file',
      });
      expect(url).toBe('https://s3.example.com/file.pdf');
    });
  });

  describe('calculatePrice', () => {
    const mockPriceResult: SingleResponse<PriceResult> = {
      data: {
        id: 'price-1',
        type: 'letter_price_calculators',
        attributes: { currency: 'CHF', price: 1.5 },
        links: { self: '' },
      },
    };

    it('calls POST /organisations/:orgId/letters/price-calculator', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockPriceResult);

      const data = {
        country: 'CH',
        paper_types: ['normal' as const],
        print_mode: 'simplex' as const,
        print_spectrum: 'color' as const,
        delivery_product: 'fast' as const,
      };

      const result = await letters.calculatePrice('org-1', data);

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/organisations/org-1/letters/price-calculator',
        body: { data: { type: 'letter_price_calculator', attributes: data } },
      });
      expect(result.data.attributes.currency).toBe('CHF');
      expect(result.data.attributes.price).toBe(1.5);
    });
  });
});
