import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { warnOnceAboutMissingDatabase } from "@/lib/db-availability";

/**
 * Public-facing projection of a service entry.
 *
 * Only the fields the public site actually renders are selected. This keeps the
 * query minimal (CLAUDE.md §30 — do not over-fetch) and lets the static
 * fallback below be structurally identical to a database row.
 */
export type PublicServiceSummary = {
  slug: string;
  name: string;
  summary: string;
};

/**
 * Static fallback used only when the database is unavailable.
 *
 * These entries are copied verbatim from the seed data in `prisma/seed.ts`, so
 * the fallback never states anything the platform would not otherwise publish.
 * No certifications, statistics, client names or case results are implied.
 *
 * Admin-managed database rows always take precedence when reachable — this is
 * a rendering safety net, not a source of truth.
 */
const FALLBACK_SERVICES: readonly PublicServiceSummary[] = [
  {
    slug: "cyber-crime-investigation",
    name: "Cyber Crime Investigation",
    summary: "Structured, evidence-driven investigation of cyber crime incidents.",
  },
  {
    slug: "digital-forensics",
    name: "Digital Forensics",
    summary: "Forensic examination of digital devices and media using defensible methodology.",
  },
  {
    slug: "digital-intelligence",
    name: "Digital Intelligence",
    summary: "Intelligence-driven correlation of digital data points to support investigations.",
  },
  {
    slug: "cyber-fraud-investigation",
    name: "Cyber Fraud Investigation",
    summary: "Investigation support for digital and financial fraud matters.",
  },
  {
    slug: "mobile-forensics",
    name: "Mobile Forensics",
    summary: "Forensic examination of mobile devices under proper authorization.",
  },
  {
    slug: "computer-endpoint-forensics",
    name: "Computer / Endpoint Forensics",
    summary: "Examination of laptops, desktops and endpoints for digital evidence.",
  },
];

/**
 * Returns published services for the public site, ordered as configured by an
 * administrator. Falls back to the static list above when the database is not
 * configured or unreachable, so the public homepage always renders.
 */
export async function getPublishedServices(limit = 6): Promise<PublicServiceSummary[]> {
  if (!isDatabaseConfigured()) {
    warnOnceAboutMissingDatabase("services");
    return FALLBACK_SERVICES.slice(0, limit).map((service) => ({ ...service }));
  }

  try {
    const services = await prisma.serviceEntry.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
      take: limit,
      select: { slug: true, name: true, summary: true },
    });

    // An empty table (migrated but not yet seeded) should still render content
    // rather than an empty section.
    if (services.length === 0) {
      return FALLBACK_SERVICES.slice(0, limit).map((service) => ({ ...service }));
    }
    return services;
  } catch (err) {
    warnOnceAboutMissingDatabase("services", err);
    return FALLBACK_SERVICES.slice(0, limit).map((service) => ({ ...service }));
  }
}
