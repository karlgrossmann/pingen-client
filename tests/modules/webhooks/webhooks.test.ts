import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../../../src/core/http-client.js';
import { Webhooks } from '../../../src/modules/webhooks/webhooks.js';
import type { Webhook } from '../../../src/modules/webhooks/types.js';
import type { PaginatedResponse, SingleResponse } from '../../../src/common/types.js';

describe('Webhooks', () => {
  let mockHttpClient: HttpClient;
  let webhooks: Webhooks;

  const mockWebhook: Webhook = {
    id: 'webhook-123',
    type: 'webhooks',
    attributes: {
      event_category: 'sent',
      url: 'https://example.com/webhook',
      signing_key: 'secret-key',
    },
    relationships: { organisation: {} },
    links: { self: '/organisations/org-1/webhooks/webhook-123' },
  };

  const paginatedResponse: PaginatedResponse<Webhook> = {
    data: [mockWebhook],
    links: { first: '', last: '', prev: null, next: null, self: '' },
    meta: { current_page: 1, last_page: 1, per_page: 10, from: 1, to: 1, total: 1 },
  };

  const singleResponse: SingleResponse<Webhook> = {
    data: mockWebhook,
  };

  beforeEach(() => {
    mockHttpClient = {
      request: vi.fn(),
      requestVoid: vi.fn(),
    } as unknown as HttpClient;
    webhooks = new Webhooks(mockHttpClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('list', () => {
    it('calls GET /organisations/:orgId/webhooks', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      const result = await webhooks.list('org-1');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/webhooks',
        query: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('webhook-123');
    });

    it('passes pagination params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await webhooks.list('org-1', { pageNumber: 2, pageLimit: 25 });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/webhooks',
        query: { 'page[number]': '2', 'page[limit]': '25' },
      });
    });

    it('passes include and fields params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await webhooks.list('org-1', {
        include: 'organisation',
        fieldsWebhooks: ['url', 'event_category'],
        fieldsOrganisations: ['name'],
      });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/webhooks',
        query: {
          include: 'organisation',
          'fields[webhooks]': 'url,event_category',
          'fields[organisations]': 'name',
        },
      });
    });
  });

  describe('create', () => {
    it('calls POST /organisations/:orgId/webhooks with JSON:API envelope', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const data = {
        event_category: 'sent' as const,
        url: 'https://example.com/webhook',
        signing_key: 'secret-key',
      };

      const result = await webhooks.create('org-1', data);

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/organisations/org-1/webhooks',
        body: { data: { type: 'webhooks', attributes: data } },
      });
      expect(result.data.id).toBe('webhook-123');
    });
  });

  describe('get', () => {
    it('calls GET /organisations/:orgId/webhooks/:webhookId', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(singleResponse);

      const result = await webhooks.get('org-1', 'webhook-123');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/webhooks/webhook-123',
      });
      expect(result.data.attributes.event_category).toBe('sent');
    });
  });

  describe('delete', () => {
    it('calls DELETE /organisations/:orgId/webhooks/:webhookId', async () => {
      vi.mocked(mockHttpClient.requestVoid).mockResolvedValueOnce(undefined);

      await webhooks.delete('org-1', 'webhook-123');

      expect(mockHttpClient.requestVoid).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/organisations/org-1/webhooks/webhook-123',
      });
    });
  });
});
