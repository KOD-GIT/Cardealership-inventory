import { type KeyboardEvent, type ReactNode, useId, useRef } from "react";

export interface TabItem { id: string; label: string; content: ReactNode }

/** Accessible tabs: roving tabindex, Left/Right/Home/End move between them, the panel is labelled by its tab. */
export function Tabs({ tabs, active, onChange }: { tabs: TabItem[]; active: string; onChange: (id: string) => void }) {
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, tabs.findIndex((tab) => tab.id === active));

  const onKeyDown = (event: KeyboardEvent) => {
    const move = { ArrowRight: 1, ArrowLeft: -1 }[event.key as "ArrowRight" | "ArrowLeft"];
    let next = move === undefined ? -1 : (index + move + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Vehicle information" onKeyDown={onKeyDown} className="flex overflow-x-auto border-b border-line no-scrollbar">
        {tabs.map((tab, i) => {
          const selected = i === index;
          return (
            <button
              key={tab.id} ref={(el) => { refs.current[i] = el; }} role="tab" type="button"
              id={`${base}-tab-${tab.id}`} aria-selected={selected} aria-controls={`${base}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1} onClick={() => onChange(tab.id)}
              className={`t-label -mb-px min-h-[2.75rem] shrink-0 border-b-2 px-4 py-3 transition-colors ${selected ? "border-signal text-bone" : "border-transparent text-dim hover:text-bone"}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab, i) => (
        <div key={tab.id} role="tabpanel" id={`${base}-panel-${tab.id}`} aria-labelledby={`${base}-tab-${tab.id}`} hidden={i !== index} className="pt-6">
          {i === index ? tab.content : null}
        </div>
      ))}
    </div>
  );
}
