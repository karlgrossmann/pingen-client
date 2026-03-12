import { paginate } from '../../common/pagination.js';
import type { PaginatedResponse, SingleResponse } from '../../common/types.js';
import { apiPath, buildListQuery } from '../../common/query.js';
import type { HttpClient } from '../../core/http-client.js';
import type {
  CalculatePriceData,
  CreateLetterData,
  GetLetterParams,
  Letter,
  ListLettersParams,
  PriceResult,
  SendLetterData,
  UpdateLetterData,
} from './types.js';

/** API module for managing letters within a Pingen organisation. */
export class Letters {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves a paginated list of letters for the given organisation.
   *
   * @param organisationId - Unique identifier of the organisation.
   * @param params - Optional pagination, include, and sparse fieldset parameters.
   * @returns A paginated JSON:API response containing letter resources.
   */
  async list(
    organisationId: string,
    params?: ListLettersParams,
  ): Promise<PaginatedResponse<Letter>> {
    const query = buildListQuery(params, {
      letters: params?.fieldsLetters,
      organisations: params?.fieldsOrganisations,
      batches: params?.fieldsBatches,
    });

    return this.http.request<PaginatedResponse<Letter>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/letters`,
      query,
    });
  }

  /**
   * Returns an async generator that iterates over all letters across pages.
   *
   * Internally calls {@link list} repeatedly, advancing the cursor until all
   * pages have been consumed. Use `for await...of` to iterate.
   *
   * @param organisationId - Unique identifier of the organisation.
   * @param params - Optional pagination, include, and sparse fieldset parameters.
   *   The generator manages cursor/page advancement automatically.
   * @returns An async generator that yields individual {@link Letter} resources.
   */
  listAll(organisationId: string, params?: ListLettersParams): AsyncGenerator<Letter> {
    return paginate((p) => this.list(organisationId, { ...params, ...p }), params);
  }

  /**
   * Creates a new letter for the given organisation.
   *
   * The `file_url` and `file_url_signature` fields in `data` must be obtained
   * from the file upload endpoint prior to calling this method.
   *
   * @example
   * ```typescript
   * // 1. Upload the PDF file
   * const upload = await pingen.fileUpload.upload(organisationId, fileBuffer);
   *
   * // 2. Create the letter using the upload result
   * const letter = await pingen.letters.create(organisationId, {
   *   file_original_name: 'invoice.pdf',
   *   file_url: upload.data.attributes.url,
   *   file_url_signature: upload.data.attributes.url_signature,
   *   address_position: 'left',
   *   auto_send: false,
   * });
   * ```
   *
   * @param organisationId - Unique identifier of the organisation.
   * @param data - Letter creation payload including the uploaded file reference.
   * @returns A JSON:API single-resource response containing the created letter.
   * @throws If the file URL or signature is invalid, or the organisation is not found.
   */
  async create(organisationId: string, data: CreateLetterData): Promise<SingleResponse<Letter>> {
    const { preset_id, ...attributes } = data;
    const body: Record<string, unknown> = {
      data: {
        type: 'letters',
        attributes,
        ...(preset_id
          ? { relationships: { preset: { data: { id: preset_id, type: 'presets' } } } }
          : {}),
      },
    };

    return this.http.request<SingleResponse<Letter>>({
      method: 'POST',
      path: apiPath`/organisations/${organisationId}/letters`,
      body,
    });
  }

  /**
   * Retrieves a single letter by its ID.
   *
   * @param organisationId - Unique identifier of the organisation.
   * @param letterId - Unique identifier of the letter to retrieve.
   * @param params - Optional include and sparse fieldset parameters.
   * @returns A JSON:API single-resource response containing the letter.
   * @throws If the letter or organisation is not found.
   */
  async get(
    organisationId: string,
    letterId: string,
    params?: GetLetterParams,
  ): Promise<SingleResponse<Letter>> {
    const query = buildListQuery(params, {
      letters: params?.fieldsLetters,
      organisations: params?.fieldsOrganisations,
      batches: params?.fieldsBatches,
    });

    return this.http.request<SingleResponse<Letter>>({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/letters/${letterId}`,
      query,
    });
  }

  /**
   * Updates mutable attributes of an existing letter.
   *
   * Only letters that have not yet been submitted can be updated.
   *
   * @param organisationId - Unique identifier of the organisation.
   * @param letterId - Unique identifier of the letter to update.
   * @param data - Partial letter data containing the fields to update.
   * @returns A JSON:API single-resource response containing the updated letter.
   * @throws If the letter has already been submitted or is not found.
   */
  async update(
    organisationId: string,
    letterId: string,
    data: UpdateLetterData,
  ): Promise<SingleResponse<Letter>> {
    return this.http.request<SingleResponse<Letter>>({
      method: 'PATCH',
      path: apiPath`/organisations/${organisationId}/letters/${letterId}`,
      body: { data: { id: letterId, type: 'letters', attributes: data } },
    });
  }

  /**
   * Deletes a letter that has not yet been submitted.
   *
   * @param organisationId - Unique identifier of the organisation.
   * @param letterId - Unique identifier of the letter to delete.
   * @returns A promise that resolves when the letter has been deleted.
   * @throws If the letter has already been submitted or is not found.
   */
  async delete(organisationId: string, letterId: string): Promise<void> {
    await this.http.requestVoid({
      method: 'DELETE',
      path: apiPath`/organisations/${organisationId}/letters/${letterId}`,
    });
  }

  /**
   * Submits a letter for sending with the specified delivery settings.
   *
   * Once sent, the letter transitions to a non-editable state and will be
   * physically printed and dispatched by Pingen.
   *
   * @param organisationId - Unique identifier of the organisation.
   * @param letterId - Unique identifier of the letter to send.
   * @param data - Delivery settings including product, print mode, and spectrum.
   * @returns A JSON:API single-resource response containing the updated letter.
   * @throws If the letter is not in a sendable state or is not found.
   */
  async send(
    organisationId: string,
    letterId: string,
    data: SendLetterData,
  ): Promise<SingleResponse<Letter>> {
    return this.http.request<SingleResponse<Letter>>({
      method: 'PATCH',
      path: apiPath`/organisations/${organisationId}/letters/${letterId}/send`,
      body: { data: { id: letterId, type: 'letters', attributes: data } },
    });
  }

  /**
   * Cancels a letter that is queued or in progress.
   *
   * Cancellation is only possible while the letter has not yet been handed
   * over to the postal carrier.
   *
   * @param organisationId - Unique identifier of the organisation.
   * @param letterId - Unique identifier of the letter to cancel.
   * @returns A promise that resolves when the letter has been cancelled.
   * @throws If the letter cannot be cancelled at its current stage or is not found.
   */
  async cancel(organisationId: string, letterId: string): Promise<void> {
    await this.http.requestVoid({
      method: 'PATCH',
      path: apiPath`/organisations/${organisationId}/letters/${letterId}/cancel`,
    });
  }

  /**
   * Returns a presigned URL to download the letter PDF.
   *
   * The URL is short-lived and should be used immediately. It points directly
   * to the stored PDF file and does not require additional authentication.
   *
   * @param organisationId - Unique identifier of the organisation.
   * @param letterId - Unique identifier of the letter.
   * @returns A presigned URL string for downloading the letter PDF.
   * @throws If the letter or its file is not found.
   */
  async getFile(organisationId: string, letterId: string): Promise<string> {
    return this.http.requestUrl({
      method: 'GET',
      path: apiPath`/organisations/${organisationId}/letters/${letterId}/file`,
    });
  }

  /**
   * Calculates the postage price for a letter with the given parameters.
   *
   * This is a non-persistent operation — no letter resource is created. Use it
   * to show price estimates before committing to a send.
   *
   * @param organisationId - Unique identifier of the organisation.
   * @param data - Parameters describing the letter's destination, paper, and print settings.
   * @returns A JSON:API single-resource response containing the calculated price.
   * @throws If the organisation is not found or the input parameters are invalid.
   */
  async calculatePrice(
    organisationId: string,
    data: CalculatePriceData,
  ): Promise<SingleResponse<PriceResult>> {
    return this.http.request<SingleResponse<PriceResult>>({
      method: 'POST',
      path: apiPath`/organisations/${organisationId}/letters/price-calculator`,
      body: { data: { type: 'letter_price_calculator', attributes: data } },
    });
  }
}
