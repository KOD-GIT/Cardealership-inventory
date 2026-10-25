import { Eye, EyeOff } from "lucide-react";
import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, useId, useState } from "react";

interface ShellProps { id: string; label: string; hint?: string; error?: string; optional?: boolean; children: ReactNode }

/** Visible label + control + hint/error, wired together for screen readers. */
function Shell({ id, label, hint, error, optional, children }: ShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="t-label text-dim">
        {label}
        {optional ? <span className="ml-1 normal-case text-muted">(optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-signal">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);
type Common = { label: string; hint?: string; error?: string; optional?: boolean };

export const TextField = forwardRef<HTMLInputElement, Common & InputHTMLAttributes<HTMLInputElement>>(
  function TextField({ label, hint, error, optional, className = "", ...rest }, ref) {
    const id = useId();
    return (
      <Shell id={id} label={label} hint={hint} error={error} optional={optional}>
        <input
          ref={ref} id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)}
          className={`input ${className}`} {...rest}
        />
      </Shell>
    );
  },
);

/** Password box with a show/hide toggle. The toggle is a real button with a state the screen reader announces. */
export const PasswordField = forwardRef<HTMLInputElement, Common & Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(
  function PasswordField({ label, hint, error, optional, className = "", ...rest }, ref) {
    const id = useId();
    const [visible, setVisible] = useState(false);
    return (
      <Shell id={id} label={label} hint={hint} error={error} optional={optional}>
        <div className="relative">
          <input
            ref={ref} id={id} type={visible ? "text" : "password"} aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, error, hint)} className={`input pr-12 ${className}`} {...rest}
          />
          <button
            type="button" onClick={() => setVisible((v) => !v)} aria-pressed={visible}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-dim hover:text-bone"
          >
            {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </Shell>
    );
  },
);

export const SelectField = forwardRef<HTMLSelectElement, Common & SelectHTMLAttributes<HTMLSelectElement>>(
  function SelectField({ label, hint, error, optional, className = "", children, ...rest }, ref) {
    const id = useId();
    return (
      <Shell id={id} label={label} hint={hint} error={error} optional={optional}>
        <select
          ref={ref} id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)}
          className={`input ${className}`} {...rest}
        >
          {children}
        </select>
      </Shell>
    );
  },
);

/** Square checkbox: the box fills with bone when checked (no tick mark), as the design system specifies. */
export const CheckboxField = forwardRef<HTMLInputElement, { label: string; hint?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(
  function CheckboxField({ label, hint, className = "", ...rest }, ref) {
    const id = useId();
    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <input
          ref={ref} id={id} type="checkbox" aria-describedby={hint ? `${id}-hint` : undefined}
          className="peer mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none border border-line-active bg-charcoal checked:bg-bone checked:shadow-[inset_0_0_0_4px_#141414] disabled:cursor-not-allowed disabled:opacity-50"
          {...rest}
        />
        <div>
          <label htmlFor={id} className="cursor-pointer text-sm text-bone peer-disabled:cursor-not-allowed">{label}</label>
          {hint ? <span id={`${id}-hint`} className="block text-sm text-muted">{hint}</span> : null}
        </div>
      </div>
    );
  },
);
