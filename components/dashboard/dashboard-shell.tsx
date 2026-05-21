"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { TitanLogo } from "@/components/shared/titan-logo";

export type TitanOsModule =
  | "audit"
  | "contentbuddy"
  | "trend-finder"
  | "competitor-intelligence"
  | "content-planner"
  | "reports";

type DashboardShellProps = {
  children: ReactNode;
  activeModule: TitanOsModule;
  onModuleChange: (module: TitanOsModule) => void;
};

const modules: Array<{
  id: TitanOsModule;
  label: string;
  eyebrow: string;
}> = [
  { id: "audit", label: "Visibility Audit", eyebrow: "Scan" },
  { id: "contentbuddy", label: "ContentBuddy", eyebrow: "Plan" },
  { id: "trend-finder", label: "Trend Finder", eyebrow: "Signals" },
  {
    id: "competitor-intelligence",
    label: "Competitor Intelligence",
    eyebrow: "Market"
  },
  { id: "content-planner", label: "Content Planner", eyebrow: "Calendar" },
  { id: "reports", label: "Reports", eyebrow: "Client-ready" }
];

export function DashboardShell({
  children,
  activeModule,
  onModuleChange
}: DashboardShellProps) {
  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="sticky top-0 z-30 border-b border-titan-gold/10 bg-titan-black/72 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link className="min-w-0 transition hover:opacity-90" href="/" aria-label="Titan AI Audit home">
            <TitanLogo label="Titan Visibility OS" />
          </Link>
          <Link
            className="luxury-border hidden min-h-11 items-center rounded-full bg-white/5 px-5 text-sm font-bold uppercase text-titan-ivory transition hover:border-titan-bright hover:bg-white/10 sm:inline-flex"
            href="/"
          >
            Landing
          </Link>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-[92rem] grid-cols-1 gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-titan-gold/10 bg-black/18 px-5 py-5 sm:px-8 lg:sticky lg:top-[77px] lg:h-[calc(100vh-77px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5">
          <div className="premium-surface rounded-lg p-4">
            <p className="text-xs font-black uppercase text-titan-muted">
              Operating system
            </p>
            <h1 className="mt-2 text-2xl font-black leading-tight text-titan-ivory">
              Titan Visibility OS
            </h1>
            <p className="mt-3 text-sm leading-6 text-titan-ivory/58">
              Audit intelligence, content planning, trend signals, and reports
              in one premium workspace.
            </p>
          </div>

          <nav className="mt-4 grid gap-2" aria-label="Titan Visibility OS modules">
            {modules.map((module) => {
              const isActive = module.id === activeModule;

              return (
                <button
                  className={`group min-w-0 rounded-lg border p-4 text-left transition ${
                    isActive
                      ? "border-titan-bright bg-titan-gold text-black shadow-gold"
                      : "border-titan-gold/10 bg-white/[0.03] text-titan-ivory hover:border-titan-bright/50 hover:bg-white/[0.07]"
                  }`}
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  type="button"
                >
                  <span
                    className={`block text-xs font-black uppercase ${
                      isActive ? "text-black/60" : "text-titan-muted"
                    }`}
                  >
                    {module.eyebrow}
                  </span>
                  <span className="text-anywhere mt-1 block font-black">
                    {module.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 max-w-full">{children}</div>
      </div>
    </main>
  );
}
