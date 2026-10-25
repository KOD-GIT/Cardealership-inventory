import type { ReactNode } from "react";
import { VehicleImage } from "../ui/VehicleImage";

/** Split screen for sign in / register: a big heading and photograph on one side, the form on the other. */
export function AuthShell({ overline, title, subtitle, children }: { overline: string; title: ReactNode; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-charcoal lg:flex">
        <div className="relative z-10 p-10">
          <p className="t-label mb-6 flex items-center gap-2 text-dim"><span aria-hidden="true" className="h-2 w-2 bg-signal" />{overline}</p>
          <p className="t-xl">{title}</p>
        </div>
        <div className="relative min-h-[18rem] flex-1 border-t border-line">
          <VehicleImage src="/images/vehicles/amg-gt63s-front.jpg" alt="" eager />
        </div>
      </section>
      <section className="flex items-center justify-center p-4 py-12 sm:p-10">
        <div className="w-full max-w-md">
          <p className="t-label mb-4 flex items-center gap-2 text-dim lg:hidden"><span aria-hidden="true" className="h-2 w-2 bg-signal" />{overline}</p>
          <h1 className="t-lg mb-3">{title}</h1>
          <p className="mb-8 text-dim">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}
