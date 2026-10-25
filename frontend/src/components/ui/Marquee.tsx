import { Pause, Play } from "lucide-react";
import { type ReactNode, useState } from "react";

/**
 * A scrolling ticker with a real Pause/Play control (moving content must be stoppable). With "reduce motion"
 * on, it does not move at all and shows a single static run of the text. The duplicate run used to loop the
 * animation is hidden from assistive technology so the message is read once.
 */
export function Marquee({ children, label, tone = "bone", className = "" }: { children: ReactNode; label: string; tone?: "bone" | "signal"; className?: string }) {
  const [paused, setPaused] = useState(false);
  const signal = tone === "signal";
  return (
    <div className={`relative flex items-center overflow-hidden ${className}`} role="group" aria-label={label}>
      <div className="min-w-0 flex-1 overflow-hidden" aria-hidden="false">
        <div className="marquee-track select-none whitespace-nowrap" data-paused={paused}>
          <div className="flex shrink-0 items-center gap-8 pr-8">{children}</div>
          <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden="true">{children}</div>
        </div>
      </div>
      <button
        type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused}
        aria-label={paused ? "Play moving text" : "Pause moving text"}
        className={`ml-2 mr-3 flex h-9 w-9 shrink-0 items-center justify-center border ${signal ? "border-signal-ink/40 text-signal-ink hover:bg-signal-ink hover:text-signal" : "border-line text-bone hover:bg-elevated"}`}
      >
        {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>
    </div>
  );
}

export const Star = ({ className = "text-signal" }: { className?: string }) => <span aria-hidden="true" className={className}>✳</span>;
