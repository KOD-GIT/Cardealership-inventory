/** Design tokens for "Showroom". Contrast of every text/background pair was checked against WCAG AA. */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F2F4F6",          // page background
        ink: "#12161C",             // primary text
        muted: "#566174",           // secondary text (spec #64748B fails AA on canvas)
        line: "#DDE3EA",            // borders and dividers
        brand: { DEFAULT: "#0E6B66", dark: "#094F4B", tint: "#E6F3F2" },
        success: { DEFAULT: "#1F7A4D", tint: "#D1FADF" },
        // `DEFAULT` is for dots/icons; `ink` is the AA-safe text colour on `tint`
        warning: { DEFAULT: "#B7791F", ink: "#7A4E08", tint: "#FEF3C7" },
        danger: { DEFAULT: "#B42318", tint: "#FEE4E2" },
      },
      fontFamily: {
        display: ['"Archivo Narrow Variable"', '"Archivo Narrow"', '"Arial Narrow"', "sans-serif"],
        sans: ['"IBM Plex Sans Variable"', '"IBM Plex Sans"', "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(18, 22, 28, 0.05)",
        lift: "0 10px 25px -5px rgba(18, 22, 28, 0.12)",
      },
      keyframes: {
        "toast-in": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: { "toast-in": "toast-in 180ms ease-out" },
    },
  },
  plugins: [],
};
