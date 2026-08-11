import "server-only";
import { prisma } from "@/lib/db";
import { getEmailAdapter, getWhatsAppAdapter, getSmsAdapter } from "./adapters";
import type { NotificationChannel } from "@prisma/client";

export type CreateNotificationInput = {
  userId: string;
  caseId?: string | null;
  title: string;
  body: string;
  channel?: NotificationChannel;
  recipientAddress?: string; // email/phone, only used for non-IN_APP channels
};

/**
 * Creates an in-app notification record and, for external channels,
 * dispatches through the corresponding adapter. Always persists the
 * notification first so the user has an auditable in-app record even if
 * the external channel fails.
 */
export async function createNotification(input: CreateNotificationInput) {
  const channel = input.channel ?? "IN_APP";

  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      caseId: input.caseId ?? null,
      channel,
      title: input.title,
      body: input.body,
      status: channel === "IN_APP" ? "SENT" : "PENDING",
      sentAt: channel === "IN_APP" ? new Date() : null,
    },
  });

  if (channel === "IN_APP") return notification;
  if (!input.recipientAddress) return notification;

  const adapter =
    channel === "EMAIL" ? getEmailAdapter() : channel === "WHATSAPP" ? getWhatsAppAdapter() : getSmsAdapter();

  try {
    const result = await adapter.send({
      to: input.recipientAddress,
      subject: input.title,
      body: input.body,
    });
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: result.success ? "SENT" : "FAILED", sentAt: result.success ? new Date() : null },
    });
  } catch {
    await prisma.notification.update({ where: { id: notification.id }, data: { status: "FAILED" } });
  }

  return notification;
}
