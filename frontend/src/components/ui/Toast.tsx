import { CheckCircle2, TriangleAlert, X } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export interface ToastOptions {
  tone: "success" | "error";
  title: string;
  description?: string;
}
interface ToastItem extends ToastOptions { id: number }

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);
const DISMISS_AFTER_MS = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);
  const show = useCallback((options: ToastOptions) => {
    setItems((all) => [...all.slice(-2), { ...options, id: nextId.current++ }]); // keep at most 3
  }, []);

  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-end gap-3 p-4 sm:p-6">
        {items.map((t) => <ToastCard key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), DISMISS_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const success = toast.tone === "success";
  const Icon = success ? CheckCircle2 : TriangleAlert;
  return (
    <div
      // errors interrupt screen readers (alert); successes are announced politely (status)
      role={success ? "status" : "alert"}
      className={`pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-xl border-l-4 bg-white p-4 shadow-lift ${success ? "border-success" : "border-danger"}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${success ? "text-success" : "text-danger"}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-bold leading-tight">{toast.title}</p>
        {toast.description ? <p className="mt-1 text-sm text-muted">{toast.description}</p> : null}
      </div>
      <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function useToast(): (options: ToastOptions) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
