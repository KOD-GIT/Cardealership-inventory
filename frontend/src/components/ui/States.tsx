import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, buttonClass } from "./Button";

/** Friendly "nothing here" block with an optional next step. */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: { label: string; to?: string; onClick?: () => void } }) {
  return (
    <div className="flex flex-col items-start gap-4 border border-line bg-charcoal p-8 sm:p-12">
      <span aria-hidden="true" className="h-3 w-3 bg-signal" />
      <h2 className="t-lg">{title}</h2>
      {children ? <p className="max-w-xl text-dim">{children}</p> : null}
      {action?.to ? <Link to={action.to} className={buttonClass("signal")}>{action.label}</Link> : null}
      {action?.onClick ? <Button variant="signal" onClick={action.onClick}>{action.label}</Button> : null}
    </div>
  );
}

/** Used when a request fails: say what happened and offer to try again. */
export function ErrorState({ title = "Could not load the floor", message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4 border border-signal bg-charcoal p-8 sm:p-12">
      <span aria-hidden="true" className="h-3 w-3 bg-signal" />
      <h2 className="t-lg">{title}</h2>
      <p className="max-w-xl text-dim">{message ?? "Something went wrong while talking to the server."}</p>
      {onRetry ? <Button variant="signal" onClick={onRetry}>Try again</Button> : null}
    </div>
  );
}

/** Page title block used at the top of every screen: a small mono overline and a big Syne heading. */
export function PageHeader({ overline, title, children }: { overline: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="flex flex-col justify-between gap-6 border-b border-line px-4 pb-8 pt-10 lg:flex-row lg:items-end lg:px-10">
      <div>
        <p className="t-label mb-4 flex items-center gap-2 text-dim">
          <span aria-hidden="true" className="h-2 w-2 bg-signal" />
          {overline}
        </p>
        <h1 className="t-xl">{title}</h1>
      </div>
      {children}
    </header>
  );
}
