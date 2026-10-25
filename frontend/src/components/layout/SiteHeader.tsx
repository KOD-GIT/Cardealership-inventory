import { Heart, Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useShopUi } from "../../context/ShopUiContext";
import { useCart, useCompare, useWatchlist } from "../../hooks/useShop";
import { CART_TARGET_ATTR } from "../../lib/flyToCart";
import { buttonClass } from "../ui/Button";
import { Logo } from "../ui/Logo";

interface NavItem { to: string; label: string; count?: number }

/** Every link here goes to a real route. The Ledger is shown to administrator sessions only. */
function useNavItems(): NavItem[] {
  const { user, isAdmin } = useAuth();
  const watchlist = useWatchlist();
  const compare = useCompare();
  if (!user) return [{ to: "/floor", label: "The Floor" }];
  const items: NavItem[] = [
    { to: "/floor", label: "The Floor" },
    { to: "/watchlist", label: "Watchlist", count: watchlist.ids.length },
    { to: "/compare", label: "Compare", count: compare.ids.length },
    { to: "/history", label: "Purchases" },
  ];
  if (isAdmin) items.push({ to: "/ledger", label: "The Ledger" });
  return items;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `t-label flex h-full min-h-[2.75rem] items-center gap-2 border-b-2 px-1 transition-colors ${isActive ? "border-signal text-bone" : "border-transparent text-dim hover:text-bone"}`;

export function SiteHeader() {
  const { user, logout } = useAuth();
  const cart = useCart();
  const { openCart } = useShopUi();
  const items = useNavItems();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]);

  // Only log out: a protected page then sends you to Sign in (same as an expired session); a public page stays put.
  const signOut = logout;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink pt-[env(safe-area-inset-top)]">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-10">
        <div className="flex h-full items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden h-full items-center gap-6 md:flex">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} end className={linkClass}>
                {item.label}
                {item.count ? <span className="t-data text-signal" aria-label={`${item.count} saved`}>{item.count}</span> : null}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button
                type="button" onClick={openCart} {...{ [CART_TARGET_ATTR]: "" }}
                aria-label={`Open cart, ${cart.count} ${cart.count === 1 ? "unit" : "units"}`}
                className="btn btn-signal relative !min-h-[2.75rem] !px-3 sm:!px-4"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                <span className="whitespace-nowrap">
                  <span className="hidden sm:inline">[ Cart : {cart.count} ]</span>
                  <span className="sm:hidden" aria-hidden="true">[ {cart.count} ]</span>
                </span>
              </button>
              <span className="t-label hidden max-w-[11rem] truncate border-l border-line pl-3 text-dim lg:inline" title={user.email}>{user.email}</span>
              <button type="button" onClick={signOut} className={buttonClass("ghost", "sm", "hidden md:inline-flex")}>Log out</button>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className={buttonClass("ghost", "sm")}>Sign in</Link>
              <Link to="/register" className={buttonClass("signal", "sm")}>Register</Link>
            </div>
          )}
          <button
            type="button" className="icon-btn md:hidden" aria-expanded={menuOpen} aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-nav" aria-label="Main (mobile)" className="border-t border-line bg-charcoal md:hidden">
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end className={({ isActive }) => `t-label flex min-h-[3rem] items-center justify-between px-4 ${isActive ? "text-signal" : "text-bone"}`}>
                  <span>{item.label}</span>
                  {item.count ? <span className="t-data inline-flex items-center gap-1 text-signal">{item.label === "Watchlist" ? <Heart className="h-3.5 w-3.5" aria-hidden="true" /> : null}{item.count}</span> : null}
                </NavLink>
              </li>
            ))}
            <li className="p-4">
              {user ? (
                <button type="button" onClick={signOut} className={buttonClass("ghost", "md", "w-full")}>Log out ({user.email})</button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" className={buttonClass("ghost")}>Sign in</Link>
                  <Link to="/register" className={buttonClass("signal")}>Register</Link>
                </div>
              )}
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
