"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { TitanLogo } from "@/components/shared/titan-logo";
import type { TitanAuthSession } from "@/lib/titan-auth";
import type {
  TitanWorkspacePersistenceEnvelope,
  TitanWorkspaceRecord
} from "@/lib/workspace-persistence";

export type TitanOsModule =
  | "home"
  | "audit"
  | "video-intelligence"
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
  onDemoWorkspacesCreate: () => void;
  onWorkspaceCreate: (name: string) => void;
  onWorkspaceNoteAdd: (note: string) => void;
  onWorkspaceSwitch: (workspaceId: string) => void;
  onWorkspaceViewModeChange: (mode: TitanWorkspaceRecord["viewMode"]) => void;
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
    id: "video-intelligence",
    label: "Video Intelligence",
    eyebrow: "Vision",
    description:
      "Upload one video and inspect hook strength, frames, CTA visibility, pacing, and retention risk."
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
  onDemoWorkspacesCreate,
  onModuleChange,
  onWorkspaceCreate,
  onWorkspaceNoteAdd,
  onWorkspaceSwitch,
  onWorkspaceViewModeChange,
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
            onWorkspaceCreate={onWorkspaceCreate}
            onDemoWorkspacesCreate={onDemoWorkspacesCreate}
            onWorkspaceNoteAdd={onWorkspaceNoteAdd}
            onWorkspaceSwitch={onWorkspaceSwitch}
            onWorkspaceViewModeChange={onWorkspaceViewModeChange}
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
  onWorkspaceCreate,
  onDemoWorkspacesCreate,
  onWorkspaceNoteAdd,
  onWorkspaceSwitch,
  onWorkspaceViewModeChange,
  session,
  workspaceEnvelope
}: {
  onWorkspaceCreate: (name: string) => void;
  onDemoWorkspacesCreate: () => void;
  onWorkspaceNoteAdd: (note: string) => void;
  onWorkspaceSwitch: (workspaceId: string) => void;
  onWorkspaceViewModeChange: (mode: TitanWorkspaceRecord["viewMode"]) => void;
  session: TitanAuthSession;
  workspaceEnvelope: TitanWorkspacePersistenceEnvelope;
}) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [note, setNote] = useState("");
  const activeWorkspace =
    workspaceEnvelope.workspaces.find(
      (workspace) => workspace.id === workspaceEnvelope.activeWorkspaceId
    ) ?? workspaceEnvelope.workspaces[0];
  const activeWorkspaceAccounts = workspaceEnvelope.auditedAccounts.filter(
    (account) => account.workspaceId === activeWorkspace?.id
  );
  const activeTimeline = workspaceEnvelope.strategicTimeline.filter(
    (item) => item.workspaceId === activeWorkspace?.id
  );

  function submitWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!workspaceName.trim()) {
      return;
    }

    onWorkspaceCreate(workspaceName.trim());
    setWorkspaceName("");
  }

  function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!note.trim()) {
      return;
    }

    onWorkspaceNoteAdd(note.trim());
    setNote("");
  }

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
      <label className="mt-4 block text-xs font-black uppercase text-titan-muted">
        Switch workspace
        <select
          className="mt-2 w-full rounded-lg border border-titan-gold/15 bg-black/40 px-3 py-3 text-sm font-bold normal-case text-titan-ivory outline-none transition focus:border-titan-bright"
          onChange={(event) => onWorkspaceSwitch(event.target.value)}
          value={activeWorkspace?.id ?? ""}
        >
          {workspaceEnvelope.workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>
      </label>
      <form className="mt-3 flex gap-2" onSubmit={submitWorkspace}>
        <input
          className="min-w-0 flex-1 rounded-full border border-titan-gold/15 bg-black/35 px-3 py-2 text-xs text-titan-ivory outline-none placeholder:text-titan-ivory/30 focus:border-titan-bright"
          onChange={(event) => setWorkspaceName(event.target.value)}
          placeholder="New client workspace"
          value={workspaceName}
        />
        <button
          className="shrink-0 rounded-full bg-titan-gold px-3 py-2 text-[10px] font-black uppercase text-black transition hover:bg-titan-bright"
          type="submit"
        >
          Add
        </button>
      </form>
      <button
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-titan-gold/20 bg-titan-gold/10 px-4 text-[10px] font-black uppercase text-titan-bright transition hover:border-titan-bright hover:bg-titan-gold hover:text-black"
        onClick={onDemoWorkspacesCreate}
        type="button"
      >
        Load Demo Workspaces
      </button>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="titan-chip bg-titan-gold/10 text-[10px] font-black uppercase text-titan-bright">
          {session.mode === "supabase" ? "Supabase Auth" : "Local mode"}
        </span>
        <span className="titan-chip bg-white/10 text-[10px] font-bold uppercase text-titan-ivory/60">
          {activeWorkspaceAccounts.length} accounts
        </span>
        <span className="titan-chip bg-white/10 text-[10px] font-bold uppercase text-titan-ivory/60">
          {workspaceEnvelope.workspaces.length} workspaces
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["strategist", "client"] as const).map((mode) => (
          <button
            className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase transition ${
              activeWorkspace?.viewMode === mode
                ? "border-titan-bright bg-titan-gold text-black"
                : "border-titan-gold/15 bg-white/[0.03] text-titan-ivory/60 hover:border-titan-bright"
            }`}
            key={mode}
            onClick={() => onWorkspaceViewModeChange(mode)}
            type="button"
          >
            {mode === "strategist" ? "Internal" : "Client"}
          </button>
        ))}
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
      <form className="mt-4 rounded-lg border border-titan-gold/10 bg-black/20 p-3" onSubmit={submitNote}>
        <p className="text-[10px] font-black uppercase text-titan-muted">
          Strategist note
        </p>
        <textarea
          className="mt-2 min-h-20 w-full rounded-lg border border-titan-gold/10 bg-black/30 px-3 py-2 text-xs leading-5 text-titan-ivory outline-none placeholder:text-titan-ivory/30 focus:border-titan-bright"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Campaign observation, client request, meeting reminder..."
          value={note}
        />
        <button
          className="mt-2 inline-flex min-h-9 w-full items-center justify-center rounded-full border border-titan-gold/20 bg-white/[0.04] px-3 text-[10px] font-black uppercase text-titan-bright transition hover:border-titan-bright"
          type="submit"
        >
          Save Note
        </button>
      </form>
      <div className="mt-4 rounded-lg border border-titan-gold/10 bg-black/20 p-3">
        <p className="text-[10px] font-black uppercase text-titan-muted">
          Recent timeline
        </p>
        <div className="mt-2 grid gap-2">
          {activeTimeline.slice(0, 3).map((item) => (
            <p
              className="text-anywhere rounded-md bg-white/[0.03] p-2 text-xs leading-5 text-titan-ivory/58"
              key={item.id}
            >
              {item.title}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
