"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/investigation-process", label: "Process" },
  { href: "/technology", label: "Technology" },
  { href: "/industries", label: "Industries" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-shield-line/70 bg-shield-navy-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shield-focus-ring rounded-md">
          <ShieldCheck className="h-6 w-6 text-shield-cyan" strokeWidth={1.75} />
          <span className="font-semibold tracking-wide text-white">
            SHIELD <span className="text-shield-text-muted font-normal">Cyber Forensic Investigation</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-shield-text-muted transition-colors hover:text-white shield-focus-ring rounded"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LinkButton href="/case-verification" variant="outline" size="sm">
            Verify a Case
          </LinkButton>
          <LinkButton href="/portal/login" variant="primary" size="sm">
            Client Portal
          </LinkButton>
        </div>

        <button
          aria-label="Toggle navigation menu"
          className="shield-focus-ring rounded-md p-2 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-shield-line lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-shield-text-muted hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 px-3">
                <LinkButton href="/case-verification" variant="outline" size="sm" className="w-full">
                  Verify a Case
                </LinkButton>
                <LinkButton href="/portal/login" variant="primary" size="sm" className="w-full">
                  Client Portal
                </LinkButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
