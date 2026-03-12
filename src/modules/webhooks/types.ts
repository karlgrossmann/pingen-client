import type { PaginationParams, Relationship } from '../../common/types.js';

/**
 * Event category that a webhook subscription listens to.
 *
 * - `'issues'` — letter delivery issues
 * - `'sent'` — letters dispatched to the postal carrier
 * - `'undeliverable'` — letters that could not be delivered
 * - `'delivered'` — successfully delivered letters
 * - `'channel_subscriptions'` — channel subscription lifecycle events
 */
export type WebhookEventCategory =
  | 'issues'
  | 'sent'
  | 'undeliverable'
  | 'delivered'
  | 'channel_subscriptions';

/** Parameters for listing webhooks within an organisation. Sorting is not supported. */
export interface ListWebhooksParams extends Omit<PaginationParams, 'sort'> {
  /** Comma-separated list of relationships to include in the response. */
  readonly include?: string;
  /** Sparse fieldset for the `webhooks` resource type. */
  readonly fieldsWebhooks?: readonly string[];
  /** Sparse fieldset for the `organisations` resource type. */
  readonly fieldsOrganisations?: readonly string[];
}

/** Data required to register a new webhook subscription. */
export interface CreateWebhookData {
  /** The event category this webhook should receive notifications for. */
  readonly event_category: WebhookEventCategory;
  /** The HTTPS endpoint that will receive webhook POST requests. */
  readonly url: string;
  /** Secret key used to sign webhook payloads for authenticity verification. */
  readonly signing_key: string;
}

/** Attributes of a webhook subscription resource. */
export interface WebhookAttributes {
  /** The event category this webhook is subscribed to. */
  readonly event_category: WebhookEventCategory;
  /** The HTTPS endpoint that receives webhook POST requests. */
  readonly url: string;
  /** Secret key used to sign webhook payloads for authenticity verification. */
  readonly signing_key: string;
}

/** A webhook subscription resource. */
export interface Webhook {
  /** Unique identifier of the webhook. */
  readonly id: string;
  /** JSON:API resource type, always `'webhooks'`. */
  readonly type: 'webhooks';
  /** Webhook attributes. */
  readonly attributes: WebhookAttributes;
  /** Related resources. */
  readonly relationships: { readonly organisation: Relationship };
  /** Resource links. */
  readonly links: { readonly self: string };
}
