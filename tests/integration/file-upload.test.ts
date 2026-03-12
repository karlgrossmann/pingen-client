import { describe, expect, it } from 'vitest';
import { createTestClient } from './setup.js';

describe('FileUpload (integration)', () => {
  it('gets upload details with pre-signed URL', async () => {
    const client = createTestClient();

    const result = await client.fileUploads.getDetails();

    expect(result.data).toBeDefined();
    expect(result.data.id).toBeDefined();
    expect(result.data.attributes.url).toBeDefined();
    expect(result.data.attributes.url_signature).toBeDefined();
    expect(result.data.attributes.expires_at).toBeDefined();
  });
});
