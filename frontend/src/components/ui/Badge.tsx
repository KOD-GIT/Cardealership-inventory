import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "danger" | "neutral" | "brand";

// Text colours were chosen for >= 4.5:1 contrast on their tint (amber uses the darker `warning-ink`).
const TONES: Record<BadgeTone, { box: string; dot: string }> = {
  success: { box: "bg-success-tint text-success", dot: "bg-success" },
  warning: { box: "bg-warning-tint text-warning-ink", dot: "bg-warning" },
  danger: { box: "bg-danger-tint text-danger", dot: "bg-danger" },
  neutral: { box: "bg-canvas text-ink border border-line", dot: "bg-muted" },
  brand: { box: "bg-brand-tint text-brand", dot: "bg-brand" },
};

export function Badge({ tone = "neutral", dot = false, children }: { tone?: BadgeTone; dot?: boolean; children: ReactNode }) {
  const t = TONES[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${t.box}`}>
      {dot ? <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
