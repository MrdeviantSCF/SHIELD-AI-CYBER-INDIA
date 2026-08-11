import "server-only";
import { prisma } from "@/lib/db";

/**
 * Simple lexical retrieval over the admin-managed knowledge base.
 * This intentionally avoids sending the entire database to the LLM —
 * only a handful of the most relevant knowledge snippets are ever included
 * in the model context (RAG-lite, no case/client/document data included).
 */
export async function retrieveKnowledge(query: string, limit = 4): Promise<string[]> {
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2)
    .slice(0, 8);

  if (terms.length === 0) return [];

  const entries = await prisma.chatKnowledge.findMany({
    where: { isPublished: true },
    take: 200,
  });

  const scored = entries
    .map((entry) => {
      const haystack = `${entry.topic} ${entry.content} ${entry.tags.join(" ")}`.toLowerCase();
      const score = terms.reduce((acc, term) => acc + (haystack.includes(term) ? 1 : 0), 0);
      return { entry, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => `${s.entry.topic}: ${s.entry.content}`);
}
