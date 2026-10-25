import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type BrowseState, activeChips, SORT_OPTIONS, type SortKey } from "../../lib/browse";
import { categoryLabel } from "../../lib/format";
import { parseRupees } from "../../lib/money";
import { CATEGORIES, type VehicleCategory } from "../../types";

interface Props {
  state: BrowseState;
  counts: Record<VehicleCategory, number>;
  totalAll: number;
  resultCount: number;
  onChange: (patch: Partial<BrowseState>) => void;
  onClear: () => void;
}

const formatForInput = (rupees: number | null) => (rupees === null ? "" : String(rupees));

/** Price box: keeps what you typed, applies it when it is a clean number, and explains it when it is not. */
function PriceBox({ label, value, onCommit, error }: { label: string; value: number | null; onCommit: (rupees: number | null) => void; error?: string }) {
  const [text, setText] = useState(formatForInput(value));
  const [invalid, setInvalid] = useState(false);
  // Re-sync only when the value was changed from OUTSIDE (chip removal, Clear filters, Back button). While
  // typing, what is in the box already parses to `value`, so it is left alone (commas and all).
  const latestText = useRef(text);
  latestText.current = text;
  useEffect(() => {
    const current = latestText.current;
    const inSync = parseRupees(current) === value || (value === null && current.trim() === "");
    if (!inSync) { setText(formatForInput(value)); setInvalid(false); }
  }, [value]);

  const commit = (raw: string) => {
    if (raw.trim() === "") { setInvalid(false); onCommit(null); return; }
    const parsed = parseRupees(raw);
    setInvalid(parsed === null);
    if (parsed !== null) onCommit(parsed);
  };
  const shownError = invalid ? "Enter a number such as 8,15,000" : error;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label className="t-label text-dim">
        {label}
        <input
          type="text" inputMode="numeric" autoComplete="off" value={text} placeholder="₹ any"
          aria-invalid={shownError ? true : undefined}
          onChange={(event) => { setText(event.target.value); commit(event.target.value); }}
          className="input t-data mt-1 normal-case"
        />
      </label>
      {shownError ? <p role="alert" className="text-xs text-signal">{shownError}</p> : null}
    </div>
  );
}

export function FloorFilters({ state, counts, totalAll, resultCount, onChange, onClear }: Props) {
  const chips = activeChips(state);
  const priceOrderError = state.min !== null && state.max !== null && state.min > state.max ? "Minimum is above maximum" : undefined;
  const visibleCategories = CATEGORIES.filter((category) => counts[category] > 0 || state.category === category);

  return (
    <section aria-label="Filter and sort the floor" className="border-b border-line">
      {/* Category tabs: one hairline-divided strip */}
      <div role="group" aria-label="Category" className="flex overflow-x-auto border-b border-line bg-charcoal no-scrollbar">
        {[null, ...visibleCategories].map((category) => {
          const active = state.category === category;
          const count = category === null ? totalAll : counts[category];
          return (
            <button
              key={category ?? "all"} type="button" aria-pressed={active}
              onClick={() => onChange({ category })}
              className={`t-label min-h-[3rem] shrink-0 grow border-r border-line px-5 transition-colors sm:grow-0 ${active ? "bg-bone text-ink" : "text-dim hover:bg-elevated hover:text-bone"}`}
            >
              [ {category === null ? "All" : categoryLabel(category)} ({count}) ]
            </button>
          );
        })}
      </div>

      <div className="grid gap-px bg-line lg:grid-cols-12">
        <div className="bg-ink px-4 py-3 lg:col-span-4 lg:px-10">
          <label className="t-label text-dim" htmlFor="floor-search">Search make or model</label>
          <div className="relative mt-1">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
            <input
              id="floor-search" type="search" value={state.q} autoComplete="off" maxLength={80} placeholder="e.g. BMW or Creta"
              onChange={(event) => onChange({ q: event.target.value })} className="input pl-10"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 bg-ink px-4 py-3 lg:col-span-4">
          <PriceBox label="Min price (₹)" value={state.min} onCommit={(min) => onChange({ min })} error={priceOrderError} />
          <span aria-hidden="true" className="pt-9 text-muted">–</span>
          <PriceBox label="Max price (₹)" value={state.max} onCommit={(max) => onChange({ max })} />
        </div>

        <div className="flex flex-wrap items-end gap-3 bg-ink px-4 py-3 lg:col-span-4 lg:pr-10">
          <button
            type="button" aria-pressed={state.inStockOnly} onClick={() => onChange({ inStockOnly: !state.inStockOnly })}
            className={`t-label inline-flex min-h-[2.75rem] items-center gap-2 border px-3 ${state.inStockOnly ? "border-signal text-bone" : "border-line text-dim hover:text-bone"}`}
          >
            <span aria-hidden="true" className={`h-2 w-2 ${state.inStockOnly ? "bg-signal" : "bg-muted"}`} />
            In stock only
          </button>
          <div className="min-w-[10rem] flex-1">
            <label className="t-label text-dim" htmlFor="floor-sort">Sort by</label>
            <select id="floor-sort" value={state.sort} onChange={(event) => onChange({ sort: event.target.value as SortKey })} className="input mt-1">
              {SORT_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-charcoal px-4 py-3 lg:px-10">
        <p className="t-label mr-2 text-dim" role="status" aria-live="polite">
          {resultCount} {resultCount === 1 ? "vehicle" : "vehicles"}{chips.length > 0 ? ` of ${totalAll}` : ""}
        </p>
        {chips.map((chip) => (
          <button
            key={chip.id} type="button" onClick={() => onChange(chip.clear)} aria-label={`Remove filter: ${chip.label}`}
            className="tag min-h-[2rem] border-line-active text-bone hover:border-signal"
          >
            {chip.label}
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        ))}
        {chips.length > 0 ? (
          <button type="button" onClick={onClear} className="t-label ml-1 min-h-[2rem] px-2 text-signal underline underline-offset-4">Clear filters</button>
        ) : null}
      </div>
    </section>
  );
}
