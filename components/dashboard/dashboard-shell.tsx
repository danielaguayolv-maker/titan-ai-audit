"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { TitanLogo } from "@/components/shared/titan-logo";
import type { TitanAuthSession } from "@/lib/titan-auth";
import type { TitanWorkspacePersistenceEnvelope } from "@/lib/workspace-persistence";

export type TitanOsModule =
  | "home"
  | "audit"
  | "titan-studio"
  | "trend-finder"
  | "competitor-intelligence"
  | "content-planner"
  | "reports";

type DashboardShellProps = {
  children: ReactNode;
  activeModule: TitanOsModule;
  onModuleChange: (module: TitanOsModule) => void;
  onLogout: () => void;
  workspaceEnvelope: TitanWorkspacePersistenceEnvelope;
  session: TitanAuthSession;
};

const modules: Array<{
  id: TitanOsModule;
  label: string;
  eyebrow: string;
  description: string;
}> = [
  {
    id: "home",
    label: "Command Center",
    eyebrow: "Home",
    description:
      "Start here for the connected visibility workflow across audit, execution, and reports."
  },
  {
    id: "audit",
    label: "Visibility Audit",
    eyebrow: "Intelligence",
    description:
      "Scan Instagram, TikTok, or business pages and identify the visibility gaps blocking growth."
  },
  {
    id: "titan-studio",
    label: "Titan Studio",
    eyebrow: "Execution",
    description:
      "AI-powered content execution and visibility workflow system."
  },
  {
    id: "trend-finder",
    label: "Trend Finder",
    eyebrow: "Signals",
    description:
      "Surface content angles, search patterns, and timely visibility opportunities."
  },
  {
    id: "competitor-intelligence",
    label: "Competitor Intelligence",
    eyebrow: "Market",
    description:
      "Compare positioning, proof, content rhythm, and conversion signals against local competitors."
  },
  {
    id: "content-planner",
    label: "Content Planner",
    eyebrow: "Calendar",
    description:
      "Organize approved Titan Studio outputs into a practical publishing rhythm."
  },
  {
    id: "reports",
    label: "Reports",
    eyebrow: "Client-ready",
    description:
      "Package visibility intelligence, recommendations, and next steps into polished PDF reports."
  }
];

export function DashboardShell({
  children,
  activeModule,
  onLogout,
  onModuleChange,
  session,
  workspaceEnvelope
}: DashboardShellProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousModuleRef = useRef<TitanOsModule>(activeModule);

  useEffect(() => {
    if (previousModuleRef.current === activeModule) {
      return;
    }

    previousModuleRef.current = activeModule;

    const isMobileLayout = window.matchMedia("(max-width: 1023px)").matches;

    if (!isMobileLayout) {
      return;
    }

    window.requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });
    });
  }, [activeModule]);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="sticky top-0 z-30 border-b border-titan-gold/10 bg-titan-black/72 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link className="min-w-0 transition hover:opacity-90" href="/" aria-label="Titan Visibility OS home">
            <TitanLogo label="Titan Visibility OS" />
          </Link>
          <Link
            className="luxury-border hidden min-h-11 items-center rounded-full bg-white/5 px-5 text-sm font-bold uppercase text-titan-ivory transition hover:border-titan-bright hover:bg-white/10 sm:inline-flex"
            href="/"
          >
            Landing
          </Link>
          <button
            className="luxury-border inline-flex min-h-11 items-center rounded-full bg-white/5 px-5 text-sm font-bold uppercase text-titan-ivory transition hover:border-titan-bright hover:bg-white/10"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
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
            <p className="titan-copy mt-3 text-sm text-titan-ivory/58">
              AI-powered visibility intelligence and execution system for
              creators and businesses.
            </p>
          </div>

          <WorkspaceStatusPanel
            session={session}
            workspaceEnvelope={workspaceEnvelope}
          />

          <nav className="mt-4 grid gap-2" aria-label="Titan Visibility OS modules">
            {modules.map((module) => {
              const isActive = module.id === activeModule;

              return (
                <button
                  aria-controls="titan-module-content"
                  aria-current={isActive ? "page" : undefined}
                  className={`group min-w-0 rounded-lg border p-4 text-left transition ${
                    isActive
                      ? "border-titan-bright bg-titan-gold text-black shadow-gold"
                      : "titan-signal-card text-titan-ivory"
                  }`}
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  title={module.description}
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
                  <span
                    className={`text-anywhere mt-2 block text-xs leading-5 ${
                      isActive ? "text-black/62" : "text-titan-ivory/48"
                    }`}
                  >
                    {module.description}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div
          className="min-w-0 max-w-full scroll-mt-24 lg:scroll-mt-0"
          id="titan-module-content"
          ref={contentRef}
        >
          {children}
        </div>
      </div>
    </main>
  );
}

function WorkspaceStatusPanel({
  session,
  workspaceEnvelope
}: {
  session: TitanAuthSession;
  workspaceEnvelope: TitanWorkspacePersistenceEnvelope;
}) {
  const activeWorkspace =
    workspaceEnvelope.workspaces.find(
      (workspace) => workspace.id === workspaceEnvelope.activeWorkspaceId
    ) ?? workspaceEnvelope.workspaces[0];

  return (
    <section className="premium-surface mt-4 rounded-lg p-4">
      <p className="text-xs font-black uppercase text-titan-muted">
        Workspace
      </p>
      <h2 className="text-anywhere mt-2 text-lg font-black text-titan-ivory">
        {activeWorkspace?.name ?? "Titan Workspace"}
      </h2>
      <p className="mt-2 text-xs leading-5 text-titan-ivory/54">
        {session.user.email}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="titan-chip bg-titan-gold/10 text-[10px] font-black uppercase text-titan-bright">
          {session.mode === "supabase" ? "Supabase Auth" : "Local mode"}
        </span>
        <span className="titan-chip bg-white/10 text-[10px] font-bold uppercase text-titan-ivory/60">
          {workspaceEnvelope.auditedAccounts.length} accounts
        </span>
      </div>
      <div className="mt-4 rounded-lg border border-titan-gold/10 bg-black/24 p-3">
        <p className="text-[10px] font-black uppercase text-titan-muted">
          Current strategic mission
        </p>
        <p className="mt-2 text-xs leading-5 text-titan-ivory/64">
          {activeWorkspace?.currentStrategicMission ??
            "Track visibility movement over time."}
        </p>
      </div>
      <div className="mt-4 grid gap-2">
        {(activeWorkspace?.pinnedPriorities ?? []).slice(0, 3).map((priority) => (
          <p
            className="rounded-lg border border-titan-gold/10 bg-black/20 p-2 text-xs leading-5 text-titan-ivory/58"
            key={priority}
          >
            {priority}
          </p>
        ))}
      </div>
    </section>
  );
}
