import { paginate } from '../../common/pagination.js';
import type { PaginatedResponse, SingleResponse } from '../../common/types.js';
import { buildFieldsQuery, buildListQuery } from '../../common/query.js';
import type { HttpClient } from '../../core/http-client.js';
import type {
  Association,
  GetUserParams,
  ListAssociationsParams,
  User,
} from './types.js';

/** API module for retrieving the authenticated user and their organisation associations. */
export class Users {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves the profile of the currently authenticated user.
   *
   * @param params - Optional sparse fieldset parameters.
   * @returns A single-resource response containing the authenticated user's profile.
   */
  async get(params?: GetUserParams): Promise<SingleResponse<User>> {
    const query = buildFieldsQuery({ users: params?.fields });

    return this.http.request<SingleResponse<User>>({
      method: 'GET',
      path: '/user',
      query,
    });
  }

  /**
   * Retrieves a paginated list of organisation associations for the authenticated user.
   *
   * @param params - Optional pagination and sparse fieldset parameters.
   * @returns A paginated response containing the user's organisation associations.
   */
  async listAssociations(
    params?: ListAssociationsParams,
  ): Promise<PaginatedResponse<Association>> {
    const query = buildListQuery(params, {
      associations: params?.fieldsAssociations,
      organisations: params?.fieldsOrganisations,
    });

    return this.http.request<PaginatedResponse<Association>>({
      method: 'GET',
      path: '/user/associations',
      query,
    });
  }

  /**
   * Returns an async generator that automatically paginates through all organisation
   * associations for the authenticated user.
   *
   * @param params - Optional pagination and sparse fieldset parameters.
   * @returns An async generator yielding individual association resources.
   */
  listAllAssociations(params?: ListAssociationsParams): AsyncGenerator<Association> {
    return paginate((p) => this.listAssociations({ ...params, ...p }), params);
  }
}
