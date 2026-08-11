import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardCard({
  label,
  value,
  icon,
  tone = "cyan",
  className,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  tone?: "cyan" | "amber" | "red" | "neutral";
  className?: string;
}) {
  const toneRing =
    tone === "amber" ? "text-amber-400" : tone === "red" ? "text-red-400" : tone === "neutral" ? "text-shield-text-muted" : "text-shield-cyan";
  return (
    <div className={cn("shield-card rounded-2xl p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-shield-text-dim">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-shield-text">{value}</p>
        </div>
        {icon && <div className={cn("rounded-xl bg-white/5 p-2.5", toneRing)}>{icon}</div>}
      </div>
    </div>
  );
}
