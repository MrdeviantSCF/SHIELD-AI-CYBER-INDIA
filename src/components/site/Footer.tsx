import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getContentValues } from "@/lib/content";

const SERVICE_LINKS = [
  { href: "/services/cyber-crime-investigation", label: "Cyber Crime Investigation" },
  { href: "/services/digital-forensics", label: "Digital Forensics" },
  { href: "/services/digital-intelligence", label: "Digital Intelligence" },
  { href: "/services/mobile-forensics", label: "Mobile Forensics" },
  { href: "/services/osint-social-media-investigation", label: "OSINT & Social Media" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About Shield" },
  { href: "/investigation-process", label: "Investigation Process" },
  { href: "/technology", label: "Technology" },
  { href: "/industries", label: "Industries" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export async function Footer() {
  const content = await getContentValues([
    "company.phone",
    "company.email",
    "company.address.primary",
    "company.social.linkedin",
    "company.social.twitter",
  ]);

  return (
    <footer className="border-t border-shield-line bg-shield-navy-950">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-6 w-6 text-shield-cyan" strokeWidth={1.75} />
              <span className="font-semibold text-white">SHIELD</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-shield-text-muted">
              Cyber Crime Investigation · Digital Forensics · Digital Intelligence · Evidence Analysis.
              Technology-led investigation. Evidence-driven analysis.
            </p>
            <div className="mt-5 space-y-1 text-sm text-shield-text-dim">
              <p>{content["company.phone"] || "[OFFICIAL PHONE]"}</p>
              <p>{content["company.email"] || "[OFFICIAL EMAIL]"}</p>
              <p>{content["company.address.primary"] || "[OFFICE ADDRESS]"}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-shield-text-dim">Services</h3>
            <ul className="mt-4 space-y-2.5">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-shield-text-muted hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-sm text-shield-cyan hover:text-white">
                  View all services →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-shield-text-dim">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-shield-text-muted hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-shield-text-dim">Legal</h3>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-shield-text-muted hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/case-verification" className="text-sm text-shield-text-muted hover:text-white">
                  Case Verification
                </Link>
              </li>
              <li>
                <Link href="/portal/login" className="text-sm text-shield-text-muted hover:text-white">
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-shield-line pt-6 text-xs text-shield-text-dim sm:flex-row">
          <p>© {new Date().getFullYear()} Shield Cyber Forensic Investigation. All rights reserved.</p>
          <p>Case information is protected. Authorized access only.</p>
        </div>
      </div>
    </footer>
  );
}
