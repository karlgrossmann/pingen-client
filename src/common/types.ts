/** Common pagination, sorting, and filtering parameters for list endpoints. */
export interface PaginationParams {
  /** Page number to fetch (1-based). */
  readonly pageNumber?: number;
  /** Maximum number of items to return per page. */
  readonly pageLimit?: number;
  /** Field to sort results by. Prefix with `-` for descending order. */
  readonly sort?: string;
  /** Filter expression to narrow results. */
  readonly filter?: string;
  /** Full-text search query string. */
  readonly q?: string;
}

/**
 * Permission status for a resource ability.
 *
 * - `'ok'` — the current user has permission.
 * - `'permission'` — the current user lacks permission.
 */
export type AbilityStatus = 'ok' | 'permission';

/** Available abilities (permissions) for a resource. */
export interface ResourceAbilities {
  readonly self: {
    /** Indicates whether the current user may manage (edit/delete) this resource. */
    readonly manage: AbilityStatus;
  };
}

/** Metadata attached to a resource, including its permission abilities. */
export interface ResourceMeta {
  /** Permission abilities available to the current user for this resource. */
  readonly abilities: ResourceAbilities;
}

/** JSON:API relationship object linking to a related resource. */
export interface Relationship {
  /** The type and id of the related resource. */
  readonly data: { readonly id: string; readonly type: string };
  /** Optional links block containing a URL to fetch the related resource. */
  readonly links?: { readonly related: string };
}

/** Navigation links for a paginated response. */
export interface PaginationLinks {
  /** URL of the first page. */
  readonly first: string;
  /** URL of the last page. */
  readonly last: string;
  /** URL of the previous page, or `null` if on the first page. */
  readonly prev: string | null;
  /** URL of the next page, or `null` if on the last page. */
  readonly next: string | null;
  /** URL of the current page. */
  readonly self: string;
}

/** Pagination metadata returned alongside a paginated list of resources. */
export interface PaginationMeta {
  /** The current page number (1-based). */
  readonly current_page: number;
  /** The index of the last available page. */
  readonly last_page: number;
  /** Number of items per page. */
  readonly per_page: number;
  /** Index of the first item on the current page (1-based). */
  readonly from: number;
  /** Index of the last item on the current page (1-based). */
  readonly to: number;
  /** Total number of items across all pages. */
  readonly total: number;
}

/** A sideloaded resource included via the JSON:API `include` query parameter. */
export interface IncludedResource {
  /** Unique identifier of the included resource. */
  readonly id: string;
  /** JSON:API resource type of the included resource. */
  readonly type: string;
  /** Attribute map of the included resource. */
  readonly attributes: Record<string, unknown>;
  /** Relationships of the included resource, keyed by relationship name. */
  readonly relationships?: Record<string, Relationship>;
  /** Links block for the included resource. */
  readonly links?: { readonly self: string };
}

/**
 * Paginated list response following JSON:API format.
 *
 * @template T - The resource type contained in the `data` array.
 */
export interface PaginatedResponse<T> {
  /** Array of resources for the current page. */
  readonly data: readonly T[];
  /** Sideloaded related resources requested via `include`. */
  readonly included?: readonly IncludedResource[];
  /** Navigation links for moving between pages. */
  readonly links: PaginationLinks;
  /** Pagination metadata such as total count and page boundaries. */
  readonly meta: PaginationMeta;
}

/**
 * Single resource response following JSON:API format.
 *
 * @template T - The resource type of the primary `data` object.
 */
export interface SingleResponse<T> {
  /** The primary resource object. */
  readonly data: T;
  /** Sideloaded related resources requested via `include`. */
  readonly included?: readonly IncludedResource[];
}
