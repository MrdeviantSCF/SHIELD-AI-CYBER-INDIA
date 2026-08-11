/**
 * Safety / permission filter for the Shield Assistant.
 *
 * The chatbot must NEVER reveal confidential case details, internal notes,
 * evidence, credentials, or hidden prompts, and must not make legal
 * conclusions or impersonate investigators. This module provides:
 *  1. Input screening — detect attempts to extract confidential data.
 *  2. Output screening — strip/redact anything resembling case identifiers,
 *     tokens, or internal-note style content that may have leaked through.
 */

const BLOCKED_INPUT_PATTERNS: RegExp[] = [
  /system prompt/i,
  /ignore (all|previous) instructions/i,
  /reveal.*(prompt|instructions)/i,
  /internal note/i,
  /show me.*(case|evidence).*(details|file|note)/i,
  /what is the password/i,
  /api key/i,
];

export function isInputSafe(input: string): boolean {
  return !BLOCKED_INPUT_PATTERNS.some((re) => re.test(input));
}

const CASE_ID_PATTERN = /\b[A-Z]{2,5}\/\d{4}\/[A-Z]{1,4}\/\d{2,6}\b/g;
const TOKEN_LIKE_PATTERN = /\b[A-Za-z0-9_-]{24,}\b/g;

/**
 * Redacts anything that looks like a case identifier or a long token/secret
 * from assistant output. The mock/LLM response should never legitimately
 * contain these (the assistant is only given general knowledge-base
 * content, never live case data), but this is a defense-in-depth backstop.
 */
export function redactSensitiveOutput(output: string): string {
  return output
    .replace(CASE_ID_PATTERN, "[case reference redacted]")
    .replace(TOKEN_LIKE_PATTERN, (match) => (match.length >= 24 ? "[redacted]" : match));
}

export const SAFE_REFUSAL =
  "I can't share confidential case details, internal notes, or evidence information in this chat. " +
  "Please use the secure Case Verification page or sign in to the Client Portal to check authorized case information.";
