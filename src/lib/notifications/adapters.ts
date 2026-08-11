import "server-only";
import { getEnv } from "@/lib/env";

export type NotificationPayload = {
  to: string;
  subject?: string;
  body: string;
};

export type NotificationAdapter = {
  send(payload: NotificationPayload): Promise<{ success: boolean; providerRef?: string }>;
};

/**
 * Mock adapter used automatically whenever a channel's API credentials are
 * not configured. Logs to the server console (never to the client) so
 * behavior is observable in development without any external dependency.
 */
function createMockAdapter(channel: string): NotificationAdapter {
  return {
    async send(payload) {
      // eslint-disable-next-line no-console
      console.log(`[mock:${channel}] -> ${payload.to}: ${payload.subject ?? ""} ${payload.body}`.trim());
      return { success: true, providerRef: `mock-${channel}-${Date.now()}` };
    },
  };
}

/**
 * Email adapter. Wire up a real provider (Resend, SendGrid, Postmark, SES)
 * here using EMAIL_API_KEY once available. Falls back to mock in dev.
 */
export function getEmailAdapter(): NotificationAdapter {
  const env = getEnv();
  if (!env.EMAIL_API_KEY) return createMockAdapter("email");
  return {
    async send(payload) {
      // TODO(production): call the real email provider's HTTP API here,
      // using env.EMAIL_API_KEY and env.EMAIL_FROM. Never log the API key.
      return { success: true, providerRef: `email-${Date.now()}` };
    },
  };
}

/** WhatsApp Business API adapter (falls back to mock without credentials). */
export function getWhatsAppAdapter(): NotificationAdapter {
  const env = getEnv();
  if (!env.WHATSAPP_API_KEY) return createMockAdapter("whatsapp");
  return {
    async send(payload) {
      // TODO(production): integrate WhatsApp Business Cloud API.
      return { success: true, providerRef: `whatsapp-${Date.now()}` };
    },
  };
}

/** SMS adapter (falls back to mock without credentials). */
export function getSmsAdapter(): NotificationAdapter {
  const env = getEnv();
  if (!env.SMS_API_KEY) return createMockAdapter("sms");
  return {
    async send(payload) {
      // TODO(production): integrate an SMS provider (Twilio, MSG91, etc.).
      return { success: true, providerRef: `sms-${Date.now()}` };
    },
  };
}
