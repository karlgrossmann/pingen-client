import type { PaginationParams, Relationship, ResourceMeta } from '../../common/types.js';

/**
 * Lifecycle status of a user account.
 *
 * - `'active'` — fully verified and active account
 * - `'registered'` — registered but not yet verified
 * - `'invited'` — invited by an organisation, awaiting acceptance
 * - `'pending_deletion'` — deletion has been requested
 * - `'unconfirmed'` — email confirmation pending
 * - `'unconfirmed_expired'` — confirmation link has expired
 */
export type UserStatus =
  | 'active'
  | 'registered'
  | 'invited'
  | 'pending_deletion'
  | 'unconfirmed'
  | 'unconfirmed_expired';

/**
 * BCP-47 language tag representing the user's preferred interface language.
 *
 * Supported locales: `'en-GB'`, `'de-DE'`, `'de-CH'`, `'nl-NL'`, `'fr-FR'`, `'es-ES'`.
 */
export type UserLanguage = 'en-GB' | 'de-DE' | 'de-CH' | 'nl-NL' | 'fr-FR' | 'es-ES';

/** Parameters for retrieving the authenticated user's profile. */
export interface GetUserParams {
  /** Sparse fieldset limiting which `users` attributes are returned. */
  readonly fields?: readonly string[];
}

/** Parameters for listing the authenticated user's organisation associations. */
export interface ListAssociationsParams extends PaginationParams {
  /** Comma-separated list of relationships to include in the response. */
  readonly include?: string;
  /** Sparse fieldset for the `associations` resource type. */
  readonly fieldsAssociations?: readonly string[];
  /** Sparse fieldset for the `organisations` resource type. */
  readonly fieldsOrganisations?: readonly string[];
}

/**
 * Role of a user within an organisation.
 *
 * - `'owner'` — full administrative access
 * - `'manager'` — management-level access
 */
export type AssociationRole = 'owner' | 'manager';

/**
 * Status of a user's membership in an organisation.
 *
 * - `'pending'` — invitation not yet accepted
 * - `'active'` — membership is active
 * - `'blocked'` — membership has been suspended
 */
export type AssociationStatus = 'pending' | 'active' | 'blocked';

/** Attributes of the authenticated user's profile. */
export interface UserAttributes {
  /** Primary email address of the user. */
  readonly email: string;
  /** First name of the user. */
  readonly first_name: string;
  /** Last name of the user. */
  readonly last_name: string;
  /** Current account status. */
  readonly status: UserStatus;
  /** Preferred interface language. */
  readonly language: UserLanguage;
  /** Product edition the user has access to. */
  readonly edition: string;
  /** Feature flags active for this user. */
  readonly flags: readonly string[];
  /** ISO 8601 timestamp at which the account was created. */
  readonly created_at: string;
  /** ISO 8601 timestamp at which the account was last updated. */
  readonly updated_at: string;
}

/** The authenticated user resource. */
export interface User {
  /** Unique identifier of the user. */
  readonly id: string;
  /** JSON:API resource type, always `'users'`. */
  readonly type: 'users';
  /** User profile attributes. */
  readonly attributes: UserAttributes;
  /** Related resources. */
  readonly relationships: {
    readonly associations: Relationship;
    readonly notifications: Relationship;
  };
  /** Resource links. */
  readonly links: { readonly self: string };
  /** Optional resource-level metadata. */
  readonly meta?: ResourceMeta;
}

/** Attributes of a user–organisation association. */
export interface AssociationAttributes {
  /** Role the user holds within the organisation. */
  readonly role: AssociationRole;
  /** Current status of the association. */
  readonly status: AssociationStatus;
  /** ISO 8601 timestamp at which the association was created. */
  readonly created_at: string;
  /** ISO 8601 timestamp at which the association was last updated. */
  readonly updated_at: string;
}

/** A resource linking the authenticated user to an organisation. */
export interface Association {
  /** Unique identifier of the association. */
  readonly id: string;
  /** JSON:API resource type, always `'associations'`. */
  readonly type: 'associations';
  /** Association attributes. */
  readonly attributes: AssociationAttributes;
  /** Related resources. */
  readonly relationships: { readonly organisation: Relationship };
  /** Resource links. */
  readonly links: { readonly self: string };
  /** Resource-level metadata. */
  readonly meta: ResourceMeta;
}
