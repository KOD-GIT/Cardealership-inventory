import { LogOut } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? "bg-brand-tint text-brand" : "text-muted hover:text-ink"}`;

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-6">
          <Link to="/" aria-label="Showroom home" className="rounded-lg"><Logo compact /></Link>
          <nav aria-label="Main" className="flex items-center gap-0.5 sm:gap-1">
            <NavLink to="/" end className={linkClass}>Vehicles</NavLink>
            {isAdmin ? <NavLink to="/admin" className={linkClass}>Manage inventory</NavLink> : null}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden max-w-[16rem] truncate text-sm text-muted md:inline" title={user?.email}>{user?.email}</span>
          <span className="hidden sm:inline-flex"><Badge tone={isAdmin ? "brand" : "neutral"}>{isAdmin ? "Admin" : "User"}</Badge></span>
          <Button variant="secondary" size="sm" onClick={logout} aria-label="Log out" className="whitespace-nowrap px-2.5 sm:px-3">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
