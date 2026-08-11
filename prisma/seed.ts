/**
 * Development seed script.
 *
 * Creates:
 *  - Roles + permissions (RBAC baseline)
 *  - Configurable case categories & statuses
 *  - Demo Admin / Investigator / Analyst / Client users (clearly labeled)
 *  - One demo case with a document, evidence item, and custody event
 *  - Starter services, FAQ entries, chatbot knowledge, content placeholders
 *
 * SECURITY: This seed data is for local development / evaluation only.
 * Demo passwords are intentionally simple but are NOT used in production —
 * this script must never be run against a production database.
 */
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { randomBytes, createHash } from "crypto";

const prisma = new PrismaClient();

const PERMISSIONS = [
  "case.read", "case.create", "case.update", "case.assign", "case.close",
  "document.read", "document.upload", "document.delete",
  "evidence.read", "evidence.create", "evidence.transfer",
  "report.publish", "user.manage", "audit.read", "settings.manage",
  "content.manage", "chatbot.manage",
];

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  SUPER_ADMIN: PERMISSIONS,
  ADMIN: PERMISSIONS,
  INVESTIGATOR: ["case.read", "case.update", "document.read", "document.upload", "evidence.read", "evidence.create", "evidence.transfer", "report.publish"],
  ANALYST: ["case.read", "document.read", "document.upload", "evidence.read"],
  SUPPORT: ["case.read", "document.read"],
  CLIENT: ["case.read", "document.read"],
};

const CASE_STATUSES = [
  { key: "CASE_REGISTERED", label: "Case Registered", order: 1, clientVisible: true },
  { key: "INITIAL_ASSESSMENT", label: "Initial Assessment", order: 2, clientVisible: true },
  { key: "EVIDENCE_COLLECTION", label: "Evidence Collection", order: 3, clientVisible: true },
  { key: "EVIDENCE_PROCESSING", label: "Evidence Processing", order: 4, clientVisible: false },
  { key: "FORENSIC_EXAMINATION", label: "Forensic Examination", order: 5, clientVisible: true },
  { key: "ANALYSIS_IN_PROGRESS", label: "Analysis in Progress", order: 6, clientVisible: true },
  { key: "INTELLIGENCE_CORRELATION", label: "Intelligence Correlation", order: 7, clientVisible: false },
  { key: "REPORT_PREPARATION", label: "Report Preparation", order: 8, clientVisible: true },
  { key: "CLIENT_REVIEW", label: "Client Review", order: 9, clientVisible: true },
  { key: "FINAL_REPORT_ISSUED", label: "Final Report Issued", order: 10, clientVisible: true },
  { key: "CASE_CLOSED", label: "Case Closed", order: 11, clientVisible: true, isTerminal: true },
];

const CASE_CATEGORIES = [
  { code: "CF", name: "Cyber Fraud", description: "Cyber fraud investigation" },
  { code: "DF", name: "Digital Forensics", description: "Digital forensics examination" },
  { code: "MP", name: "Missing Person", description: "Missing person digital investigation" },
  { code: "CI", name: "Corporate Investigation", description: "Corporate investigation support" },
  { code: "OS", name: "OSINT / Digital Intelligence", description: "Open-source intelligence & digital intelligence" },
  { code: "MF", name: "Mobile Forensics", description: "Mobile device forensic examination" },
];

