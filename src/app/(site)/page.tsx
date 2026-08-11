import { Hero } from "@/components/site/Hero";
import { InvestigationStory } from "@/components/site/InvestigationStory";
import { LinkButton } from "@/components/ui/Button";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ShieldCheck, Search, FileSearch, Network, Lock, ArrowRight } from "lucide-react";

const CAPABILITIES = [
  { icon: Search, title: "Cyber Crime Investigation", desc: "Structured, evidence-driven investigation of cyber-enabled offenses." },
  { icon: FileSearch, title: "Digital Forensics", desc: "Forensically sound acquisition, preservation and examination of digital media." },
  { icon: Network, title: "Digital Intelligence", desc: "Correlation of digital data points to generate investigative leads." },
  { icon: Lock, title: "Evidence Analysis", desc: "Technical analysis of digital evidence with defensible chain of custody." },
];

export default async function HomePage() {
  const services = await prisma.serviceEntry.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    take: 6,
  });

  return (
    <>
      <Hero />

      <section className="border-b border-shield-line bg-shield-navy-950 py-16">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="shield-card rounded-2xl p-6">
                <c.icon className="h-6 w-6 text-shield-cyan" strokeWidth={1.5} />
                <h3 className="mt-4 text-sm font-semibold text-white">{c.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-shield-text-muted">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InvestigationStory />

      <section className="border-b border-shield-line bg-shield-navy-950 py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-shield-cyan">Services</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">What Shield Does</h2>
            </div>
            <Link href="/services" className="hidden text-sm text-shield-cyan hover:text-white sm:flex items-center gap-1">
              View all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="shield-card block rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-shield-text-muted">{s.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs text-shield-cyan">
                  Learn more <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-shield-navy-900 py-20">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <ShieldCheck className="mx-auto h-8 w-8 text-shield-cyan" />
          <h2 className="mt-4 text-3xl font-semibold text-white">Secure Client Portal &amp; Case Verification</h2>
          <p className="mt-4 text-shield-text-muted">
            Authorized clients can securely track case status, timeline, documents and notifications. Case
            references can be verified without exposing confidential investigation data.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/case-verification" variant="primary" size="lg">Verify a Case</LinkButton>
            <LinkButton href="/portal/login" variant="secondary" size="lg">Client Portal Login</LinkButton>
            <LinkButton href="/contact" variant="outline" size="lg">Contact Shield</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
