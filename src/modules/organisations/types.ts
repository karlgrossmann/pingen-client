import type { PaginationParams, Relationship, ResourceMeta } from '../../common/types.js';

/** Parameters for listing organisations. */
export interface ListOrganisationsParams extends PaginationParams {
  /** Sparse fieldset — limit which fields are returned for organisations. */
  readonly fields?: readonly string[];
}

/** Parameters for retrieving a single organisation. */
export interface GetOrganisationParams {
  /** Sparse fieldset — limit which fields are returned for the organisation. */
  readonly fields?: readonly string[];
}

/** Lifecycle status of an organisation. */
export type OrganisationStatus = 'active' | 'termination_confirmed' | 'pending_deletion';

/** Billing mode controlling when the organisation is charged. */
export type BillingMode = 'prepaid' | 'postpaid';

/** Currency used for billing the organisation. */
export type BillingCurrency = 'CHF' | 'EUR' | 'USD' | 'GBP';

/** Horizontal position of the address window on letters. */
export type AddressPosition = 'left' | 'right';

/** Retention period in months for address data. */
export type DataRetentionAddresses = 6 | 12 | 18;

/** Retention period in months for PDF documents. */
export type DataRetentionPdf = 1 | 3 | 6 | 12;

/** Brand colour assigned to the organisation in the Pingen UI. */
export type OrganisationColor =
  | '#0758FF'
  | '#8B27F0'
  | '#4BC0C4'
  | '#83C795'
  | '#F1B950'
  | '#F28D52'
  | '#ED6A93'
  | '#BA27F0'
  | '#D1B952';

/** Attributes of an organisation resource. */
export interface OrganisationAttributes {
  /** Display name of the organisation. */
  readonly name: string;
  /** Current lifecycle status. */
  readonly status: OrganisationStatus;
  /** Subscription plan. */
  readonly plan: 'free';
  /** How the organisation is billed. */
  readonly billing_mode: BillingMode;
  /** Currency used for billing. */
  readonly billing_currency: BillingCurrency;
  /** Current credit balance for prepaid billing. */
  readonly billing_balance: number;
  /** Outstanding credits needed before sending is re-enabled. */
  readonly missing_credits: number;
  /** Product edition identifier. */
  readonly edition: string;
  /** ISO 3166-1 alpha-2 default country code for letters. */
  readonly default_country: string;
  /** Default address window position for new letters. */
  readonly default_address_position: AddressPosition;
  /** Retention period in months for recipient/sender address data. */
  readonly data_retention_addresses: DataRetentionAddresses;
  /** Retention period in months for letter PDF files. */
  readonly data_retention_pdf: DataRetentionPdf;
  /** Maximum number of letters that may be sent per calendar month. */
  readonly limits_monthly_letters_count: number;
  /** Brand colour displayed in the Pingen UI. */
  readonly color: OrganisationColor;
  /** Feature flags currently active for this organisation. */
  readonly flags: readonly string[];
  /** ISO 8601 timestamp of when the organisation was created. */
  readonly created_at: string;
  /** ISO 8601 timestamp of the most recent update. */
  readonly updated_at: string;
}

/**
 * A Pingen organisation resource in JSON:API format.
 *
 * Organisations are the top-level billing and configuration unit. Every letter,
 * batch, and webhook belongs to exactly one organisation.
 */
export interface Organisation {
  /** Unique identifier of the organisation. */
  readonly id: string;
  /** JSON:API resource type — always `"organisations"`. */
  readonly type: 'organisations';
  /** Detailed attributes of the organisation. */
  readonly attributes: OrganisationAttributes;
  /** Related resources linked to this organisation. */
  readonly relationships: { readonly associations: Relationship };
  /** Links related to this resource. */
  readonly links: { readonly self: string };
  /** Optional server-provided metadata. */
  readonly meta?: ResourceMeta;
}
