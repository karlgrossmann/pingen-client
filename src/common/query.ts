import type { PaginationParams } from './types.js';

export function apiPath(
  strings: TemplateStringsArray,
  ...values: string[]
): string {
  return strings.reduce(
    (result, str, i) =>
      result + str + (i < values.length ? encodeURIComponent(values[i]) : ''),
    '',
  );
}

export function buildPaginationQuery(params?: PaginationParams): Record<string, string> {
  if (!params) return {};

  const query: Record<string, string> = {};

  if (params.pageNumber !== undefined) query['page[number]'] = String(params.pageNumber);
  if (params.pageLimit !== undefined) query['page[limit]'] = String(params.pageLimit);
  if (params.sort !== undefined) query['sort'] = params.sort;
  if (params.filter !== undefined) query['filter'] = params.filter;
  if (params.q !== undefined) query['q'] = params.q;

  return query;
}

export function buildFieldsQuery(
  fields: Record<string, readonly string[] | undefined>,
): Record<string, string> {
  const query: Record<string, string> = {};

  for (const [resource, values] of Object.entries(fields)) {
    if (values && values.length > 0) {
      query[`fields[${resource}]`] = values.join(',');
    }
  }

  return query;
}

export interface ListQueryParams extends PaginationParams {
  readonly include?: string;
  readonly language?: string;
}

export function buildListQuery(
  params?: ListQueryParams,
  fields?: Record<string, readonly string[] | undefined>,
): Record<string, string> {
  return {
    ...buildPaginationQuery(params),
    ...buildFieldsQuery(fields ?? {}),
    ...(params?.include ? { include: params.include } : {}),
    ...(params?.language ? { language: params.language } : {}),
  };
}
