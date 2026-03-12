import { describe, expect, it } from 'vitest';
import {
  apiPath,
  buildFieldsQuery,
  buildListQuery,
  buildPaginationQuery,
} from '../../src/common/query.js';

describe('buildPaginationQuery', () => {
  it('returns empty object when no params', () => {
    expect(buildPaginationQuery()).toEqual({});
    expect(buildPaginationQuery({})).toEqual({});
  });

  it('maps pageNumber and pageLimit to bracket notation', () => {
    const result = buildPaginationQuery({ pageNumber: 2, pageLimit: 25 });

    expect(result).toEqual({
      'page[number]': '2',
      'page[limit]': '25',
    });
  });

  it('includes sort, filter, and q', () => {
    const result = buildPaginationQuery({
      sort: '-created_at',
      filter: 'status:active',
      q: 'search term',
    });

    expect(result).toEqual({
      sort: '-created_at',
      filter: 'status:active',
      q: 'search term',
    });
  });

  it('omits undefined values', () => {
    const result = buildPaginationQuery({ pageNumber: 1 });

    expect(result).toEqual({ 'page[number]': '1' });
    expect(Object.keys(result)).toHaveLength(1);
  });
});

describe('buildFieldsQuery', () => {
  it('returns empty object when no fields', () => {
    expect(buildFieldsQuery({})).toEqual({});
  });

  it('maps fields to bracket notation with comma-separated values', () => {
    const result = buildFieldsQuery({
      organisations: ['name', 'status'],
    });

    expect(result).toEqual({
      'fields[organisations]': 'name,status',
    });
  });

  it('handles multiple resource types', () => {
    const result = buildFieldsQuery({
      letters: ['status', 'address'],
      organisations: ['name'],
    });

    expect(result).toEqual({
      'fields[letters]': 'status,address',
      'fields[organisations]': 'name',
    });
  });

  it('omits undefined and empty arrays', () => {
    const result = buildFieldsQuery({
      organisations: undefined,
      letters: [],
    });

    expect(result).toEqual({});
  });
});

describe('apiPath', () => {
  it('encodes path segments', () => {
    const id = 'id/with/slashes';
    const result = apiPath`/organisations/${id}/letters`;
    expect(result).toBe('/organisations/id%2Fwith%2Fslashes/letters');
  });

  it('leaves normal IDs unchanged', () => {
    const orgId = 'org-123';
    const letterId = 'letter-456';
    const result = apiPath`/organisations/${orgId}/letters/${letterId}`;
    expect(result).toBe('/organisations/org-123/letters/letter-456');
  });

  it('encodes special characters', () => {
    const id = 'id with spaces&special=chars';
    const result = apiPath`/resources/${id}`;
    expect(result).toBe('/resources/id%20with%20spaces%26special%3Dchars');
  });
});

describe('buildListQuery', () => {
  it('returns empty object when no params', () => {
    expect(buildListQuery()).toEqual({});
  });

  it('combines pagination, fields, include, and language', () => {
    const result = buildListQuery(
      { pageNumber: 1, pageLimit: 10, include: 'organisation', language: 'en' },
      { letters: ['status', 'address'] },
    );

    expect(result).toEqual({
      'page[number]': '1',
      'page[limit]': '10',
      include: 'organisation',
      language: 'en',
      'fields[letters]': 'status,address',
    });
  });

  it('omits include and language when not provided', () => {
    const result = buildListQuery({ pageNumber: 2 });

    expect(result).toEqual({ 'page[number]': '2' });
    expect(result).not.toHaveProperty('include');
    expect(result).not.toHaveProperty('language');
  });
});
