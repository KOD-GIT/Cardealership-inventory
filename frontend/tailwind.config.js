/**
 * Design tokens for IGNITION (kinetic brutalism). Palette and geometry follow the design brief:
 * square corners everywhere, hairline borders instead of shadows, one orange signal colour.
 * Muted/dim text opacities are chosen so every text colour clears WCAG AA (4.5:1) on #0C0C0C, #141414
 * and #1C1C1C (the reference export used 35% bone text, which does not).
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // Zero radius, no shadows: depth comes from tone and hairlines only.
    borderRadius: { none: "0", DEFAULT: "0", sm: "0", md: "0", lg: "0", xl: "0", "2xl": "0", "3xl": "0", full: "0" },
    boxShadow: { none: "none" },
    extend: {
      colors: {
        ink: "#0C0C0C", // main background
        charcoal: "#141414", // secondary surface
        elevated: "#1C1C1C", // active cells and hover plates
        bone: "#EDE9E1", // primary text
        signal: { DEFAULT: "#FF4A1C", ink: "#120500", hot: "#FF6C47" }, // primary action accent
        lime: "#C8FF3E", // positive stock indicator, used sparingly
        dim: "rgba(237,233,225,0.72)", // secondary text
        muted: "rgba(237,233,225,0.56)", // tertiary text (>= 4.5:1 on all three surfaces)
        line: {
          DEFAULT: "rgba(237,233,225,0.12)", // hairline divisions
          subtle: "rgba(237,233,225,0.06)",
          active: "rgba(237,233,225,0.45)",
        },
      },
      fontFamily: {
        display: ["Syne", "Impact", "Arial Narrow", "sans-serif"],
        sans: ['"Inter Variable"', "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', "ui-monospace", "Consolas", "monospace"],
      },
      fontSize: {
        // [size, line-height]; labels are never below 12px
        label: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
        data: ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.02em" }],
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in-right": { from: { transform: "translateX(100%)" }, to: { transform: "none" } },
        "slide-up": { from: { transform: "translateY(12px)", opacity: "0" }, to: { transform: "none", opacity: "1" } },
        flash: { "0%": { opacity: "1" }, "100%": { opacity: "0" } },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "fade-in": "fade-in 160ms ease-out",
        "slide-in-right": "slide-in-right 280ms cubic-bezier(.22,1,.36,1)",
        "slide-up": "slide-up 220ms cubic-bezier(.22,1,.36,1)",
        flash: "flash 240ms ease-out forwards",
      },
    },
  },
  plugins: [],
};
