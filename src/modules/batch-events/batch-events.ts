import { paginate } from '../../common/pagination.js';
import type { PaginatedResponse } from '../../common/types.js';
import { apiPath, buildListQuery } from '../../common/query.js';
import type { HttpClient } from '../../core/http-client.js';
import type { BatchEvent, ListBatchEventsParams } from './types.js';

/** API module for retrieving lifecycle events associated with a batch. */
export class BatchEvents {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieve a paginated list of events for a specific batch.
   *
   * @param organisationId - The ID of the organisation that owns the batch.
   * @param batchId - The ID of the batch whose events to list.
   * @param params - Optional pagination, language, sparse-fieldset, and include parameters.
   * @returns A paginated response containing the matching batch event resources.
   */
  async list(
    organisationId: string,
    batchId: string,
    params?: ListBatchEventsParams,
  ): Promise<PaginatedResponse<BatchEvent>> {
    const query = buildListQuery(params, {
      batches_events: params?.fieldsBatchesEvents,
      batches: params?.fieldsBatches,
    });

    return this.http.request<PaginatedResponse<BatchEvent>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/batches/${batchId}/events`,
      query,
    });
  }

  /**
   * Iterate over all events for a specific batch, automatically following pagination.
   *
   * @param organisationId - The ID of the organisation that owns the batch.
   * @param batchId - The ID of the batch whose events to iterate.
   * @param params - Optional pagination, language, sparse-fieldset, and include parameters.
   * @returns An async generator that yields each batch event resource in order.
   */
  listAll(
    organisationId: string,
    batchId: string,
    params?: ListBatchEventsParams,
  ): AsyncGenerator<BatchEvent> {
    return paginate((p) => this.list(organisationId, batchId, { ...params, ...p }), params);
  }
}
