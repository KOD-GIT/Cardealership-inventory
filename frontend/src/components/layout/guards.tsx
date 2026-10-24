import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/** Signed-out visitors are sent to /login and returned to where they were headed afterwards. */
export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Only admins pass; everyone else goes back to the dashboard (the API enforces this too). */
export function AdminRoute() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Login/register pages: already signed in -> straight to the dashboard. */
export function GuestRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
