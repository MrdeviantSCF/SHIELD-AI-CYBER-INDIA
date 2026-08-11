import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-shield-line bg-shield-navy-900/40 px-6 py-16 text-center">
      <Inbox className="h-8 w-8 text-shield-text-dim" />
      <p className="text-sm font-medium text-shield-text">{title}</p>
      {description && <p className="max-w-sm text-xs text-shield-text-muted">{description}</p>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-red-400" />
      <p className="text-sm font-medium text-red-300">{title}</p>
      {description && <p className="max-w-sm text-xs text-red-400/80">{description}</p>}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-shield-cyan" />
      <p className="text-xs text-shield-text-muted">{label}</p>
    </div>
  );
}
