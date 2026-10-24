import { Eye, EyeOff } from "lucide-react";
import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, useId, useState } from "react";

const CONTROL =
  "h-11 w-full rounded-[10px] border bg-white px-3 text-base text-ink placeholder:text-muted/80 transition-colors focus-visible:border-brand disabled:bg-canvas";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}

/** Label + control + hint/error, wired together for screen readers. */
function FieldShell({ id, label, hint, error, optional, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optional ? <span className="ml-1 font-normal text-muted">(optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

type CommonProps = { label: string; hint?: string; error?: string; optional?: boolean };

export const TextField = forwardRef<HTMLInputElement, CommonProps & InputHTMLAttributes<HTMLInputElement>>(
  function TextField({ label, hint, error, optional, className = "", ...rest }, ref) {
    const id = useId();
    return (
      <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
        <input
          ref={ref} id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)}
          className={`${CONTROL} ${error ? "border-danger" : "border-line"} ${className}`} {...rest}
        />
      </FieldShell>
    );
  },
);

export const PasswordField = forwardRef<HTMLInputElement, CommonProps & Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(
  function PasswordField({ label, hint, error, className = "", ...rest }, ref) {
    const id = useId();
    const [visible, setVisible] = useState(false);
    return (
      <FieldShell id={id} label={label} hint={hint} error={error}>
        <div className="relative">
          <input
            ref={ref} id={id} type={visible ? "text" : "password"} aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, error, hint)}
            className={`${CONTROL} pr-11 ${error ? "border-danger" : "border-line"} ${className}`} {...rest}
          />
          <button
            type="button" onClick={() => setVisible((v) => !v)} aria-pressed={visible}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:text-ink"
          >
            {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </FieldShell>
    );
  },
);

export const SelectField = forwardRef<HTMLSelectElement, CommonProps & SelectHTMLAttributes<HTMLSelectElement>>(
  function SelectField({ label, hint, error, optional, className = "", children, ...rest }, ref) {
    const id = useId();
    return (
      <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
        <select
          ref={ref} id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)}
          className={`${CONTROL} ${error ? "border-danger" : "border-line"} ${className}`} {...rest}
        >
          {children}
        </select>
      </FieldShell>
    );
  },
);
