import { X } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export interface NotifyAction { label: string; onClick: () => void }
export interface NotifyOptions {
  tone?: "success" | "error" | "info";
  title: string;
  description?: string;
  /** e.g. { label: "Undo", onClick } */
  action?: NotifyAction;
  /** Defaults to 5 s, or 8 s when there is an action to give people time to use it. */
  durationMs?: number;
}
interface Item extends NotifyOptions { id: number }

type Notify = (options: NotifyOptions) => number;
const NotifyContext = createContext<Notify | null>(null);

export const DEFAULT_MS = 5000;
export const UNDO_MS = 8000;
const MAX_VISIBLE = 5;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((item) => item.id !== id)), []);
  const notify = useCallback<Notify>((options) => {
    const id = nextId.current++;
    setItems((all) => [...all.slice(-(MAX_VISIBLE - 1)), { ...options, id }]);
    return id;
  }, []);

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      {/* Each notification is its own live region, so several removals are announced and undone independently. */}
      <section aria-label="Notifications" className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-start gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-6">
        {items.map((item) => <Notice key={item.id} item={item} onDismiss={dismiss} />)}
      </section>
    </NotifyContext.Provider>
  );
}

const TONE_BAR = { success: "bg-lime", error: "bg-signal", info: "bg-bone" } as const;

function Notice({ item, onDismiss }: { item: Item; onDismiss: (id: number) => void }) {
  const total = item.durationMs ?? (item.action ? UNDO_MS : DEFAULT_MS);
  const remaining = useRef(total);
  const startedAt = useRef(0);
  const timer = useRef<number>();
  const tone = item.tone ?? "info";

  const start = useCallback(() => {
    window.clearTimeout(timer.current);
    startedAt.current = Date.now();
    timer.current = window.setTimeout(() => onDismiss(item.id), remaining.current);
  }, [item.id, onDismiss]);
  // Hover or keyboard focus pauses the countdown and keeps the time that was left.
  const pause = useCallback(() => {
    if (!timer.current) return;
    window.clearTimeout(timer.current);
    timer.current = undefined;
    remaining.current = Math.max(1000, remaining.current - (Date.now() - startedAt.current));
  }, []);

  useEffect(() => {
    start();
    return () => window.clearTimeout(timer.current);
  }, [start]);

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      onMouseEnter={pause}
      onMouseLeave={start}
      onFocus={pause}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) start(); }}
      className="pointer-events-auto flex w-full max-w-md animate-slide-up border border-line-active bg-elevated"
    >
      <span aria-hidden="true" className={`w-1.5 shrink-0 ${TONE_BAR[tone]}`} />
      <div className="min-w-0 flex-1 px-4 py-3">
        <p className="t-data font-semibold uppercase text-bone">{item.title}</p>
        {item.description ? <p className="mt-1 text-sm text-dim">{item.description}</p> : null}
        {item.action ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm mt-3"
            onClick={() => { item.action?.onClick(); onDismiss(item.id); }}
          >
            {item.action.label}
          </button>
        ) : null}
      </div>
      <button type="button" onClick={() => onDismiss(item.id)} aria-label={`Dismiss: ${item.title}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center text-dim hover:text-bone">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function useNotify(): Notify {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error("useNotify must be used inside <NotificationProvider>");
  return ctx;
}

/** A stable object form some callers prefer. */
export function useNotifier() {
  const notify = useNotify();
  return useMemo(() => ({
    success: (title: string, description?: string) => notify({ tone: "success", title, description }),
    error: (title: string, description?: string) => notify({ tone: "error", title, description }),
    info: (title: string, description?: string) => notify({ tone: "info", title, description }),
  }), [notify]);
}