const SERVICES = [
  {
    slug: "cyber-crime-investigation",
    name: "Cyber Crime Investigation",
    summary: "Structured, evidence-driven investigation of cyber crime incidents.",
    whatItIs: "Cyber Crime Investigation covers the systematic identification, collection and technical analysis of digital evidence connected to cyber-enabled or cyber-dependent offenses.",
    useCases: ["Online fraud", "Hacking incidents", "Digital extortion", "Identity theft"],
    workflow: ["Case Intake", "Risk Assessment", "Evidence Preservation", "Forensic Examination", "Intelligence Correlation", "Reporting"],
    deliverables: ["Technical findings summary", "Evidence inventory", "Final investigation report"],
  },
  {
    slug: "digital-forensics",
    name: "Digital Forensics",
    summary: "Forensic examination of digital devices and media using defensible methodology.",
    whatItIs: "Digital Forensics involves the forensically sound acquisition, preservation and examination of digital devices and storage media to identify relevant digital artifacts.",
    useCases: ["Device examination", "Data recovery support", "Artifact analysis"],
    workflow: ["Acquisition", "Preservation", "Examination", "Analysis", "Reporting"],
    deliverables: ["Forensic image reference", "Examination report", "Artifact summary"],
  },
  {
    slug: "digital-intelligence",
    name: "Digital Intelligence",
    summary: "Intelligence-driven correlation of digital data points to support investigations.",
    whatItIs: "Digital Intelligence combines structured data analysis and correlation techniques to surface investigative leads from digital sources.",
    useCases: ["Investigative lead generation", "Pattern correlation", "Risk profiling support"],
    workflow: ["Data Collection", "Correlation", "Analysis", "Findings"],
    deliverables: ["Intelligence summary", "Correlation diagrams"],
  },
  {
    slug: "cyber-fraud-investigation",
    name: "Cyber Fraud Investigation",
    summary: "Investigation support for digital and financial fraud matters.",
    whatItIs: "Cyber Fraud Investigation focuses on tracing digital footprints and financial trails associated with online fraud.",
    useCases: ["Payment fraud", "Phishing incidents", "Online scam investigation"],
    workflow: ["Case Intake", "Transaction Review", "Digital Trail Analysis", "Reporting"],
    deliverables: ["Fraud analysis report", "Transaction trail summary"],
  },
  {
    slug: "mobile-forensics",
    name: "Mobile Forensics",
    summary: "Forensic examination of mobile devices under proper authorization.",
    whatItIs: "Mobile Forensics covers the authorized, forensically sound examination of mobile devices to extract and analyze relevant digital artifacts.",
    useCases: ["Message artifact review", "App data analysis", "Device timeline reconstruction"],
    workflow: ["Authorization Check", "Acquisition", "Examination", "Reporting"],
    deliverables: ["Mobile examination report"],
  },
  {
    slug: "computer-endpoint-forensics",
    name: "Computer / Endpoint Forensics",
    summary: "Examination of laptops, desktops and endpoints for digital evidence.",
    whatItIs: "Computer/Endpoint Forensics applies forensic methodology to desktops, laptops and endpoint systems.",
    useCases: ["Insider incident review", "Malware artifact review", "Endpoint timeline analysis"],
    workflow: ["Acquisition", "Examination", "Analysis", "Reporting"],
    deliverables: ["Endpoint examination report"],
  },
  {
    slug: "email-forensics",
    name: "Email Forensics",
    summary: "Technical examination of email headers, metadata and artifacts.",
    whatItIs: "Email Forensics examines email headers, routing metadata and related artifacts to support investigations.",
    useCases: ["Phishing analysis", "Email spoofing review", "Header/metadata analysis"],
    workflow: ["Collection", "Header Analysis", "Metadata Review", "Reporting"],
    deliverables: ["Email analysis report"],
  },
  {
    slug: "osint-social-media-investigation",
    name: "OSINT / Social Media Investigation",
    summary: "Open-source intelligence gathering from publicly available digital sources.",
    whatItIs: "OSINT / Social Media Investigation involves the structured collection and analysis of publicly available digital information.",
    useCases: ["Background verification support", "Public digital footprint review"],
    workflow: ["Scoping", "Collection", "Correlation", "Reporting"],
    deliverables: ["OSINT summary report"],
  },
  {
    slug: "financial-digital-transaction-analysis",
    name: "Financial & Digital Transaction Analysis",
    summary: "Structured analysis of digital financial transaction records.",
    whatItIs: "Financial & Digital Transaction Analysis reviews transaction records to identify patterns relevant to an investigation.",
    useCases: ["Transaction trail mapping", "Pattern identification"],
    workflow: ["Data Intake", "Structuring", "Pattern Analysis", "Reporting"],
    deliverables: ["Transaction analysis report"],
  },
  {
    slug: "bank-statement-analysis",
    name: "Bank Statement Analysis",
    summary: "Structured review and analysis of bank statement records.",
    whatItIs: "Bank Statement Analysis involves organizing and analyzing bank statement data to identify relevant transaction patterns.",
    useCases: ["Fund flow tracing support", "Transaction categorization"],
    workflow: ["Data Intake", "Structuring", "Analysis", "Reporting"],
    deliverables: ["Bank statement analysis report"],
  },
  {
    slug: "upi-analysis",
    name: "UPI Analysis",
    summary: "Analysis of UPI transaction data relevant to an investigation.",
    whatItIs: "UPI Analysis reviews UPI transaction records to identify patterns and trails relevant to an investigation.",
    useCases: ["UPI trail review", "Transaction pattern analysis"],
    workflow: ["Data Intake", "Structuring", "Analysis", "Reporting"],
    deliverables: ["UPI analysis report"],
  },
  {
    slug: "cdr-analysis",
    name: "CDR Analysis",
    summary: "Call Detail Record analysis performed under lawful authorization.",
    whatItIs: "CDR Analysis reviews call detail records, where lawfully obtained, to identify relevant communication patterns.",
    useCases: ["Communication pattern review", "Timeline correlation"],
    workflow: ["Authorization Check", "Data Intake", "Analysis", "Reporting"],
    deliverables: ["CDR analysis summary"],
  },
  {
    slug: "ipdr-analysis",
    name: "IPDR Analysis",
    summary: "Internet Protocol Detail Record analysis under lawful authorization.",
    whatItIs: "IPDR Analysis reviews internet protocol detail records, where lawfully obtained, for investigative correlation.",
    useCases: ["Session correlation", "Digital footprint review"],
    workflow: ["Authorization Check", "Data Intake", "Analysis", "Reporting"],
    deliverables: ["IPDR analysis summary"],
  },
  {
    slug: "tower-dump-cell-id-analysis",
    name: "Tower Dump / Cell ID Analysis",
    summary: "Cell site data analysis performed under lawful authorization.",
    whatItIs: "Tower Dump / Cell ID Analysis reviews cell site data, where lawfully obtained, to support geographic/timeline correlation.",
    useCases: ["Geographic correlation support", "Timeline reconstruction"],
    workflow: ["Authorization Check", "Data Intake", "Analysis", "Reporting"],
    deliverables: ["Cell ID analysis summary"],
  },
  {
    slug: "document-metadata-analysis",
    name: "Document & Metadata Analysis",
    summary: "Technical examination of documents and their embedded metadata.",
    whatItIs: "Document & Metadata Analysis examines document files and embedded metadata for relevant investigative artifacts.",
    useCases: ["Authenticity review support", "Metadata extraction"],
    workflow: ["Collection", "Metadata Extraction", "Analysis", "Reporting"],
    deliverables: ["Document analysis report"],
  },
  {
    slug: "image-video-forensics",
    name: "Image / Video Forensics",
    summary: "Technical examination of image and video media files.",
    whatItIs: "Image / Video Forensics applies technical analysis to image and video files to identify relevant artifacts.",
    useCases: ["Media authenticity review support", "Metadata analysis"],
    workflow: ["Collection", "Technical Analysis", "Reporting"],
    deliverables: ["Media analysis report"],
  },
  {
    slug: "face-image-analysis",
    name: "Face / Image Analysis",
    summary: "Technical, evidence-based image analysis support.",
    whatItIs: "Face / Image Analysis applies technical analysis methods to still images as part of a broader investigation.",
    useCases: ["Image comparison support", "Technical image review"],
    workflow: ["Collection", "Technical Review", "Reporting"],
    deliverables: ["Image analysis summary"],
  },
  {
    slug: "missing-person-digital-investigation",
    name: "Missing Person Digital Investigation",
    summary: "Digital investigation support for missing person cases.",
    whatItIs: "Missing Person Digital Investigation applies digital forensic and intelligence techniques to support missing person cases.",
    useCases: ["Digital footprint review", "Last-known-activity analysis"],
    workflow: ["Case Intake", "Digital Footprint Review", "Correlation", "Reporting"],
    deliverables: ["Investigation summary report"],
  },
  {
    slug: "corporate-investigation-support",
    name: "Corporate Investigation Support",
    summary: "Digital investigation support for corporate/internal matters.",
    whatItIs: "Corporate Investigation Support provides digital forensic and investigative assistance for internal corporate matters.",
    useCases: ["Internal incident review", "Policy violation investigation support"],
    workflow: ["Scoping", "Evidence Collection", "Analysis", "Reporting"],
    deliverables: ["Corporate investigation report"],
  },
  {
    slug: "cybersecurity-incident-investigation",
    name: "Cybersecurity Incident Investigation",
    summary: "Technical investigation of cybersecurity incidents.",
    whatItIs: "Cybersecurity Incident Investigation provides technical investigation support following a security incident.",
    useCases: ["Incident timeline reconstruction", "Root-cause technical review"],
    workflow: ["Incident Intake", "Evidence Preservation", "Technical Analysis", "Reporting"],
    deliverables: ["Incident investigation report"],
  },
  {
    slug: "technical-investigation-reporting",
    name: "Technical Investigation & Reporting",
    summary: "Structured technical reporting for digital investigations.",
    whatItIs: "Technical Investigation & Reporting focuses on producing clear, structured and defensible technical reports.",
    useCases: ["Investigation report preparation", "Technical documentation"],
    workflow: ["Findings Review", "Report Drafting", "Quality Review", "Delivery"],
    deliverables: ["Structured technical report"],
  },
];

