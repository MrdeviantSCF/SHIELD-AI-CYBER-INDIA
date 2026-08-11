import { cn } from "@/lib/utils";

type Tone = "cyan" | "amber" | "green" | "red" | "neutral";

const toneClasses: Record<Tone, string> = {
  cyan: "bg-shield-cyan/10 text-shield-cyan border-shield-cyan/30",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  red: "bg-red-500/10 text-red-400 border-red-500/30",
  neutral: "bg-white/5 text-shield-text-muted border-shield-line",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wider",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
