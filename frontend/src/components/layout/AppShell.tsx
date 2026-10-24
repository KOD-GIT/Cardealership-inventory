import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

/** Frame for every signed-in page: skip link, top bar, centred content column. */
export function AppShell() {
  return (
    <div className="min-h-screen bg-canvas">
      <a href="#main" className="sr-only rounded-lg bg-brand px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70]">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 outline-none sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
