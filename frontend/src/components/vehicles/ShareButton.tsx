import { Check, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNotify } from "../ui/Notifications";

/**
 * Copies the direct link (built from the stable vehicle id) to the clipboard. "Link copied" is shown ONLY after the
 * browser confirms the copy. If copying is blocked (insecure page, denied permission) a selectable link is shown
 * instead, so you can always copy it by hand.
 */
export function ShareButton({ vehicleId, name }: { vehicleId: number; name: string }) {
  const notify = useNotify();
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const url = `${window.location.origin}/vehicle/${vehicleId}`;

  const share = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(url);
      setFallback(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      notify({ tone: "success", title: "Link copied", description: `The link to ${name} is on your clipboard.` });
    } catch {
      setFallback(true);
      window.setTimeout(() => { input.current?.focus(); input.current?.select(); }, 0);
    }
  };

  return (
    <div>
      <button type="button" className="btn btn-ghost" onClick={share}>
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />} {copied ? "Copied" : "Share"}
      </button>
      {fallback ? (
        <div role="status" className="mt-3 border border-line bg-charcoal p-3">
          <label htmlFor={`share-${vehicleId}`} className="t-label text-dim">Copying was blocked. Select the link and copy it:</label>
          <input id={`share-${vehicleId}`} ref={input} readOnly value={url} onFocus={(event) => event.currentTarget.select()} className="input t-data mt-2" />
        </div>
      ) : null}
    </div>
  );
}
