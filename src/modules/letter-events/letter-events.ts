import { paginate } from '../../common/pagination.js';
import type { PaginatedResponse } from '../../common/types.js';
import { apiPath, buildListQuery } from '../../common/query.js';
import type { HttpClient } from '../../core/http-client.js';
import type { LetterEvent, ListLetterEventsCollectionParams, ListLetterEventsParams } from './types.js';

/** API module for retrieving letter lifecycle events. */
export class LetterEvents {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves a paginated list of events for a specific letter.
   *
   * @param organisationId - The organisation that owns the letter.
   * @param letterId - The letter whose events should be listed.
   * @param params - Optional pagination and sparse fieldset parameters.
   * @returns A paginated response containing the matching letter events.
   */
  async list(
    organisationId: string,
    letterId: string,
    params?: ListLetterEventsParams,
  ): Promise<PaginatedResponse<LetterEvent>> {
    const query = buildListQuery(params, {
      letters_events: params?.fieldsLettersEvents,
      letters: params?.fieldsLetters,
    });

    return this.http.request<PaginatedResponse<LetterEvent>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/letters/${letterId}/events`,
      query,
    });
  }

  /**
   * Returns an async generator that automatically paginates through all events for a specific letter.
   *
   * @param organisationId - The organisation that owns the letter.
   * @param letterId - The letter whose events should be iterated.
   * @param params - Optional pagination and sparse fieldset parameters.
   * @returns An async generator yielding individual letter events.
   */
  listAll(
    organisationId: string,
    letterId: string,
    params?: ListLetterEventsParams,
  ): AsyncGenerator<LetterEvent> {
    return paginate((p) => this.list(organisationId, letterId, { ...params, ...p }), params);
  }

  /**
   * Returns a presigned URL to download the tracking image for a specific letter event.
   *
   * @param organisationId - The organisation that owns the letter.
   * @param letterId - The letter that contains the event.
   * @param eventId - The event for which the image URL should be retrieved.
   * @returns A presigned URL string pointing to the event tracking image.
   */
  async getImage(
    organisationId: string,
    letterId: string,
    eventId: string,
  ): Promise<string> {
    return this.http.requestUrl({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/letters/${letterId}/events/${eventId}/image`,
    });
  }

  /**
   * Lists events with issue status across all letters in the organisation.
   *
   * @param organisationId - The organisation whose letter issue events should be listed.
   * @param params - Optional pagination and sparse fieldset parameters.
   * @returns A paginated response containing issue events.
   */
  async listIssues(
    organisationId: string,
    params?: ListLetterEventsCollectionParams,
  ): Promise<PaginatedResponse<LetterEvent>> {
    return this.http.request<PaginatedResponse<LetterEvent>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/letters/events/issues`,
      query: this.buildCollectionQuery(params),
    });
  }

  /**
   * Lists undeliverable events across all letters in the organisation.
   *
   * @param organisationId - The organisation whose undeliverable events should be listed.
   * @param params - Optional pagination and sparse fieldset parameters.
   * @returns A paginated response containing undeliverable events.
   */
  async listUndeliverable(
    organisationId: string,
    params?: ListLetterEventsCollectionParams,
  ): Promise<PaginatedResponse<LetterEvent>> {
    return this.http.request<PaginatedResponse<LetterEvent>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/letters/events/undeliverable`,
      query: this.buildCollectionQuery(params),
    });
  }

  /**
   * Lists sent events across all letters in the organisation.
   *
   * @param organisationId - The organisation whose sent events should be listed.
   * @param params - Optional pagination and sparse fieldset parameters.
   * @returns A paginated response containing sent events.
   */
  async listSent(
    organisationId: string,
    params?: ListLetterEventsCollectionParams,
  ): Promise<PaginatedResponse<LetterEvent>> {
    return this.http.request<PaginatedResponse<LetterEvent>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/letters/events/sent`,
      query: this.buildCollectionQuery(params),
    });
  }

  /**
   * Lists delivered events across all letters in the organisation.
   *
   * @param organisationId - The organisation whose delivered events should be listed.
   * @param params - Optional pagination and sparse fieldset parameters.
   * @returns A paginated response containing delivered events.
   */
  async listDelivered(
    organisationId: string,
    params?: ListLetterEventsCollectionParams,
  ): Promise<PaginatedResponse<LetterEvent>> {
    return this.http.request<PaginatedResponse<LetterEvent>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/letters/events/delivered`,
      query: this.buildCollectionQuery(params),
    });
  }

  private buildCollectionQuery(params?: ListLetterEventsCollectionParams): Record<string, string> {
    return buildListQuery(params, {
      letters_events: params?.fieldsLettersEvents,
      letters: params?.fieldsLetters,
    });
  }
}
