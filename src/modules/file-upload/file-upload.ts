import type { SingleResponse } from '../../common/types.js';
import { buildFieldsQuery } from '../../common/query.js';
import type { HttpClient } from '../../core/http-client.js';
import type { FileUpload as FileUploadResource, GetFileUploadParams } from './types.js';

/**
 * API module for obtaining presigned file upload URLs.
 *
 * This is the first step in the letter and batch creation workflow: retrieve a
 * presigned upload URL, PUT the file to that URL, then pass the returned
 * `url_signature` when creating a letter or batch.
 */
export class FileUploads {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves a presigned file upload URL and its associated signature.
   *
   * Upload the file to the returned `url` via HTTP PUT, then supply the
   * `url_signature` as `file_url_signature` when creating a letter or batch.
   *
   * @param params - Optional sparse fieldset parameters.
   * @returns A single-resource response containing the presigned upload URL and signature.
   */
  async getDetails(params?: GetFileUploadParams): Promise<SingleResponse<FileUploadResource>> {
    const query = buildFieldsQuery({ file_uploads: params?.fields });

    return this.http.request<SingleResponse<FileUploadResource>>({
      method: 'GET',
      path: '/file-upload',
      query,
    });
  }
}
