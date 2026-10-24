import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark disabled:bg-line disabled:text-muted",
  secondary: "bg-white text-ink border border-line hover:bg-canvas disabled:text-muted",
  danger: "bg-danger text-white hover:bg-[#8E1C12] disabled:bg-line disabled:text-muted",
  ghost: "text-brand hover:bg-brand-tint disabled:text-muted",
};
const SIZES: Record<Size, string> = { sm: "h-9 px-3 text-sm", md: "h-11 px-4 text-base" };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and blocks clicks while an action is in flight. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, disabled, className = "", children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});
