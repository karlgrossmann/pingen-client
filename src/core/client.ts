import { BatchEvents } from '../modules/batch-events/batch-events.js';
import { Batches } from '../modules/batches/batches.js';
import { FileUploads } from '../modules/file-upload/file-upload.js';
import { LetterEvents } from '../modules/letter-events/letter-events.js';
import { Letters } from '../modules/letters/letters.js';
import { Organisations } from '../modules/organisations/organisations.js';
import { Users } from '../modules/user/user.js';
import { Webhooks } from '../modules/webhooks/webhooks.js';
import { TokenManager } from './auth.js';
import { HttpClient } from './http-client.js';
import { ENDPOINTS, type PingenClientConfig } from './types.js';

/**
 * Main entry point for the Pingen SDK. Instantiate this class once and reuse
 * it across your application — it manages OAuth token acquisition and renewal
 * automatically.
 *
 * @example
 * ```typescript
 * import { PingenClient } from '@pingen/sdk';
 *
 * const client = new PingenClient({
 *   clientId: process.env.PINGEN_CLIENT_ID!,
 *   clientSecret: process.env.PINGEN_CLIENT_SECRET!,
 *   environment: 'production',
 * });
 *
 * // Fetch all organisations accessible to the credentials
 * const organisations = await client.organisations.list();
 *
 * // Send a letter within an organisation
 * const letter = await client.letters.create(organisations.data[0].id, {
 *   address: { name: 'Jane Doe', street: 'Example Street 1', zip: '8000', city: 'Zurich', country: 'CH' },
 * });
 * ```
 */
export class PingenClient {
  private readonly http: HttpClient;

  /** Access to the Organisations API module. */
  readonly organisations: Organisations;

  /** Access to the Letters API module. */
  readonly letters: Letters;

  /** Access to the Batches API module. */
  readonly batches: Batches;

  /** Access to the Letter Events API module. */
  readonly letterEvents: LetterEvents;

  /** Access to the Batch Events API module. */
  readonly batchEvents: BatchEvents;

  /** Access to the Webhooks API module. */
  readonly webhooks: Webhooks;

  /** Access to the File Uploads API module. */
  readonly fileUploads: FileUploads;

  /** Access to the User API module. */
  readonly user: Users;

  /**
   * Creates a new {@link PingenClient} instance.
   *
   * @param config - Client configuration. See {@link PingenClientConfig} for
   *   all available options and their defaults.
   * @throws {Error} When `config.clientId` is missing or empty.
   * @throws {Error} When `config.clientSecret` is missing or empty.
   */
  constructor(config: PingenClientConfig) {
    if (!config.clientId) {
      throw new Error('clientId is required');
    }
    if (!config.clientSecret) {
      throw new Error('clientSecret is required');
    }

    const environment = config.environment ?? 'production';
    const urls = ENDPOINTS[environment];

    const tokenManager = new TokenManager(config.clientId, config.clientSecret, environment, config.scopes);
    this.http = new HttpClient(tokenManager, urls.api, {
      timeout: config.timeout,
      maxRetries: config.maxRetries,
      retryDelay: config.retryDelay,
    });
    this.organisations = new Organisations(this.http);
    this.letters = new Letters(this.http);
    this.batches = new Batches(this.http);
    this.letterEvents = new LetterEvents(this.http);
    this.batchEvents = new BatchEvents(this.http);
    this.webhooks = new Webhooks(this.http);
    this.fileUploads = new FileUploads(this.http);
    this.user = new Users(this.http);
  }
}
