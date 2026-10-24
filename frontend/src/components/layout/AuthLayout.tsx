import type { ReactNode } from "react";
import { Logo } from "../ui/Logo";

/** Split screen on desktop (brand panel + form); on phones the photo becomes a slim header strip. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-dark lg:block" aria-hidden="true">
        <img src="/images/showroom-hero.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-brand-dark/20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo light />
          <div className="max-w-md">
            <p className="font-display text-6xl font-bold leading-[1.02] text-white">Every car, in stock and in sight.</p>
            <p className="mt-5 text-lg text-white/85">Browse the floor, bring a car into view, and purchase it in one click.</p>
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <div className="relative h-36 overflow-hidden bg-brand-dark lg:hidden" aria-hidden="true">
          <img src="/images/showroom-hero.webp" alt="" className="h-full w-full object-cover object-[70%_60%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />
          <Logo light className="absolute bottom-3 left-4" />
        </div>
        <main id="main" className="flex flex-1 items-start justify-center px-4 py-8 sm:px-8 lg:items-center lg:py-10">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
            <h1 className="text-4xl font-bold">{title}</h1>
            <p className="mt-2 text-muted">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
