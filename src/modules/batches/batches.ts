import { paginate } from '../../common/pagination.js';
import type { PaginatedResponse, SingleResponse } from '../../common/types.js';
import { apiPath, buildFieldsQuery, buildListQuery } from '../../common/query.js';
import type { HttpClient } from '../../core/http-client.js';
import type {
  Batch,
  BatchStatistics,
  CreateBatchData,
  DeleteBatchData,
  GetBatchParams,
  ListBatchesParams,
  SendBatchData,
  UpdateBatchData,
} from './types.js';

/** API module for managing letter batches within an organisation. */
export class Batches {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieve a paginated list of batches for an organisation.
   *
   * @param organisationId - The ID of the organisation whose batches to list.
   * @param params - Optional pagination, sparse-fieldset, and include parameters.
   * @returns A paginated response containing the matching batch resources.
   */
  async list(
    organisationId: string,
    params?: ListBatchesParams,
  ): Promise<PaginatedResponse<Batch>> {
    const query = buildListQuery(params, {
      batches: params?.fieldsBatches,
      organisations: params?.fieldsOrganisations,
    });

    return this.http.request<PaginatedResponse<Batch>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/batches`,
      query,
    });
  }

  /**
   * Iterate over all batches for an organisation, automatically following pagination.
   *
   * @param organisationId - The ID of the organisation whose batches to iterate.
   * @param params - Optional pagination, sparse-fieldset, and include parameters.
   * @returns An async generator that yields each batch resource in order.
   */
  listAll(organisationId: string, params?: ListBatchesParams): AsyncGenerator<Batch> {
    return paginate((p) => this.list(organisationId, { ...params, ...p }), params);
  }

  /**
   * Create a new batch for an organisation.
   *
   * @param organisationId - The ID of the organisation in which to create the batch.
   * @param data - Batch creation data, including file URL and signature from the upload endpoint.
   * @returns A single-resource response containing the newly created batch.
   */
  async create(
    organisationId: string,
    data: CreateBatchData,
  ): Promise<SingleResponse<Batch>> {
    const { preset_id, ...attributes } = data;
    const body: Record<string, unknown> = {
      data: {
        type: 'batches',
        attributes,
        ...(preset_id
          ? { relationships: { preset: { data: { id: preset_id, type: 'presets' } } } }
          : {}),
      },
    };

    return this.http.request<SingleResponse<Batch>>({
      method: 'POST',
      path: apiPath`/organisations/${organisationId}/batches`,
      body,
    });
  }

  /**
   * Retrieve a single batch by ID.
   *
   * @param organisationId - The ID of the organisation that owns the batch.
   * @param batchId - The ID of the batch to retrieve.
   * @param params - Optional sparse-fieldset parameters.
   * @returns A single-resource response containing the batch.
   */
  async get(
    organisationId: string,
    batchId: string,
    params?: GetBatchParams,
  ): Promise<SingleResponse<Batch>> {
    const query = buildFieldsQuery({ batches: params?.fieldsBatches });

    return this.http.request<SingleResponse<Batch>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/batches/${batchId}`,
      query,
    });
  }

  /**
   * Update the display properties of an existing batch.
   *
   * @param organisationId - The ID of the organisation that owns the batch.
   * @param batchId - The ID of the batch to update.
   * @param data - Fields to update (name and/or icon).
   * @returns A promise that resolves when the update is complete.
   */
  async update(
    organisationId: string,
    batchId: string,
    data: UpdateBatchData,
  ): Promise<void> {
    await this.http.requestVoid({
      method: 'PATCH',
      path: apiPath`/organisations/${organisationId}/batches/${batchId}`,
      body: { data: { id: batchId, type: 'batches', attributes: data } },
    });
  }

  /**
   * Delete a batch.
   *
   * @param organisationId - The ID of the organisation that owns the batch.
   * @param batchId - The ID of the batch to delete.
   * @param data - Optional deletion options. When `with_letters` is `true`,
   *   **all letters in the batch are permanently deleted** along with the batch.
   * @returns A promise that resolves when the deletion is complete.
   */
  async delete(
    organisationId: string,
    batchId: string,
    data?: DeleteBatchData,
  ): Promise<void> {
    await this.http.requestVoid({
      method: 'DELETE',
      path: apiPath`/organisations/${organisationId}/batches/${batchId}`,
      ...(data ? { body: { data: { id: batchId, type: 'batches', attributes: data } } } : {}),
    });
  }

  /**
   * Submit a batch for printing and delivery.
   *
   * @param organisationId - The ID of the organisation that owns the batch.
   * @param batchId - The ID of the batch to send.
   * @param data - Delivery and print settings for the send operation.
   * @returns A single-resource response containing the updated batch.
   */
  async send(
    organisationId: string,
    batchId: string,
    data: SendBatchData,
  ): Promise<SingleResponse<Batch>> {
    return this.http.request<SingleResponse<Batch>>({
      method: 'PATCH',
      path: apiPath`/organisations/${organisationId}/batches/${batchId}/send`,
      body: { data: { id: batchId, type: 'batches', attributes: data } },
    });
  }

  /**
   * Cancel a batch that is pending or in progress.
   *
   * @param organisationId - The ID of the organisation that owns the batch.
   * @param batchId - The ID of the batch to cancel.
   * @returns A promise that resolves when the cancellation is complete.
   */
  async cancel(organisationId: string, batchId: string): Promise<void> {
    await this.http.requestVoid({
      method: 'PATCH',
      path: apiPath`/organisations/${organisationId}/batches/${batchId}/cancel`,
    });
  }

  /**
   * Retrieve statistics for a batch.
   *
   * @param organisationId - The ID of the organisation that owns the batch.
   * @param batchId - The ID of the batch whose statistics to retrieve.
   * @param params - Optional sparse-fieldset parameters.
   * @returns A single-resource response containing the batch statistics.
   */
  async getStatistics(
    organisationId: string,
    batchId: string,
    params?: GetBatchParams,
  ): Promise<SingleResponse<BatchStatistics>> {
    const query = buildFieldsQuery({ batches: params?.fieldsBatches });

    return this.http.request<SingleResponse<BatchStatistics>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/batches/${batchId}/statistics`,
      query,
    });
  }
}
