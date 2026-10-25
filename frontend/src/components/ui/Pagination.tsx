import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Page } from "../../lib/browse";

/** Previous / numbered pages / Next. The current page is announced with aria-current. */
export function Pagination<T>({ page, onChange }: { page: Page<T>; onChange: (page: number) => void }) {
  if (page.pageCount <= 1) return null;
  const numbers = Array.from({ length: page.pageCount }, (_, i) => i + 1);
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-4 lg:px-10">
      <p className="t-label text-dim" aria-live="polite">
        Showing {page.from}–{page.to} of {page.total}
      </p>
      <div className="flex items-center">
        <button type="button" onClick={() => onChange(page.page - 1)} disabled={page.page === 1} aria-label="Previous page" className="icon-btn disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        {numbers.map((n) => (
          <button
            key={n} type="button" onClick={() => onChange(n)} aria-label={`Page ${n}`} aria-current={n === page.page ? "page" : undefined}
            className={`t-data -ml-px h-11 min-w-[2.75rem] border px-3 ${n === page.page ? "border-signal bg-signal text-signal-ink" : "border-line text-bone hover:bg-elevated"}`}
          >
            {n}
          </button>
        ))}
        <button type="button" onClick={() => onChange(page.page + 1)} disabled={page.page === page.pageCount} aria-label="Next page" className="icon-btn -ml-px disabled:opacity-40">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
