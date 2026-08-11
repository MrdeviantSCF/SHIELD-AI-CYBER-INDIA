import "server-only";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "@/lib/env";
import type { StorageAdapter } from "./types";

/**
 * S3-compatible private object storage adapter (works with AWS S3,
 * Cloudflare R2, MinIO, DigitalOcean Spaces, Backblaze B2, etc.).
 *
 * The bucket MUST be configured as private. This adapter never makes an
 * object public — all reads happen either via short-lived signed URLs or
 * server-side streamed downloads through an authenticated API route.
 */
function getClient() {
  const env = getEnv();
  return new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_FORCE_PATH_STYLE === "true",
    credentials:
      env.S3_ACCESS_KEY && env.S3_SECRET_KEY
        ? { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY }
        : undefined,
  });
}

export const s3StorageAdapter: StorageAdapter = {
  async putObject({ key, body, contentType }) {
    const env = getEnv();
    const client = getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        ServerSideEncryption: "AES256",
      })
    );
  },

  async getObject(key) {
    const env = getEnv();
    const client = getClient();
    const result = await client.send(new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
    const stream = result.Body as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk as Uint8Array));
    }
    return Buffer.concat(chunks);
  },

  async deleteObject(key) {
    const env = getEnv();
    const client = getClient();
    await client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
  },

  async getSignedDownloadUrl(key, expiresInSeconds) {
    const env = getEnv();
    const client = getClient();
    const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key });
    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  },
};
