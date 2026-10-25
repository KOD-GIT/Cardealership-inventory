import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminRoute, GuestRoute, ProtectedRoute } from "./components/layout/guards";
import { Skeleton } from "./components/ui/Skeleton";
import CartPage from "./pages/CartPage";
import ComparePage from "./pages/ComparePage";
import FloorPage from "./pages/FloorPage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import VehiclePage from "./pages/VehiclePage";
import WatchlistPage from "./pages/WatchlistPage";

// Administrator code (forms, tables, CSV export) is only downloaded by administrators.
const LedgerPage = lazy(() => import("./pages/LedgerPage"));

/**
 * Routes. The frontend guards below only decide what to SHOW. Every request is still authorised by the API
 * (a missing or invalid token gets 401, a non-admin gets 403), so hiding a route is never the security.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="floor" element={<FloorPage />} />
          <Route path="vehicle/:id" element={<VehiclePage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route element={<AdminRoute />}>
            <Route path="ledger" element={<Suspense fallback={<Skeleton className="m-4 h-64 lg:m-10" />}><LedgerPage /></Suspense>} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
