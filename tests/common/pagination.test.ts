import { describe, expect, it, vi } from 'vitest';
import { paginate } from '../../src/common/pagination.js';
import type { PaginatedResponse } from '../../src/common/types.js';

describe('paginate', () => {
  function createPage<T>(
    data: T[],
    currentPage: number,
    lastPage: number,
  ): PaginatedResponse<T> {
    return {
      data,
      links: { first: '', last: '', prev: null, next: null, self: '' },
      meta: {
        current_page: currentPage,
        last_page: lastPage,
        per_page: data.length,
        from: 1,
        to: data.length,
        total: data.length * lastPage,
      },
    };
  }

  it('yields all items from a single page', async () => {
    const fetchPage = vi.fn().mockResolvedValueOnce(createPage(['a', 'b', 'c'], 1, 1));

    const items: string[] = [];
    for await (const item of paginate(fetchPage)) {
      items.push(item);
    }

    expect(items).toEqual(['a', 'b', 'c']);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('yields all items across multiple pages', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(createPage(['a', 'b'], 1, 3))
      .mockResolvedValueOnce(createPage(['c', 'd'], 2, 3))
      .mockResolvedValueOnce(createPage(['e'], 3, 3));

    const items: string[] = [];
    for await (const item of paginate(fetchPage)) {
      items.push(item);
    }

    expect(items).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });

  it('passes params through to fetch function', async () => {
    const fetchPage = vi.fn().mockResolvedValueOnce(createPage([], 1, 1));

    const params = { pageLimit: 25, sort: '-created_at' };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of paginate(fetchPage, params)) {
      // drain
    }

    expect(fetchPage).toHaveBeenCalledWith(
      expect.objectContaining({ pageLimit: 25, sort: '-created_at', pageNumber: 1 }),
    );
  });

  it('stops after the last page', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(createPage(['x'], 1, 2))
      .mockResolvedValueOnce(createPage(['y'], 2, 2));

    const items: string[] = [];
    for await (const item of paginate(fetchPage)) {
      items.push(item);
    }

    expect(items).toEqual(['x', 'y']);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });
});
