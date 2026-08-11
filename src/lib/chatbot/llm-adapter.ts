import "server-only";
import { getEnv } from "@/lib/env";

export type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

export type LlmAdapter = {
  complete(turns: ChatTurn[]): Promise<string>;
};

/**
 * Deterministic mock LLM used when no LLM_API_KEY is configured. It performs
 * simple keyword-based retrieval against the system prompt content so the
 * chatbot remains fully functional (and safe) without any external
 * dependency or cost during development/evaluation.
 */
function createMockAdapter(): LlmAdapter {
  return {
    async complete(turns) {
      const lastUser = [...turns].reverse().find((t) => t.role === "user")?.content ?? "";
      const system = turns.find((t) => t.role === "system")?.content ?? "";
      return mockAnswer(lastUser, system);
    },
  };
}

function mockAnswer(question: string, knowledgeContext: string): string {
  const q = question.toLowerCase();

  if (/case.*verif|verify.*case/.test(q)) {
    return "To verify a case, open the Case Verification page and enter your Case ID (e.g. SCF/2026/CF/001) together with the verification code that was shared with you. I can't look up or confirm case details directly in chat — please use the secure verification form so nothing is exposed outside an authenticated check.";
  }
  if (/portal|login|dashboard/.test(q)) {
    return "Authorized clients can sign in from the Client Portal to view their case status, timeline, documents and notifications. If you don't have portal access yet, please use the Contact page and our team will assist.";
  }
  if (/upload|document/.test(q)) {
    return "Once you're signed in to the Client Portal, go to Documents to securely upload files related to your case. Files are validated, hashed and stored privately — only you and your assigned investigator can access them.";
  }
  if (/contact|phone|email|address/.test(q)) {
    return "You can reach Shield Cyber Forensic Investigation via the Contact page, where you can submit an enquiry with your details and service of interest. Official contact details are published there once configured by our team.";
  }
  if (/service|offer|forensic|investigat/.test(q)) {
    return "Shield offers a range of digital forensics and cyber investigation services, including cyber crime investigation, mobile & computer forensics, OSINT, financial/transaction analysis and more. Visit the Services page for full details on each.";
  }

  const snippet = knowledgeContext.slice(0, 400);
  return (
    "I can help you understand Shield's services, navigate the website, and guide you through case verification or the client portal. " +
    (snippet ? `Here is some relevant information: ${snippet}` : "Could you tell me a bit more about what you're looking for?")
  );
}

/**
 * OpenAI-compatible adapter. Works with OpenAI directly or any
 * OpenAI-compatible gateway by setting LLM_BASE_URL.
 */
function createOpenAiAdapter(): LlmAdapter {
  const env = getEnv();
  return {
    async complete(turns) {
      const baseUrl = env.LLM_BASE_URL || "https://api.openai.com/v1";
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.LLM_MODEL,
          messages: turns,
          temperature: 0.3,
          max_tokens: 500,
        }),
      });
      if (!res.ok) {
        throw new Error(`LLM provider error: ${res.status}`);
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "";
    },
  };
}

/**
 * Provider abstraction factory. Selecting a different provider later only
 * requires adding a new adapter here and updating LLM_PROVIDER — no
 * call-site changes anywhere else in the app.
 */
export function getLlmAdapter(): LlmAdapter {
  const env = getEnv();
  if (env.LLM_PROVIDER === "openai" && env.LLM_API_KEY) {
    return createOpenAiAdapter();
  }
  return createMockAdapter();
}
