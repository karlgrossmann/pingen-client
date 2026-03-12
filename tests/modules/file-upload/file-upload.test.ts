import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../../../src/core/http-client.js';
import { FileUploads } from '../../../src/modules/file-upload/file-upload.js';
import type { FileUpload } from '../../../src/modules/file-upload/types.js';
import type { SingleResponse } from '../../../src/common/types.js';

describe('FileUploads', () => {
  let mockHttpClient: HttpClient;
  let fileUpload: FileUploads;

  const mockFileUpload: FileUpload = {
    id: 'fu-123',
    type: 'file_uploads',
    attributes: {
      url: 'https://storage.example.com/upload/abc',
      url_signature: 'sig-xyz-123',
      expires_at: '2026-03-12T12:00:00+00:00',
    },
    links: { self: '/file-upload/fu-123' },
  };

  beforeEach(() => {
    mockHttpClient = {
      request: vi.fn(),
      requestVoid: vi.fn(),
    } as unknown as HttpClient;
    fileUpload = new FileUploads(mockHttpClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDetails', () => {
    const mockResponse: SingleResponse<FileUpload> = {
      data: mockFileUpload,
    };

    it('calls GET /file-upload without params', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      const result = await fileUpload.getDetails();

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/file-upload',
        query: {},
      });
      expect(result.data.id).toBe('fu-123');
    });

    it('passes fields param in bracket notation', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      await fileUpload.getDetails({ fields: ['url', 'expires_at'] });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/file-upload',
        query: { 'fields[file_uploads]': 'url,expires_at' },
      });
    });

    it('returns single response with file upload data', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      const result = await fileUpload.getDetails();

      expect(result.data.attributes.url).toBe('https://storage.example.com/upload/abc');
      expect(result.data.attributes.url_signature).toBe('sig-xyz-123');
      expect(result.data.attributes.expires_at).toBe('2026-03-12T12:00:00+00:00');
    });

    it('handles empty fields array', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      await fileUpload.getDetails({ fields: [] });

      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/file-upload',
        query: {},
      });
    });
  });
});
