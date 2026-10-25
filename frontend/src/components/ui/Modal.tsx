import { X } from "lucide-react";
import { type ReactNode, type RefObject, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Open overlays, top of the stack last. Only the top one reacts to Escape and Tab, so a confirmation dialog
// opened over a form closes by itself without also closing the form underneath.
const stack: symbol[] = [];
let lockedScrollCount = 0;
let savedOverflow = "";

/**
 * Shared accessible-overlay behaviour: Escape closes, Tab is trapped inside, page scroll is locked, focus moves
 * in on open and returns to whatever opened it on close.
 */
export function useOverlayBehavior(open: boolean, panelRef: RefObject<HTMLElement>, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose; // latest callback without re-running the effect

  useEffect(() => {
    if (!open) return;
    const me = Symbol("overlay");
    stack.push(me);
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) panel.focus(); // children with autoFocus win
    if (lockedScrollCount++ === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (stack[stack.length - 1] !== me) return;
      if (event.key === "Escape") { event.stopPropagation(); onCloseRef.current(); return; }
      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) { event.preventDefault(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      stack.splice(stack.indexOf(me), 1);
      if (--lockedScrollCount === 0) document.body.style.overflow = savedOverflow;
      opener?.focus?.();
    };
  }, [open, panelRef]);
}

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
}

const MODAL_WIDTH = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" } as const;

/** A centred dialog. Labelled by its title, so `getByRole("dialog", { name })` works for screen readers and tests. */
export function Modal({ open, onClose, title, description, children, footer, size = "md", closeLabel = "Close dialog" }: OverlayProps & { size?: keyof typeof MODAL_WIDTH }) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlayBehavior(open, panelRef, onClose);
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 animate-fade-in sm:items-center sm:p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined} tabIndex={-1}
        className={`flex max-h-[92vh] w-full flex-col border border-line-active bg-charcoal ${MODAL_WIDTH[size]}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="t-md">{title}</h2>
            {description ? <p id={descId} className="mt-1 text-sm text-dim">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} aria-label={closeLabel} className="icon-btn -mr-2 -mt-1">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <footer className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}

/** A panel that slides in from the right edge (cart, quick view). Same accessibility behaviour as Modal. */
export function Drawer({ open, onClose, title, description, children, footer, closeLabel = "Close panel", width = "max-w-md" }: OverlayProps & { width?: string }) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlayBehavior(open, panelRef, onClose);
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/80 animate-fade-in"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined} tabIndex={-1}
        className={`flex h-full w-full animate-slide-in-right flex-col border-l border-line-active bg-charcoal ${width}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="t-md">{title}</h2>
            {description ? <p id={descId} className="mt-1 text-sm text-dim">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} aria-label={closeLabel} className="icon-btn -mr-2 -mt-1">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer ? <footer className="border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
