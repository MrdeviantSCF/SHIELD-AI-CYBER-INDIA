export type PutObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export type StorageAdapter = {
  /** Stores an object privately (never publicly readable). */
  putObject(input: PutObjectInput): Promise<void>;
  /** Retrieves an object's bytes. Used server-side to stream downloads. */
  getObject(key: string): Promise<Buffer>;
  /** Permanently deletes an object. */
  deleteObject(key: string): Promise<void>;
  /**
   * Generates a short-lived signed URL for direct download, OR null if the
   * adapter does not support pre-signing (in which case the caller should
   * stream the object through an authenticated API route instead).
   */
  getSignedDownloadUrl(key: string, expiresInSeconds: number): Promise<string | null>;
};
