import "server-only";
import { getEnv } from "@/lib/env";
import { localStorageAdapter } from "./local-adapter";
import { s3StorageAdapter } from "./s3-adapter";
import type { StorageAdapter } from "./types";

/**
 * Storage adapter factory. Automatically uses S3-compatible storage when
 * S3_BUCKET is configured, otherwise falls back to a local-disk adapter for
 * development. Application code should only ever import `getStorage()` and
 * must never reach into the local/s3 adapters directly.
 */
export function getStorage(): StorageAdapter {
  const env = getEnv();
  if (env.S3_BUCKET && env.S3_ACCESS_KEY && env.S3_SECRET_KEY) {
    return s3StorageAdapter;
  }
  return localStorageAdapter;
}

export * from "./types";
