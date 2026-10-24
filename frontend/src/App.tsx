import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AdminRoute, GuestRoute, ProtectedRoute } from "./components/layout/guards";
import { Skeleton } from "./components/ui/Skeleton";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";

// Admin code is only downloaded by admins.
const AdminPage = lazy(() => import("./pages/AdminPage"));

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<Suspense fallback={<Skeleton className="h-64 w-full" />}><AdminPage /></Suspense>} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
