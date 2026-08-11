"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, LockKeyhole } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { HeroPipeline } from "@/components/animations/HeroPipeline";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-shield-line">
      <div className="absolute inset-0 shield-grid-bg opacity-60" />
      <div className="absolute inset-0 shield-radial-glow" />
      <HeroPipeline />
      <div className="absolute inset-0 bg-gradient-to-b from-shield-navy-950/10 via-shield-navy-950/60 to-shield-navy-950" />

      <div className="relative mx-auto max-w-6xl px-5 py-28 text-center lg:px-8 lg:py-36">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-shield-line bg-shield-navy-900/70 px-4 py-1.5 text-xs uppercase tracking-widest text-shield-text-muted"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-shield-cyan" />
          Technology-led investigation. Evidence-driven analysis.
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          <span className="shield-text-gradient">Digital Evidence.</span> Investigative Intelligence.
          <br className="hidden sm:block" /> Defensible Findings.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-shield-text-muted sm:text-lg"
        >
          Advanced cyber crime investigation, digital forensics and intelligence-driven evidence analysis
          for complex digital investigations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <LinkButton href="/case-verification" variant="primary" size="lg">
            <LockKeyhole className="h-4 w-4" />
            Verify a Case
          </LinkButton>
          <LinkButton href="/portal/login" variant="secondary" size="lg">
            Client Portal
          </LinkButton>
          <LinkButton href="/services" variant="ghost" size="lg">
            Explore Services
            <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </motion.div>
      </div>
    </section>
  );
}
