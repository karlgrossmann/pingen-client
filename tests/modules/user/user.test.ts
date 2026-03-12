import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../../../src/core/http-client.js';
import { Users } from '../../../src/modules/user/user.js';
import type { Association, User } from '../../../src/modules/user/types.js';
import type { PaginatedResponse, SingleResponse } from '../../../src/common/types.js';

describe('Users', () => {
  let mockHttpClient: HttpClient;
  let user: Users;

  const mockUser: User = {
    id: 'user-123',
    type: 'users',
    attributes: {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      status: 'active',
      language: 'en-GB',
      edition: 'standard',
      flags: [],
      created_at: '2024-01-01T00:00:00+00:00',
      updated_at: '2024-01-01T00:00:00+00:00',
    },
    relationships: { associations: {}, notifications: {} },
    links: { self: '/user' },
  };

  const mockAssociation: Association = {
    id: 'assoc-123',
    type: 'associations',
    attributes: {
      role: 'owner',
      status: 'active',
      created_at: '2024-01-01T00:00:00+00:00',
      updated_at: '2024-01-01T00:00:00+00:00',
    },
    relationships: { organisation: {} },
    links: { self: '/user/associations/assoc-123' },
    meta: { abilities: {} },
  };

  beforeEach(() => {
    mockHttpClient = {
      request: vi.fn(),
      requestVoid: vi.fn(),
    } as unknown as HttpClient;
    user = new Users(mockHttpClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    const mockGetResponse: SingleResponse<User> = {
      data: mockUser,
    };

    it('calls GET /user', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockGetResponse);

      const result = await user.get();

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/user',
        query: {},
      });
      expect(result.data.id).toBe('user-123');
    });

    it('passes fields param in bracket notation', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockGetResponse);

      await user.get({ fields: ['email', 'first_name'] });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/user',
        query: { 'fields[users]': 'email,first_name' },
      });
    });

    it('returns single response with user data', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockGetResponse);

      const result = await user.get();

      expect(result.data.attributes.email).toBe('test@example.com');
      expect(result.data.attributes.status).toBe('active');
      expect(result.data.attributes.language).toBe('en-GB');
    });
  });

  describe('listAssociations', () => {
    const mockListResponse: PaginatedResponse<Association> = {
      data: [mockAssociation],
      links: { first: '', last: '', prev: null, next: null, self: '' },
      meta: { current_page: 1, last_page: 1, per_page: 10, from: 1, to: 1, total: 1 },
    };

    it('calls GET /user/associations', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockListResponse);

      const result = await user.listAssociations();

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/user/associations',
        query: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('assoc-123');
    });

    it('passes pagination params in bracket notation', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockListResponse);

      await user.listAssociations({ pageNumber: 2, pageLimit: 25 });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/user/associations',
        query: { 'page[number]': '2', 'page[limit]': '25' },
      });
    });

    it('passes sort, filter, and q params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockListResponse);

      await user.listAssociations({ sort: '-created_at', filter: 'status:active', q: 'test' });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/user/associations',
        query: { sort: '-created_at', filter: 'status:active', q: 'test' },
      });
    });

    it('passes fields params for associations and organisations', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockListResponse);

      await user.listAssociations({
        fieldsAssociations: ['role', 'status'],
        fieldsOrganisations: ['name'],
      });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/user/associations',
        query: {
          'fields[associations]': 'role,status',
          'fields[organisations]': 'name',
        },
      });
    });

    it('passes include param', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockListResponse);

      await user.listAssociations({ include: 'organisation' });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/user/associations',
        query: { include: 'organisation' },
      });
    });

    it('returns paginated response with meta', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockListResponse);

      const result = await user.listAssociations();

      expect(result.meta.total).toBe(1);
      expect(result.meta.current_page).toBe(1);
    });
  });
});
