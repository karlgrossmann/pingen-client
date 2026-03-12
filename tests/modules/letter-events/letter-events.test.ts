import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../../../src/core/http-client.js';
import { LetterEvents } from '../../../src/modules/letter-events/letter-events.js';
import type { LetterEvent } from '../../../src/modules/letter-events/types.js';
import type { PaginatedResponse } from '../../../src/common/types.js';

describe('LetterEvents', () => {
  let mockHttpClient: HttpClient;
  let letterEvents: LetterEvents;

  const mockEvent: LetterEvent = {
    id: 'event-123',
    type: 'letters_events',
    attributes: {
      code: 'E001',
      name: 'Delivered',
      producer: 'post',
      location: 'Zurich',
      has_image: true,
      data: [],
      emitted_at: '2024-01-01T12:00:00+00:00',
      created_at: '2024-01-01T00:00:00+00:00',
      updated_at: '2024-01-01T00:00:00+00:00',
    },
    relationships: { letter: {} },
    links: { self: '/organisations/org-1/letters/letter-1/events/event-123' },
  };

  const paginatedResponse: PaginatedResponse<LetterEvent> = {
    data: [mockEvent],
    links: { first: '', last: '', prev: null, next: null, self: '' },
    meta: { current_page: 1, last_page: 1, per_page: 10, from: 1, to: 1, total: 1 },
  };

  beforeEach(() => {
    mockHttpClient = {
      request: vi.fn(),
      requestVoid: vi.fn(),
      requestUrl: vi.fn(),
    } as unknown as HttpClient;
    letterEvents = new LetterEvents(mockHttpClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('list', () => {
    it('calls GET /organisations/:orgId/letters/:letterId/events', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      const result = await letterEvents.list('org-1', 'letter-1');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/letter-1/events',
        query: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('event-123');
    });

    it('passes pagination params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await letterEvents.list('org-1', 'letter-1', { pageNumber: 2, pageLimit: 25 });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/letter-1/events',
        query: { 'page[number]': '2', 'page[limit]': '25' },
      });
    });

    it('passes include, language, and fields params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await letterEvents.list('org-1', 'letter-1', {
        include: 'letter',
        language: 'en',
        fieldsLettersEvents: ['code', 'name'],
        fieldsLetters: ['status'],
      });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/letter-1/events',
        query: {
          include: 'letter',
          language: 'en',
          'fields[letters_events]': 'code,name',
          'fields[letters]': 'status',
        },
      });
    });
  });

  describe('getImage', () => {
    it('calls GET and returns redirect URL', async () => {
      vi.mocked(mockHttpClient.requestUrl).mockResolvedValueOnce('https://s3.example.com/image.png');

      const url = await letterEvents.getImage('org-1', 'letter-1', 'event-123');

      expect(mockHttpClient.requestUrl).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/letter-1/events/event-123/image',
      });
      expect(url).toBe('https://s3.example.com/image.png');
    });
  });

  describe('listIssues', () => {
    it('calls GET /organisations/:orgId/letters/events/issues', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      const result = await letterEvents.listIssues('org-1');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/events/issues',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('passes pagination, language, include, and fields params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await letterEvents.listIssues('org-1', {
        pageNumber: 1,
        pageLimit: 10,
        language: 'de',
        include: 'letter',
        fieldsLettersEvents: ['code'],
        fieldsLetters: ['status'],
      });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/events/issues',
        query: {
          'page[number]': '1',
          'page[limit]': '10',
          language: 'de',
          include: 'letter',
          'fields[letters_events]': 'code',
          'fields[letters]': 'status',
        },
      });
    });
  });

  describe('listUndeliverable', () => {
    it('calls GET /organisations/:orgId/letters/events/undeliverable', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      const result = await letterEvents.listUndeliverable('org-1');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/events/undeliverable',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('passes params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await letterEvents.listUndeliverable('org-1', { language: 'fr' });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/events/undeliverable',
        query: { language: 'fr' },
      });
    });
  });

  describe('listSent', () => {
    it('calls GET /organisations/:orgId/letters/events/sent', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      const result = await letterEvents.listSent('org-1');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/events/sent',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('passes params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await letterEvents.listSent('org-1', { language: 'it', pageLimit: 5 });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/events/sent',
        query: { language: 'it', 'page[limit]': '5' },
      });
    });
  });

  describe('listDelivered', () => {
    it('calls GET /organisations/:orgId/letters/events/delivered', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      const result = await letterEvents.listDelivered('org-1');

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/events/delivered',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('passes params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(paginatedResponse);

      await letterEvents.listDelivered('org-1', { include: 'letter', language: 'en' });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organisations/org-1/letters/events/delivered',
        query: { include: 'letter', language: 'en' },
      });
    });
  });
});
