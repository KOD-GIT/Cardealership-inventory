import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const WIDTHS = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" } as const;

/**
 * Accessible dialog: labelled, Escape closes, Tab is trapped inside, page scroll is locked and
 * focus returns to whatever opened it. (Hand-rolled to keep the dependency list small.)
 */
export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose; // latest callback without re-running the focus effect

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) panel.focus(); // autoFocus children win
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onCloseRef.current(); return; }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined} tabIndex={-1}
        className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-lift sm:rounded-2xl ${WIDTHS[size]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 id={titleId} className="text-2xl font-bold">{title}</h2>
            {description ? <p id={descId} className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="flex flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
