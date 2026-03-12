import { paginate } from '../../common/pagination.js';
import type { PaginatedResponse, SingleResponse } from '../../common/types.js';
import { apiPath, buildListQuery } from '../../common/query.js';
import type { HttpClient } from '../../core/http-client.js';
import type {
  CreateWebhookData,
  ListWebhooksParams,
  Webhook,
} from './types.js';

/** API module for managing webhook subscriptions within an organisation. */
export class Webhooks {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves a paginated list of webhook subscriptions for an organisation.
   *
   * @param organisationId - The organisation whose webhooks should be listed.
   * @param params - Optional pagination and sparse fieldset parameters.
   * @returns A paginated response containing the matching webhooks.
   */
  async list(
    organisationId: string,
    params?: ListWebhooksParams,
  ): Promise<PaginatedResponse<Webhook>> {
    const query = buildListQuery(params, {
      webhooks: params?.fieldsWebhooks,
      organisations: params?.fieldsOrganisations,
    });

    return this.http.request<PaginatedResponse<Webhook>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/webhooks`,
      query,
    });
  }

  /**
   * Returns an async generator that automatically paginates through all webhooks for an organisation.
   *
   * @param organisationId - The organisation whose webhooks should be iterated.
   * @param params - Optional pagination and sparse fieldset parameters.
   * @returns An async generator yielding individual webhook resources.
   */
  listAll(organisationId: string, params?: ListWebhooksParams): AsyncGenerator<Webhook> {
    return paginate((p) => this.list(organisationId, { ...params, ...p }), params);
  }

  /**
   * Creates a new webhook subscription for an organisation.
   *
   * @param organisationId - The organisation to register the webhook under.
   * @param data - The event category, endpoint URL, and signing key for the new webhook.
   * @returns The created webhook resource.
   */
  async create(
    organisationId: string,
    data: CreateWebhookData,
  ): Promise<SingleResponse<Webhook>> {
    return this.http.request<SingleResponse<Webhook>>({
      method: 'POST',
      path: apiPath`/organisations/${organisationId}/webhooks`,
      body: { data: { type: 'webhooks', attributes: data } },
    });
  }

  /**
   * Retrieves a single webhook subscription by ID.
   *
   * @param organisationId - The organisation that owns the webhook.
   * @param webhookId - The unique identifier of the webhook to retrieve.
   * @returns The webhook resource.
   */
  async get(
    organisationId: string,
    webhookId: string,
  ): Promise<SingleResponse<Webhook>> {
    return this.http.request<SingleResponse<Webhook>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/webhooks/${webhookId}`,
    });
  }

  /**
   * Deletes a webhook subscription.
   *
   * @param organisationId - The organisation that owns the webhook.
   * @param webhookId - The unique identifier of the webhook to delete.
   */
  async delete(organisationId: string, webhookId: string): Promise<void> {
    await this.http.requestVoid({
      method: 'DELETE',
      path: apiPath`/organisations/${organisationId}/webhooks/${webhookId}`,
    });
  }
}
