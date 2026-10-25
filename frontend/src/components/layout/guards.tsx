import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { safeReturnPath } from "../../lib/safeRedirect";

/**
 * Signed-out visitors are sent to /login and returned to exactly where they were headed afterwards, including
 * the query string (a Floor search, a vehicle link). This is a convenience, NOT security: the API rejects
 * requests without a valid token no matter what the browser shows.
 */
export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  return <Outlet />;
}

/** Only administrators see the ledger. The server enforces this on every request too. */
export function AdminRoute() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Login/register pages: already signed in -> back to where you were headed, or home. */
export function GuestRoute() {
  const { user } = useAuth();
  const location = useLocation();
  if (user) return <Navigate to={safeReturnPath((location.state as { from?: string } | null)?.from)} replace />;
  return <Outlet />;
}
