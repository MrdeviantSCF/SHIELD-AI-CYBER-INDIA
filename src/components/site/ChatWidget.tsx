"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ShieldCheck } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello, I'm Shield Assistant. I can help you understand our services, navigate the site, or explain case verification and the client portal. I can't share confidential case or evidence details in chat.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessionId(data.sessionId);
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.error || "Something went wrong. Please try again." }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Connection issue — please try again shortly." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Shield Assistant"
        className="shield-focus-ring fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-shield-cyan text-shield-void shadow-[0_0_30px_-5px_rgba(53,224,255,0.7)] transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-50 flex h-[520px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-shield-line bg-shield-navy-900 shadow-2xl"
          >
            <div className="flex items-center gap-2.5 border-b border-shield-line bg-shield-navy-800 px-4 py-3.5">
              <ShieldCheck className="h-5 w-5 text-shield-cyan" />
              <div>
                <p className="text-sm font-semibold text-white">Shield Assistant</p>
                <p className="text-[11px] text-shield-text-dim">Website & portal guidance only</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-shield-cyan text-shield-void"
                      : "bg-shield-navy-700 text-shield-text"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="max-w-[70%] rounded-xl bg-shield-navy-700 px-3.5 py-2.5 text-sm text-shield-text-muted">
                  Typing…
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2 border-t border-shield-line p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about services, portal, verification…"
                maxLength={500}
                className="shield-focus-ring flex-1 rounded-full bg-shield-navy-800 px-4 py-2 text-sm text-white placeholder:text-shield-text-dim outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                aria-label="Send message"
                className="shield-focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-shield-cyan text-shield-void disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
