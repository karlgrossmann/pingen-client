import type { PaginationParams, Relationship } from '../../common/types.js';

/** Parameters for listing events belonging to a single letter. */
export interface ListLetterEventsParams extends PaginationParams {
  /** BCP-47 language tag used to localise event names (e.g. `'de-CH'`). */
  readonly language?: string;
  /** Comma-separated list of relationships to include in the response. */
  readonly include?: string;
  /** Sparse fieldset for the `letters_events` resource type. */
  readonly fieldsLettersEvents?: readonly string[];
  /** Sparse fieldset for the `letters` resource type. */
  readonly fieldsLetters?: readonly string[];
}

/** Parameters for collection-level letter event endpoints. Sorting is not supported on these endpoints. */
export interface ListLetterEventsCollectionParams extends Omit<PaginationParams, 'sort'> {
  /** BCP-47 language tag used to localise event names (e.g. `'de-CH'`). */
  readonly language?: string;
  /** Comma-separated list of relationships to include in the response. */
  readonly include?: string;
  /** Sparse fieldset for the `letters_events` resource type. */
  readonly fieldsLettersEvents?: readonly string[];
  /** Sparse fieldset for the `letters` resource type. */
  readonly fieldsLetters?: readonly string[];
}

/** Attributes of a letter lifecycle event. */
export interface LetterEventAttributes {
  /** Machine-readable event code identifying the event type. */
  readonly code: string;
  /** Human-readable event name, optionally localised via the `language` parameter. */
  readonly name: string;
  /** Name of the system or carrier that produced the event. */
  readonly producer: string;
  /** Physical or logical location where the event occurred. */
  readonly location: string;
  /** Whether a tracking image is available for this event. */
  readonly has_image: boolean;
  /** Additional data associated with the event. */
  readonly data: readonly string[];
  /** ISO 8601 timestamp at which the event was emitted by the carrier. */
  readonly emitted_at: string;
  /** ISO 8601 timestamp at which the event was created in the system. */
  readonly created_at: string;
  /** ISO 8601 timestamp at which the event was last updated. */
  readonly updated_at: string;
}

/** A single letter lifecycle event resource. */
export interface LetterEvent {
  /** Unique identifier of the event. */
  readonly id: string;
  /** JSON:API resource type, always `'letter_events'`. */
  readonly type: 'letter_events';
  /** Event attributes. */
  readonly attributes: LetterEventAttributes;
  /** Related resources. */
  readonly relationships: { readonly letter: Relationship };
  /** Resource links. */
  readonly links: { readonly self: string };
}