const FAQS = [
  { question: "How do I verify a Shield case?", answer: "Go to the Case Verification page and enter your Case ID along with the verification code shared with you by Shield.", category: "verification" },
  { question: "How do I access my case documents?", answer: "Sign in to the Client Portal, then open your case and go to the Documents tab.", category: "portal" },
  { question: "Can I upload documents to my case?", answer: "Yes, authorized clients can securely upload documents from within their case in the Client Portal.", category: "documents" },
  { question: "Will Shield share my case with anyone else?", answer: "Case information is only accessible to you and Shield staff authorized on your case. Internal investigation notes are never shared with clients.", category: "privacy" },
  { question: "How can I contact Shield?", answer: "Use the Contact page to submit an enquiry and our team will get back to you.", category: "contact" },
];

const CHAT_KNOWLEDGE = [
  { topic: "About Shield", content: "Shield Cyber Forensic Investigation (SCFI) provides cyber crime investigation, digital forensics and digital intelligence services using a structured, evidence-driven methodology.", tags: ["about"] },
  { topic: "Services", content: "Shield's services include Cyber Crime Investigation, Digital Forensics, Digital Intelligence, Mobile Forensics, OSINT, Financial & Transaction Analysis and more. See the Services page for full details.", tags: ["services"] },
  { topic: "Case Verification", content: "Case references can be verified on the Case Verification page using a Case ID and verification code. Case IDs alone are never sufficient to access case information.", tags: ["verification"] },
  { topic: "Client Portal", content: "The Client Portal lets authorized clients securely track case status, timeline, documents and notifications. Access requires signing in with credentials issued by Shield.", tags: ["portal"] },
  { topic: "Document Upload", content: "Authorized clients can upload documents to their case from within the Client Portal. Files are validated and stored privately.", tags: ["documents"] },
  { topic: "Investigation Process", content: "Shield's investigation process generally follows: Case Intake, Risk Assessment, Evidence Preservation, Forensic Examination, Intelligence Correlation, Analytical Findings, Reporting, and Secure Delivery.", tags: ["process"] },
  { topic: "Contact", content: "Enquiries can be submitted through the Contact page on the website.", tags: ["contact"] },
];

