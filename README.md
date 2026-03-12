# pingen-client

<div align="left">

  <a href="">[![npm version](https://img.shields.io/npm/v/pingen-client.svg)](https://www.npmjs.com/package/pingen-client)</a>
  <a href="">[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)</a>
  <a href="">[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)</a>

</div>

A lightweight, fully typed Node.js SDK for the **[Pingen](https://www.pingen.com) REST API**.

> [!CAUTION]
> **Disclaimer:** This is an **unofficial** community-led project. It is not affiliated with, endorsed by, or supported by Pingen. Use this SDK at your own risk in accordance with the official API terms of service.

---

## ✨ Features

* **First-class TypeScript Support:** Full type definitions for all API resources
* **Zero Runtime Dependencies:** Uses native `fetch` and is therefore lightweight.
* **Auth Handling**: Automatic OAuth2 token management with caching
* **Error Handling:** Custom error classes to easily distinguish between network issues and API-specific errors.

## 📦 Installation

```bash
npm install pingen-client
# or
yarn add pingen-client
# or
pnpm add pingen-client
```

## Quick Start

```typescript
import { PingenClient } from 'pingen-sdk';

const client = new PingenClient({
  clientId: process.env.PINGEN_CLIENT_ID!,
  clientSecret: process.env.PINGEN_CLIENT_SECRET!,
});

// List your organisations
const { data: orgs } = await client.organisations.list();
console.log(orgs);
```

## Configuration

```typescript
const client = new PingenClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',

  // Optional: 'production' (default) or 'staging'
  environment: 'production',

  // Optional: request specific scopes (defaults to all scopes on your client)
  scopes: ['letter', 'organisation_read'],
});
```

## API Reference

This SDK follows the [Pingen API 2.0 documentation](https://api.pingen.com/documentation). All endpoints and parameters can be inspected in the official documentation as well.

All methods return typed responses. List methods return `PaginatedResponse<T>` with pagination metadata, single-resource methods return `SingleResponse<T>`. All `listAll` methods return an `AsyncGenerator<T>` that handles pagination automatically.

### Organisations (`client.organisations`)

| Method | Description |
|--------|-------------|
| `list(params?)` | List organisations |
| `listAll(params?)` | Auto-paginate through all organisations |
| `get(organisationId, params?)` | Get a single organisation |

### Letters (`client.letters`)

| Method | Description |
|--------|-------------|
| `list(organisationId, params?)` | List letters |
| `listAll(organisationId, params?)` | Auto-paginate through all letters |
| `get(organisationId, letterId, params?)` | Get a single letter |
| `create(organisationId, data)` | Create a new letter |
| `update(organisationId, letterId, data)` | Update a letter |
| `delete(organisationId, letterId)` | Delete a letter |
| `send(organisationId, letterId, data)` | Submit a letter for sending |
| `cancel(organisationId, letterId)` | Cancel a submitted letter |
| `getFile(organisationId, letterId)` | Get a presigned download URL |
| `calculatePrice(organisationId, data)` | Calculate the price for a letter |

### Batches (`client.batches`)

| Method | Description |
|--------|-------------|
| `list(organisationId, params?)` | List batches |
| `listAll(organisationId, params?)` | Auto-paginate through all batches |
| `get(organisationId, batchId, params?)` | Get a single batch |
| `create(organisationId, data)` | Create a new batch |
| `update(organisationId, batchId, data)` | Update batch name/icon |
| `delete(organisationId, batchId, data?)` | Delete a batch (optionally with its letters) |
| `send(organisationId, batchId, data)` | Submit a batch for sending |
| `cancel(organisationId, batchId)` | Cancel a submitted batch |
| `getStatistics(organisationId, batchId, params?)` | Get batch statistics |

### Letter Events (`client.letterEvents`)

| Method | Description |
|--------|-------------|
| `list(organisationId, letterId, params?)` | List events for a letter |
| `listAll(organisationId, letterId, params?)` | Auto-paginate through all events |
| `getImage(organisationId, letterId, eventId)` | Get a presigned image URL for an event |
| `listIssues(organisationId, params?)` | List issue events across all letters |
| `listUndeliverable(organisationId, params?)` | List undeliverable events |
| `listSent(organisationId, params?)` | List sent events |
| `listDelivered(organisationId, params?)` | List delivered events |

### Batch Events (`client.batchEvents`)

| Method | Description |
|--------|-------------|
| `list(organisationId, batchId, params?)` | List events for a batch |
| `listAll(organisationId, batchId, params?)` | Auto-paginate through all events |

### Webhooks (`client.webhooks`)

| Method | Description |
|--------|-------------|
| `list(organisationId, params?)` | List webhooks |
| `listAll(organisationId, params?)` | Auto-paginate through all webhooks |
| `create(organisationId, data)` | Create a webhook |
| `get(organisationId, webhookId)` | Get a single webhook |
| `delete(organisationId, webhookId)` | Delete a webhook |

### File Uploads (`client.fileUploads`)

| Method | Description |
|--------|-------------|
| `getDetails(params?)` | Get a presigned upload URL and signature |

### User (`client.user`)

| Method | Description |
|--------|-------------|
| `get(params?)` | Get the authenticated user |
| `listAssociations(params?)` | List organisation associations |
| `listAllAssociations(params?)` | Auto-paginate through all associations |

### Webhook Verification

```typescript
import { verifyWebhookSignature } from 'pingen-client';

const isValid = verifyWebhookSignature(payload, signature, signingKey);
```

### Error Handling

All API errors extend `PingenError` and include `status`, `body`, and `requestId` properties.

```typescript
import { PingenNotFoundError, PingenValidationError } from 'pingen-client';

try {
  await client.letters.get(orgId, letterId);
} catch (error) {
  if (error instanceof PingenNotFoundError) {
    // 404 - resource not found
  } else if (error instanceof PingenValidationError) {
    // 422 - validation failed
  }
}
```

Notable error classes: `PingenUnauthorizedError` (401), `PingenForbiddenError` (403), `PingenNotFoundError` (404), `PingenValidationError` (422), `PingenRateLimitError` (429), `PingenServerError` (500).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
1. Fork the repository.
2. Create your feature branch (git checkout -b feature/amazing-feature).
3. Commit your changes (git commit -m 'Add some amazing feature').
4. Push to the branch (git push origin feature/amazing-feature).
5. Open a Pull Request.

Please ensure your code passes the existing linter and test suites.


## 📄 License
This project is licensed under the MIT License. See the LICENSE file for details.

---

Maintained by [Karl Grossmann](www.github.com/karlgrossmann). If you find this SDK useful, please consider giving it a ⭐ on GitHub!
