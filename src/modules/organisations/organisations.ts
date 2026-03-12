import { paginate } from '../../common/pagination.js';
import type { PaginatedResponse, SingleResponse } from '../../common/types.js';
import { apiPath, buildFieldsQuery, buildListQuery } from '../../common/query.js';
import type { HttpClient } from '../../core/http-client.js';
import type {
  GetOrganisationParams,
  ListOrganisationsParams,
  Organisation,
} from './types.js';

/** API module for managing Pingen organisations. */
export class Organisations {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves a paginated list of organisations accessible to the authenticated user.
   *
   * @param params - Optional pagination and sparse fieldset parameters.
   * @returns A paginated JSON:API response containing organisation resources.
   */
  async list(params?: ListOrganisationsParams): Promise<PaginatedResponse<Organisation>> {
    const query = buildListQuery(params, { organisations: params?.fields });

    return this.http.request<PaginatedResponse<Organisation>>({
      method: 'GET',
      path: '/organisations',
      query,
    });
  }

  /**
   * Returns an async generator that iterates over all organisations across pages.
   *
   * Internally calls {@link list} repeatedly, advancing the cursor until all
   * pages have been consumed. Use `for await...of` to iterate.
   *
   * @param params - Optional pagination and sparse fieldset parameters. The generator
   *   manages cursor/page advancement automatically.
   * @returns An async generator that yields individual {@link Organisation} resources.
   */
  listAll(params?: ListOrganisationsParams): AsyncGenerator<Organisation> {
    return paginate((p) => this.list({ ...params, ...p }), params);
  }

  /**
   * Retrieves a single organisation by its ID.
   *
   * @param organisationId - Unique identifier of the organisation to retrieve.
   * @param params - Optional sparse fieldset parameters.
   * @returns A JSON:API single-resource response containing the organisation.
   */
  async get(
    organisationId: string,
    params?: GetOrganisationParams,
  ): Promise<SingleResponse<Organisation>> {
    const query = buildFieldsQuery({ organisations: params?.fields });

    return this.http.request<SingleResponse<Organisation>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}`,
      query,
    });
  }
}