const CONTENT_PLACEHOLDERS: { key: string; label: string; value: string }[] = [
  { key: "company.phone", label: "Official Phone Number", value: "[OFFICIAL PHONE]" },
  { key: "company.email", label: "Official Email Address", value: "[OFFICIAL EMAIL]" },
  { key: "company.address.primary", label: "Primary Office Address", value: "[OFFICE ADDRESS]" },
  { key: "company.social.linkedin", label: "LinkedIn URL", value: "[OFFICIAL SOCIAL LINK]" },
  { key: "company.social.twitter", label: "X / Twitter URL", value: "[OFFICIAL SOCIAL LINK]" },
  { key: "company.founder.bio", label: "Founder / Director Biography", value: "[FOUNDER BIOGRAPHY — to be provided by Admin]" },
  { key: "company.office.ahilyanagar", label: "Ahilyanagar Office", value: "[OFFICE ADDRESS — Ahilyanagar]" },
  { key: "company.office.pune", label: "Pune Office", value: "[OFFICE ADDRESS — Pune]" },
  { key: "company.office.mumbai", label: "Mumbai Office", value: "[OFFICE ADDRESS — Mumbai]" },
  { key: "company.office.hyderabad", label: "Hyderabad Office", value: "[OFFICE ADDRESS — Hyderabad]" },
  { key: "company.office.delhi", label: "Delhi Office", value: "[OFFICE ADDRESS — Delhi]" },
  { key: "company.logo.url", label: "Logo URL", value: "[LOGO URL]" },
  { key: "company.registration", label: "Business Registration Details", value: "[REGISTRATION DETAILS]" },
];

