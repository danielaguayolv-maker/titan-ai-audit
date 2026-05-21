import type { ReactNode } from "react";
import { TitanLogo } from "@/components/shared/titan-logo";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="sticky top-0 z-30 border-b border-titan-gold/10 bg-titan-black/72 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a className="min-w-0 transition hover:opacity-90" href="/" aria-label="Titan AI Audit home">
            <TitanLogo label="Titan AI Audit" />
          </a>
          <a
            className="luxury-border hidden min-h-11 items-center rounded-full bg-white/5 px-5 text-sm font-bold uppercase text-titan-ivory transition hover:border-titan-bright hover:bg-white/10 sm:inline-flex"
            href="/"
          >
            Landing
          </a>
        </div>
      </div>
      {children}
    </main>
  );
}
