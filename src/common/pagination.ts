import type { PaginatedResponse, PaginationParams } from './types.js';

/**
 * Async generator that automatically paginates through all pages of a list endpoint,
 * yielding each item individually without requiring manual page management.
 *
 * @param fetchPage - A function that accepts {@link PaginationParams} and returns a
 *   promise resolving to a single page of results.
 * @param params - Optional initial pagination, sorting, and filtering parameters.
 *   The `pageNumber` field is managed internally and incremented on each iteration.
 * @returns An `AsyncGenerator` that yields every item across all pages in order.
 *
 * @example
 * ```typescript
 * for await (const letter of paginate(sdk.letters.list.bind(sdk.letters), { pageLimit: 100 })) {
 *   console.log(letter.id);
 * }
 * ```
 */
export async function* paginate<T>(
  fetchPage: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
  params?: PaginationParams,
): AsyncGenerator<T> {
  let pageNumber = params?.pageNumber ?? 1;

  while (true) {
    const response = await fetchPage({ ...params, pageNumber });

    for (const item of response.data) {
      yield item;
    }

    if (response.meta.current_page >= response.meta.last_page) {
      break;
    }

    pageNumber++;
  }
}
