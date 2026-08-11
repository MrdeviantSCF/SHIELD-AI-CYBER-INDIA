import { Badge } from "./Badge";

const TERMINAL_KEYS = new Set(["CASE_CLOSED", "FINAL_REPORT_ISSUED"]);
const RISK_KEYS = new Set(["EVIDENCE_PROCESSING", "INTELLIGENCE_CORRELATION"]);

export function StatusBadge({ statusKey, label }: { statusKey: string; label: string }) {
  const tone = TERMINAL_KEYS.has(statusKey) ? "green" : RISK_KEYS.has(statusKey) ? "amber" : "cyan";
  return <Badge tone={tone}>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "CRITICAL" ? "red" : priority === "HIGH" ? "amber" : priority === "MEDIUM" ? "cyan" : "neutral";
  return <Badge tone={tone}>{priority}</Badge>;
}
