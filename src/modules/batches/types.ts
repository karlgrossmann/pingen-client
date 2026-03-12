import type { PaginationParams, Relationship, ResourceMeta } from '../../common/types.js';
import type { DeliveryProduct } from '../letters/types.js';

/** Print mode for batch letters: single-sided or double-sided. */
export type PrintMode = 'simplex' | 'duplex';

/** Colour spectrum used when printing batch letters. */
export type PrintSpectrum = 'color' | 'grayscale';

/** Position of the recipient address window on the envelope. */
export type AddressPosition = 'left' | 'right';

/** Origin of a batch — created through the web app or via the API. */
export type BatchSource = 'app' | 'api';

/** Icon that visually represents a batch in the Pingen UI. */
export type BatchIcon =
  | 'campaign'
  | 'megaphone'
  | 'wave-hand'
  | 'flash'
  | 'rocket'
  | 'bell'
  | 'percent-tag'
  | 'percent-badge'
  | 'present'
  | 'receipt'
  | 'document'
  | 'information'
  | 'calendar'
  | 'newspaper'
  | 'crown'
  | 'virus';

/** Query parameters for the list-batches endpoint. */
export interface ListBatchesParams extends PaginationParams {
  /** Comma-separated list of relationships to include in the response. */
  readonly include?: string;
  /** Sparse fieldset — limit which batch fields are returned. */
  readonly fieldsBatches?: readonly string[];
  /** Sparse fieldset — limit which organisation fields are returned. */
  readonly fieldsOrganisations?: readonly string[];
}

/** Query parameters for the get-batch endpoint. */
export interface GetBatchParams {
  /** Sparse fieldset — limit which batch fields are returned. */
  readonly fieldsBatches?: readonly string[];
}

/**
 * Data required to create a new batch.
 *
 * `file_url` and `file_url_signature` must be obtained from the file upload
 * endpoint before creating a batch.
 */
export interface CreateBatchData {
  /** Human-readable name for the batch. */
  readonly name: string;
  /** Icon displayed in the Pingen UI for this batch. */
  readonly icon: BatchIcon;
  /** Original filename of the uploaded document. */
  readonly file_original_name: string;
  /** Signed URL pointing to the uploaded file, obtained from the file upload endpoint. */
  readonly file_url: string;
  /** HMAC signature that authenticates the `file_url`, obtained from the file upload endpoint. */
  readonly file_url_signature: string;
  /** Position of the address window on the envelope. */
  readonly address_position: AddressPosition;
  /** How letters in the batch are grouped for delivery. */
  readonly grouping_type: 'zip' | 'merge';
  /** Rule used to split the source document into individual letters. */
  readonly grouping_options_split_type: 'file' | 'page' | 'custom' | 'qr_invoice';
  /** Number of pages or items per split chunk (used with `custom` split type). */
  readonly grouping_options_split_size?: number;
  /** String separator used to delimit letters (used with `custom` split type). */
  readonly grouping_options_split_separator?: string;
  /** Whether the separator appears on the first or last page of each letter. */
  readonly grouping_options_split_position?: 'first_page' | 'last_page';
  /** Optional preset ID whose print settings are applied to the batch. */
  readonly preset_id?: string;
}

/** Data for updating a batch's display properties. */
export interface UpdateBatchData {
  /** New human-readable name for the batch. */
  readonly name?: string;
  /** New icon for the batch. */
  readonly icon?: BatchIcon;
}

/**
 * Options for deleting a batch.
 *
 * @warning When `with_letters` is `true`, **all letters belonging to the batch
 * are permanently deleted** along with the batch itself. This cannot be undone.
 */
export interface DeleteBatchData {
  /** When `true`, all letters in the batch are deleted together with the batch. */
  readonly with_letters: boolean;
}

/** Data required to submit a batch for printing and delivery. */
export interface SendBatchData {
  /** Per-country delivery product selections for the letters in this batch. */
  readonly delivery_products: readonly { readonly country: string; readonly delivery_product: DeliveryProduct }[];
  /** Whether letters are printed on one side or both sides. */
  readonly print_mode: PrintMode;
  /** Colour spectrum used when printing. */
  readonly print_spectrum: PrintSpectrum;
}

/** Attributes returned on a batch resource. */
export interface BatchAttributes {
  /** Human-readable name of the batch. */
  readonly name: string;
  /** Icon identifier for the batch. */
  readonly icon: string;
  /** Current processing status of the batch. */
  readonly status: string;
  /** Original filename of the source document. */
  readonly file_original_name: string;
  /** Total number of letters in the batch. */
  readonly letter_count: number;
  /** Address window position used for the letters. */
  readonly address_position: AddressPosition;
  /** Print mode applied to the letters. */
  readonly print_mode: PrintMode;
  /** Colour spectrum applied when printing. */
  readonly print_spectrum: PrintSpectrum;
  /** ISO 4217 currency code for the batch price. */
  readonly price_currency: string;
  /** Total price of the batch in the smallest currency unit. */
  readonly price_value: number;
  /** Whether the batch was created via the app or the API. */
  readonly source: BatchSource;
  /** ISO 8601 timestamp of when the batch was submitted for sending. */
  readonly submitted_at: string;
  /** ISO 8601 timestamp of when the batch was created. */
  readonly created_at: string;
  /** ISO 8601 timestamp of the last update to the batch. */
  readonly updated_at: string;
}

/** A batch resource as returned by the Pingen API. */
export interface Batch {
  /** Unique identifier for the batch. */
  readonly id: string;
  /** JSON:API resource type — always `'batches'`. */
  readonly type: 'batches';
  /** Batch attribute data. */
  readonly attributes: BatchAttributes;
  /** Related resources linked to this batch. */
  readonly relationships: {
    readonly organisation: Relationship;
    readonly events: Relationship;
  };
  /** Links object containing the canonical URL for this batch. */
  readonly links: { readonly self: string };
  /** Optional server-side metadata (e.g. cursor information). */
  readonly meta?: ResourceMeta;
}

/** Attributes of a batch statistics resource. */
export interface BatchStatisticsAttributes {
  /** Number of letters currently being validated. */
  readonly letter_validating: number;
  /** Letter counts grouped by named grouping. */
  readonly letter_groups: readonly { readonly name: string; readonly count: number }[];
  /** Letter counts broken down by destination country. */
  readonly letter_countries: readonly { readonly country: string; readonly count: number }[];
}

/** Batch statistics resource as returned by the Pingen API. */
export interface BatchStatistics {
  /** Unique identifier for the statistics resource. */
  readonly id: string;
  /** JSON:API resource type — always `'batch_statistics'`. */
  readonly type: 'batch_statistics';
  /** Statistical data for the batch. */
  readonly attributes: BatchStatisticsAttributes;
  /** Links object containing the canonical URL for this statistics resource. */
  readonly links: { readonly self: string };
}
