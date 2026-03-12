export {
  PingenClient,
  PingenError,
  PingenBadRequestError,
  PingenUnauthorizedError,
  PingenForbiddenError,
  PingenNotFoundError,
  PingenMethodNotAllowedError,
  PingenNotAcceptableError,
  PingenConflictError,
  PingenGoneError,
  PingenUnsupportedMediaError,
  PingenValidationError,
  PingenDependencyError,
  PingenRateLimitError,
  PingenServerError,
  PingenServiceUnavailableError,
  PingenTimeoutError,
  createPingenError,
  type PingenClientConfig,
  type PingenScope,
  type RequestOptions,
} from './core/index.js';
export { paginate } from './common/pagination.js';
export {
  computeWebhookSignature,
  verifyWebhookSignature,
  WEBHOOK_SIGNATURE_HEADER,
} from './webhooks/verify.js';

// Common types
export type {
  IncludedResource,
  PaginatedResponse,
  PaginationParams,
  SingleResponse,
} from './common/types.js';

// Module types
export type {
  Organisation,
  OrganisationAttributes,
  ListOrganisationsParams,
  GetOrganisationParams,
} from './modules/organisations/types.js';

export type {
  Letter,
  LetterAttributes,
  LetterFont,
  ListLettersParams,
  GetLetterParams,
  CreateLetterData,
  UpdateLetterData,
  SendLetterData,
  CalculatePriceData,
  PriceResult,
  PriceResultAttributes,
  DeliveryProduct,
  PrintMode,
  PrintSpectrum,
  PaperType,
  LetterSource,
  AddressPosition,
} from './modules/letters/types.js';

export type {
  Batch,
  BatchAttributes,
  BatchStatistics,
  BatchStatisticsAttributes,
  BatchIcon,
  BatchSource,
  ListBatchesParams,
  GetBatchParams,
  CreateBatchData,
  UpdateBatchData,
  DeleteBatchData,
  SendBatchData,
} from './modules/batches/types.js';

export type {
  LetterEvent,
  LetterEventAttributes,
  ListLetterEventsParams,
} from './modules/letter-events/types.js';

export type {
  BatchEvent,
  BatchEventAttributes,
  ListBatchEventsParams,
} from './modules/batch-events/types.js';

export type {
  Webhook,
  WebhookAttributes,
  WebhookEventCategory,
  ListWebhooksParams,
  CreateWebhookData,
} from './modules/webhooks/types.js';

export type {
  FileUpload,
  FileUploadAttributes,
  GetFileUploadParams,
} from './modules/file-upload/types.js';

export type {
  User,
  UserAttributes,
  UserStatus,
  UserLanguage,
  GetUserParams,
  Association,
  AssociationAttributes,
  AssociationRole,
  AssociationStatus,
  ListAssociationsParams,
} from './modules/user/types.js';
