import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "signal" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const VARIANT_CLASS: Record<ButtonVariant, string> = { signal: "btn-signal", ghost: "btn-ghost", danger: "btn-danger" };

/** Class string for anything that should look like a button (a <Link>, for example). */
export const buttonClass = (variant: ButtonVariant = "ghost", size: ButtonSize = "md", extra = ""): string =>
  `btn ${VARIANT_CLASS[variant]} ${size === "sm" ? "btn-sm" : ""} ${extra}`.trim();

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks clicks while an action is in flight (also stops double submits). */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "ghost", size = "md", loading = false, disabled, className = "", children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {loading ? <span aria-hidden="true" className="h-3.5 w-3.5 animate-spin border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
});
