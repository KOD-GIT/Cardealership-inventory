import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShopUiProvider } from "../../context/ShopUiContext";
import { useScrollRestoration } from "../../hooks/useScrollRestoration";
import { CartDrawer } from "../cart/CartDrawer";
import { PurchaseHost } from "../cart/PurchaseHost";
import { QuickViewDrawer } from "../vehicles/QuickViewDrawer";
import { CompareTray } from "./CompareTray";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** The frame around every screen: skip link, header, page, footer, and the slide-over panels. */
export function AppLayout() {
  useScrollRestoration();
  const { user } = useAuth();
  return (
    <ShopUiProvider>
      <a
        href="#main"
        className="sr-only z-[100] bg-signal px-4 py-3 font-mono text-sm font-bold uppercase text-signal-ink focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="min-h-[60vh] outline-none">
        <Outlet />
      </main>
      <SiteFooter />
      {user ? (
        <>
          <CartDrawer />
          <QuickViewDrawer />
          <PurchaseHost />
          <CompareTray />
        </>
      ) : null}
    </ShopUiProvider>
  );
}
