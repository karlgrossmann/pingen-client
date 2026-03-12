import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../../../src/core/http-client.js';
import { Organisations } from '../../../src/modules/organisations/organisations.js';
import type { Organisation } from '../../../src/modules/organisations/types.js';
import type { PaginatedResponse, SingleResponse } from '../../../src/common/types.js';

describe('Organisations', () => {
  let mockHttpClient: HttpClient;
  let organisations: Organisations;

  const mockOrganisation: Organisation = {
    id: 'org-123',
    type: 'organisations',
    attributes: {
      name: 'Test Org',
      status: 'active',
      plan: 'free',
      billing_mode: 'prepaid',
      billing_currency: 'CHF',
      billing_balance: 100,
      missing_credits: 0,
      edition: 'standard',
      default_country: 'CH',
      default_address_position: 'left',
      data_retention_addresses: '12',
      data_retention_pdf: '6',
      limits_monthly_letters_count: 1000,
      color: '#0758FF',
      flags: [],
      created_at: '2024-01-01T00:00:00+00:00',
      updated_at: '2024-01-01T00:00:00+00:00',
    },
    relationships: { associations: {} },
    links: { self: '/organisations/org-123' },
  };

  beforeEach(() => {
    mockHttpClient = {
      request: vi.fn(),
      requestVoid: vi.fn(),
    } as unknown as HttpClient;
    organisations = new Organisations(mockHttpClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('list', () => {
    const mockListResponse: PaginatedResponse<Organisation> = {
      data: [mockOrganisation],
      links: { first: '', last: '', prev: null, next: null, self: '' },
      meta: { current_page: 1, last_page: 1, per_page: 10, from: 1, to: 1, total: 1 },
    };

    it('calls GET /organisations', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockListResponse);

      const result = await organisations.list();

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations',
        query: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('org-123');
    });

    it('passes pagination params in bracket notation', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockListResponse);

      await organisations.list({ pageNumber: 2, pageLimit: 25 });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations',
        query: { 'page[number]': '2', 'page[limit]': '25' },
      });
    });

    it('passes sort, filter, and q params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockListResponse);

      await organisations.list({ sort: '-created_at', filter: 'status:active', q: 'test' });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations',
        query: { sort: '-created_at', filter: 'status:active', q: 'test' },
      });
    });

    it('passes fields param in bracket notation', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockListResponse);

      await organisations.list({ fields: ['name', 'status'] });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations',
        query: { 'fields[organisations]': 'name,status' },
      });
    });

    it('returns paginated response with meta', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockListResponse);

      const result = await organisations.list();

      expect(result.meta.total).toBe(1);
      expect(result.meta.current_page).toBe(1);
    });
  });

  describe('get', () => {
    const mockGetResponse: SingleResponse<Organisation> = {
      data: mockOrganisation,
    };

    it('calls GET /organisations/:id', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockGetResponse);

      const result = await organisations.get('org-123');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-123',
        query: {},
      });
      expect(result.data.id).toBe('org-123');
      expect(result.data.attributes.name).toBe('Test Org');
    });

    it('passes fields param', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockGetResponse);

      await organisations.get('org-123', { fields: ['name'] });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-123',
        query: { 'fields[organisations]': 'name' },
      });
    });

    it('returns single response with organisation data', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockGetResponse);

      const result = await organisations.get('org-123');

      expect(result.data.attributes.status).toBe('active');
      expect(result.data.attributes.billing_currency).toBe('CHF');
    });
  });
});