function randomToken() {
  return randomBytes(24).toString("base64url");
}
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function main() {
  console.log("Seeding Shield database (development demo data)...");

  // Roles + permissions
  const roleMap: Record<string, string> = {};
  for (const roleName of Object.keys(ROLE_PERMISSION_MAP)) {
    const role = await prisma.role.upsert({
      where: { name: roleName as never },
      update: {},
      create: { name: roleName as never, description: `${roleName} role` },
    });
    roleMap[roleName] = role.id;
  }

  const permissionMap: Record<string, string> = {};
  for (const key of PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
    permissionMap[key] = perm.id;
  }

  for (const [roleName, perms] of Object.entries(ROLE_PERMISSION_MAP)) {
    for (const permKey of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roleMap[roleName], permissionId: permissionMap[permKey] } },
        update: {},
        create: { roleId: roleMap[roleName], permissionId: permissionMap[permKey] },
      });
    }
  }

  // Case categories
  const categoryMap: Record<string, string> = {};
  for (const cat of CASE_CATEGORIES) {
    const c = await prisma.caseCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categoryMap[cat.code] = c.id;
  }

  // Case statuses
  const statusMap: Record<string, string> = {};
  for (const st of CASE_STATUSES) {
    const s = await prisma.caseStatusDef.upsert({
      where: { key: st.key },
      update: { label: st.label, order: st.order, clientVisible: st.clientVisible, isTerminal: st.isTerminal ?? false },
      create: { ...st, isTerminal: st.isTerminal ?? false },
    });
    statusMap[st.key] = s.id;
  }

  // Services
  for (const [i, svc] of SERVICES.entries()) {
    await prisma.serviceEntry.upsert({
      where: { slug: svc.slug },
      update: { ...svc, sortOrder: i },
      create: { ...svc, sortOrder: i },
    });
  }

  // FAQ
  for (const [i, faq] of FAQS.entries()) {
    const existing = await prisma.faqEntry.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.faqEntry.create({ data: { ...faq, sortOrder: i } });
    }
  }

  // Chat knowledge
  for (const k of CHAT_KNOWLEDGE) {
    const existing = await prisma.chatKnowledge.findFirst({ where: { topic: k.topic } });
    if (!existing) {
      await prisma.chatKnowledge.create({ data: k });
    }
  }

  // Content placeholders
  for (const c of CONTENT_PLACEHOLDERS) {
    await prisma.contentBlock.upsert({
      where: { key: c.key },
      update: {},
      create: { ...c, isPlaceholder: true },
    });
  }

  // Demo users
  const demoPasswordHash = await argon2.hash("ShieldDemo!2026", { type: argon2.argon2id });

  async function upsertUser(email: string, name: string, roleName: string) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name, passwordHash: demoPasswordHash, status: "ACTIVE" },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roleMap[roleName] } },
      update: {},
      create: { userId: user.id, roleId: roleMap[roleName] },
    });
    return user;
  }

  const adminUser = await upsertUser("admin@demo.shieldcfi.test", "Demo Admin", "SUPER_ADMIN");
  const investigatorUser = await upsertUser("investigator@demo.shieldcfi.test", "Demo Investigator", "INVESTIGATOR");
  const analystUser = await upsertUser("analyst@demo.shieldcfi.test", "Demo Analyst", "ANALYST");
  const clientUser = await upsertUser("client@demo.shieldcfi.test", "Demo Client", "CLIENT");

  const investigator = await prisma.investigator.upsert({
    where: { userId: investigatorUser.id },
    update: {},
    create: { userId: investigatorUser.id, designation: "Senior Investigator (Demo)" },
  });

  const client = await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: { userId: clientUser.id, organization: "Demo Organization Pvt. Ltd." },
  });

  // Demo case
  const existingCase = await prisma.case.findFirst({ where: { caseId: "SCF/2026/CF/001" } });
  let demoCase = existingCase;
  if (!demoCase) {
    await prisma.caseSequence.upsert({
      where: { year_category: { year: 2026, category: "CF" } },
      update: { lastSeq: 1 },
      create: { year: 2026, category: "CF", lastSeq: 1 },
    });

    demoCase = await prisma.case.create({
      data: {
        caseId: "SCF/2026/CF/001",
        categoryId: categoryMap["CF"],
        title: "[DEMO] Online Payment Fraud Investigation",
        clientId: client.id,
        priority: "MEDIUM",
        currentStatusId: statusMap["EVIDENCE_COLLECTION"],
        clientVisibleDescription: "Demo case for evaluating the Shield client portal. Not a real investigation.",
        internalDescription: "[DEMO] Internal notes are only ever visible to staff. Client-facing views never expose this field.",
        verificationEnabled: true,
      },
    });

    await prisma.caseAssignment.create({
      data: { caseId: demoCase.id, investigatorId: investigator.id, isLead: true },
    });

    await prisma.caseStatusHistory.createMany({
      data: [
        { caseId: demoCase.id, statusId: statusMap["CASE_REGISTERED"], note: "[DEMO] Case registered." },
        { caseId: demoCase.id, statusId: statusMap["INITIAL_ASSESSMENT"], note: "[DEMO] Initial assessment completed." },
        { caseId: demoCase.id, statusId: statusMap["EVIDENCE_COLLECTION"], note: "[DEMO] Evidence collection in progress." },
      ],
    });

    await prisma.caseUpdate.createMany({
      data: [
        { caseId: demoCase.id, authorId: investigatorUser.id, clientVisible: true, content: "[DEMO] We have begun evidence collection for your case." },
        { caseId: demoCase.id, authorId: investigatorUser.id, clientVisible: false, content: "[DEMO] Internal note: awaiting additional device access authorization." },
      ],
    });

    const verificationToken = randomToken();
    await prisma.verificationToken.create({
      data: {
        caseId: demoCase.id,
        tokenHash: hashToken(verificationToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      },
    });

    const document = await prisma.document.create({
      data: {
        caseId: demoCase.id,
        category: "CASE_INTAKE",
        title: "[DEMO] Case Intake Form",
        clientVisible: true,
        approvalStatus: "APPROVED",
        uploadedById: investigatorUser.id,
      },
    });

    const version = await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        versionNumber: 1,
        storageKey: `demo/${document.id}/v1-intake.txt`,
        originalFilename: "intake-form.txt",
        sanitizedFilename: "intake-form.txt",
        mimeType: "text/plain",
        sizeBytes: 42,
        sha256: hashToken("demo-content"),
        uploadedById: investigatorUser.id,
      },
    });

    await prisma.document.update({ where: { id: document.id }, data: { currentVersionId: version.id } });

    const evidence = await prisma.evidenceItem.create({
      data: {
        evidenceId: "SCF/2026/CF/001-EV-01",
        caseId: demoCase.id,
        type: "Digital Device",
        description: "[DEMO] Mobile device submitted for examination.",
        source: "Client submission",
        collectedAt: new Date(),
        collectedById: investigatorUser.id,
        collectedByName: investigatorUser.name,
        currentCustodian: investigatorUser.name,
        status: "IN_CUSTODY",
      },
    });

    await prisma.evidenceCustodyEvent.create({
      data: {
        evidenceId: evidence.id,
        eventType: "COLLECTED",
        actorId: investigatorUser.id,
        actorName: investigatorUser.name,
        toCustodian: investigatorUser.name,
        notes: "[DEMO] Initial collection from client.",
      },
    });

    console.log("Demo verification token (development only):", verificationToken);
  }

  console.log("Seed complete.");
  console.log("Demo credentials (development only, password: ShieldDemo!2026):");
  console.log("  Admin:        admin@demo.shieldcfi.test");
  console.log("  Investigator: investigator@demo.shieldcfi.test");
  console.log("  Analyst:      analyst@demo.shieldcfi.test");
  console.log("  Client:       client@demo.shieldcfi.test");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
