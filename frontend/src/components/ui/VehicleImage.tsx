import { ImageOff } from "lucide-react";
import { useState } from "react";

interface Props {
  src: string | null | undefined;
  alt: string;
  /** Out-of-stock vehicles are fully desaturated and dimmed, but stay recognisable. */
  soldOut?: boolean;
  /** Keeps the colour version while a thumbnail is the selected one. */
  active?: boolean;
  position?: string | null;
  className?: string;
  /** true for the first screenful, so it is not lazy-loaded */
  eager?: boolean;
}

/**
 * A rectangular photograph (never rounded, never a transparent cut-out). Restrained at rest, natural colour on
 * hover, keyboard focus or selection (see `.photo` in index.css). If the file is missing or fails to load, a
 * deliberate placeholder is shown instead, and nothing else on the page is affected.
 */
export function VehicleImage({ src, alt, soldOut = false, active = false, position, className = "", eager = false }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div role="img" aria-label={`${alt} (photograph not available)`} className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-elevated text-muted ${className}`}>
        <ImageOff className="h-8 w-8" aria-hidden="true" />
        <span className="t-label">Photograph not available</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      data-active={active || undefined}
      style={position ? { objectPosition: position } : undefined}
      className={`photo h-full w-full object-cover ${soldOut ? "photo-sold" : ""} ${className}`}
    />
  );
}
