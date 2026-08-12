/**
 * Centralized, validated environment configuration.
 *
 * IMPORTANT: Only variables explicitly read here are ever exposed to server
 * code. Nothing here is prefixed with NEXT_PUBLIC_, so none of it reaches
 * the browser bundle. Never import this file from client components.
 */
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Optional at the schema level so the application can boot — and the public
  // site can render from server-side fallbacks — before a database has been
  // provisioned. Making this required caused `getEnv()` to throw, which took
  // down every consumer (sessions, CSRF, storage, chatbot) and not just the
  // pages that query the database.
  //
  // This is NOT a relaxation of the production requirement: database-backed
  // code paths are gated behind `isDatabaseConfigured()` and Prisma still
  // reads this same variable via schema.prisma, so a real deployment must
  // still supply it. See .env.example.
  DATABASE_URL: z.string().min(1).optional(),

  // Session / auth secrets
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters").default("dev-insecure-auth-secret-change-me-please"),
  SESSION_COOKIE_NAME: z.string().default("shield_session"),

  // Object storage (S3-compatible). When not configured, a local-disk
  // development adapter is used automatically (see lib/storage).
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.string().optional(),

  // LLM provider abstraction for Shield Assistant
  LLM_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().default("gpt-4o-mini"),
  LLM_BASE_URL: z.string().optional(),

  // Notification adapters (all optional -> fall back to mock/log adapters)
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  WHATSAPP_API_KEY: z.string().optional(),
  WHATSAPP_FROM_NUMBER: z.string().optional(),
  SMS_API_KEY: z.string().optional(),
  SMS_FROM_NUMBER: z.string().optional(),

  APP_BASE_URL: z.string().default("http://localhost:3000"),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration. Check .env against .env.example.");
  }
  cached = parsed.data;
  return cached;
}

export const isProduction = () => getEnv().NODE_ENV === "production";
