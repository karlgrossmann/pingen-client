import type { PaginationParams, Relationship } from '../../common/types.js';

/** Query parameters for the list-batch-events endpoint. */
export interface ListBatchEventsParams extends PaginationParams {
  /** BCP 47 language tag used to localise event name and description fields. */
  readonly language?: string;
  /** Comma-separated list of relationships to include in the response. */
  readonly include?: string;
  /** Sparse fieldset — limit which batch-event fields are returned. */
  readonly fieldsBatchesEvents?: readonly string[];
  /** Sparse fieldset — limit which batch fields are returned. */
  readonly fieldsBatches?: readonly string[];
}

/** Attributes returned on a batch event resource. */
export interface BatchEventAttributes {
  /** Machine-readable event code identifying the type of lifecycle event. */
  readonly code: string;
  /** Human-readable name of the event, localised when a language is requested. */
  readonly name: string;
  /** System component or service that emitted the event. */
  readonly producer: string;
  /** Geographic or logical location associated with the event. */
  readonly location: string;
  /** Additional data payload attached to the event. */
  readonly data: readonly string[];
  /** ISO 8601 timestamp of when the event was emitted by the producer. */
  readonly emitted_at: string;
  /** ISO 8601 timestamp of when the event record was created. */
  readonly created_at: string;
  /** ISO 8601 timestamp of the last update to the event record. */
  readonly updated_at: string;
}

/** A batch event resource as returned by the Pingen API. */
export interface BatchEvent {
  /** Unique identifier for the batch event. */
  readonly id: string;
  /** JSON:API resource type — always `'batch_events'`. */
  readonly type: 'batch_events';
  /** Event attribute data. */
  readonly attributes: BatchEventAttributes;
  /** Related resources linked to this event. */
  readonly relationships: { readonly batch: Relationship };
  /** Links object containing the canonical URL for this event. */
  readonly links: { readonly self: string };
}
