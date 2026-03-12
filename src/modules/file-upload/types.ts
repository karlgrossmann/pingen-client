/** Parameters for retrieving file upload details. */
export interface GetFileUploadParams {
  /** Sparse fieldset limiting which `file_uploads` attributes are returned. */
  readonly fields?: readonly string[];
}

/** Attributes of a presigned file upload resource. */
export interface FileUploadAttributes {
  /**
   * Presigned URL to which the file must be uploaded via an HTTP PUT request.
   * The URL is short-lived and expires at the time indicated by `expires_at`.
   */
  readonly url: string;
  /**
   * Signature token that must be passed as `file_url_signature` when creating
   * a letter or batch referencing this upload.
   */
  readonly url_signature: string;
  /** ISO 8601 timestamp at which the presigned URL expires. */
  readonly expires_at: string;
}

/** A presigned file upload resource returned by the API. */
export interface FileUpload {
  /** Unique identifier of the file upload resource. */
  readonly id: string;
  /** JSON:API resource type. */
  readonly type: string;
  /** File upload attributes including the presigned URL and signature. */
  readonly attributes: FileUploadAttributes;
  /** Resource links. */
  readonly links: { readonly self: string };
}
