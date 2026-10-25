import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Marquee, Star } from "../ui/Marquee";

/**
 * Footer. Every claim is something the app actually does. (The reference design listed a live telemetry feed,
 * payment-protocol badges and a refresh tick that do not exist, so they are not here.)
 */
export function SiteFooter() {
  const { user, isAdmin } = useAuth();
  const links: { to: string; label: string }[] = user
    ? [
        { to: "/floor", label: "The Floor" }, { to: "/watchlist", label: "Watchlist" }, { to: "/compare", label: "Compare" },
        { to: "/cart", label: "Cart" }, { to: "/history", label: "Purchase history" },
        ...(isAdmin ? [{ to: "/ledger", label: "The Ledger" }] : []),
      ]
    : [{ to: "/floor", label: "The Floor" }, { to: "/login", label: "Sign in" }, { to: "/register", label: "Register" }];

  return (
    <footer className="relative z-20 border-t border-line bg-ink">
      <Marquee label="Dealership slogan" className="border-b border-line bg-charcoal py-2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="t-md flex items-center gap-8">LET'S MOVE SOME METAL <Star /></span>
        ))}
      </Marquee>

      <div className="grid border-b border-line md:grid-cols-4">
        <section className="border-b border-line p-6 md:border-b-0 md:border-r lg:p-10">
          <p className="t-label mb-4 text-muted">[ How buying works ]</p>
          <h2 className="t-sm mb-3">One unit at a time</h2>
          <p className="text-sm text-dim">Purchasing records a sale and reduces the stock count. No payment details are collected in this application.</p>
        </section>
        <nav aria-label="Footer" className="border-b border-line p-6 md:border-b-0 md:border-r lg:p-10">
          <p className="t-label mb-4 text-muted">[ Directory ]</p>
          <ul className="space-y-2">
            {links.map((link, i) => (
              <li key={link.to}><Link to={link.to} className="t-data text-dim hover:text-signal">{String(i + 1).padStart(2, "0")}. {link.label}</Link></li>
            ))}
          </ul>
        </nav>
        <section className="border-b border-line p-6 md:border-b-0 md:border-r lg:p-10">
          <p className="t-label mb-4 text-muted">[ Details ]</p>
          <dl className="t-data space-y-2">
            <div className="flex justify-between gap-4 border-b border-line pb-2"><dt className="text-dim">Currency</dt><dd>INR (₹)</dd></div>
            <div className="flex justify-between gap-4 border-b border-line pb-2"><dt className="text-dim">Low stock</dt><dd>2 units or fewer</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-dim">Stock data</dt><dd>Dealership API</dd></div>
          </dl>
        </section>
        <section className="bg-charcoal p-6 lg:p-10">
          <p className="t-label mb-4 text-muted">[ Demo notice ]</p>
          <p className="text-sm text-dim">Your cart, watchlist, comparison list, purchase history and the stock-movement log are saved in this browser only. They are demonstration data and are not shared between devices or people.</p>
        </section>
      </div>

      <div className="flex flex-col items-center gap-3 overflow-hidden px-4 py-10 text-center">
        <p aria-hidden="true" className="select-none font-display font-extrabold uppercase leading-[0.8] tracking-tighter text-bone/90" style={{ fontSize: "clamp(3.5rem, 17vw, 14rem)" }}>Ignition</p>
        <p className="t-label text-muted">© {new Date().getFullYear()} IGNITION · Car dealership inventory</p>
      </div>
    </footer>
  );
}
