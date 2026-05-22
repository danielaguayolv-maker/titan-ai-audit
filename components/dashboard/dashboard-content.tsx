"use client";

import { useEffect, useState } from "react";
import { createFallbackAuditResult } from "@/lib/audit-fallback";
import type {
  AiAuditResult,
  AuditPlatform,
  BusinessAuditFormData,
  LiveScanResult,
  ProfileData
} from "@/lib/audit-ai";
import {
  clearJsonStorage,
  readJsonStorage,
  titanStudioPlanStorageKey,
  titanWorkspaceStorageKey,
  writeJsonStorage,
  type PersistedAuditWorkspace
} from "@/lib/workspace-persistence";
import {
  emptyVisibilityMemoryDebug,
  normalizeAccountKey,
  saveMemoryAudit,
  type VisibilityMemoryDebugState,
  type VisibilityMemoryEntry
} from "@/lib/visibility-memory";
import { AiAuditPanel, type RequestStatus } from "./ai-audit-panel";
import { AuditAssets } from "./audit-assets";
import { CategoryScores } from "./category-scores";
import { CompetitorIntelligence } from "./competitor-intelligence";
import { DashboardStates } from "./dashboard-states";
import { DashboardShell, type TitanOsModule } from "./dashboard-shell";
import { QuickWins } from "./quick-wins";
import { ScoreSummary } from "./score-summary";
import { StrategyCta } from "./strategy-cta";
import { TitanStudio } from "./titan-studio";
import { VisibilityMemoryPanel } from "./visibility-memory-panel";

export function DashboardContent() {
  const initialPlatform: AuditPlatform = "instagram";
  const [activeModule, setActiveModule] = useState<TitanOsModule>("home");
  const [auditResult, setAuditResult] = useState<AiAuditResult>(() =>
    createFallbackAuditResult(initialPlatform)
  );
  const [isUsingFallback, setIsUsingFallback] = useState(true);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [platform, setPlatform] = useState<AuditPlatform>(initialPlatform);
  const [profileUrl, setProfileUrl] = useState("");
  const [memoryAccountKey, setMemoryAccountKey] = useState("");
  const [memoryRevision, setMemoryRevision] = useState(0);
  const [memoryDebug, setMemoryDebug] =
    useState<VisibilityMemoryDebugState>(emptyVisibilityMemoryDebug);
  const [memoryEntriesSnapshot, setMemoryEntriesSnapshot] = useState<
    VisibilityMemoryEntry[]
  >([]);
  const [pendingMemorySave, setPendingMemorySave] = useState<{
    result: AiAuditResult;
    context: { formData: BusinessAuditFormData; profileData: ProfileData | null };
  } | null>(null);
  const [planContext, setPlanContext] = useState<{
    formData?: BusinessAuditFormData;
    profileData?: ProfileData | null;
  }>({});
  const [liveScan, setLiveScan] = useState<LiveScanResult>({
    status: "skipped",
    message: "Live Scan: Ready",
    dataPointsFound: [],
    missingDataPoints: [],
    scanCompleteness: 0,
    confidenceScore: 0,
    metricsStatus: "limited"
  });

  useEffect(() => {
    const savedWorkspace = readJsonStorage<PersistedAuditWorkspace>(
      titanWorkspaceStorageKey
    );

    if (!savedWorkspace) {
      return;
    }

    setAuditResult(savedWorkspace.auditResult);
    setPlatform(savedWorkspace.platform);
    setProfileUrl(savedWorkspace.profileUrl);
    setMemoryAccountKey(
      normalizeAccountKey(
        savedWorkspace.profileUrl ||
          savedWorkspace.planContext.formData?.profileUrl ||
          savedWorkspace.planContext.profileData?.profileUrl ||
          "",
        savedWorkspace.auditResult.businessName
      )
    );
    setLiveScan(savedWorkspace.liveScan);
    setPlanContext(savedWorkspace.planContext);
    setIsUsingFallback(false);
    setRequestStatus("success");
  }, []);

  useEffect(() => {
    if (isUsingFallback) {
      return;
    }

    writeJsonStorage<PersistedAuditWorkspace>(titanWorkspaceStorageKey, {
      savedAt: new Date().toISOString(),
      auditResult,
      platform,
      profileUrl,
      liveScan,
      planContext
    });
  }, [auditResult, isUsingFallback, liveScan, planContext, platform, profileUrl]);

  useEffect(() => {
    if (!pendingMemorySave || isUsingFallback) {
      return;
    }

    if (
      auditResult !== pendingMemorySave.result ||
      planContext !== pendingMemorySave.context
    ) {
      return;
    }

    const memorySaveResult = saveMemoryAudit(
      pendingMemorySave.result,
      pendingMemorySave.context.formData.platform,
      pendingMemorySave.context
    );

    if (memorySaveResult.entry) {
      setMemoryAccountKey(memorySaveResult.entry.accountKey);
    } else {
      setMemoryAccountKey(memorySaveResult.debug.normalizedAccountKey);
    }

    setMemoryDebug(memorySaveResult.debug);
    setMemoryEntriesSnapshot(memorySaveResult.entries);
    setMemoryRevision((currentRevision) => currentRevision + 1);
    setPendingMemorySave(null);
  }, [auditResult, isUsingFallback, pendingMemorySave, planContext]);

  function handleAuditGenerated(
    result: AiAuditResult,
    context: { formData: BusinessAuditFormData; profileData: ProfileData | null }
  ) {
    setAuditResult(result);
    setPlanContext(context);
    setProfileUrl(context.formData.profileUrl);
    setPlatform(context.formData.platform);
    setIsUsingFallback(false);
    setPendingMemorySave({ result, context });
  }

  function handlePlatformChange(platform: AuditPlatform) {
    setPlatform(platform);
    setAuditResult(createFallbackAuditResult(platform));
    setPlanContext({});
    setIsUsingFallback(true);
    setRequestStatus("idle");
  }

  function handleRequestStatusChange(status: RequestStatus) {
    if (status === "loading") {
      setPlanContext({});
      setAuditResult(createFallbackAuditResult(platform));
      setIsUsingFallback(true);
    }

    setRequestStatus(status);
  }

  function clearCurrentResults() {
    clearJsonStorage(titanWorkspaceStorageKey, titanStudioPlanStorageKey);
    setAuditResult(createFallbackAuditResult(platform));
    setPlanContext({});
    setProfileUrl("");
    setMemoryAccountKey("");
    setMemoryDebug(emptyVisibilityMemoryDebug);
    setMemoryEntriesSnapshot([]);
    setIsUsingFallback(true);
    setRequestStatus("idle");
    setLiveScan({
      status: "skipped",
      message: "Live Scan: Ready",
      dataPointsFound: [],
      missingDataPoints: [],
      scanCompleteness: 0,
      confidenceScore: 0,
      metricsStatus: "limited"
    });
  }

  return (
    <DashboardShell
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      {activeModule === "audit" ? (
        <>
          <AiAuditPanel
            auditResult={auditResult}
            onClearResults={clearCurrentResults}
            isUsingFallback={isUsingFallback}
            restoredFormData={planContext.formData}
            restoredLiveScan={liveScan}
            onAuditGenerated={handleAuditGenerated}
            onLiveScanChange={setLiveScan}
            onPlatformChange={handlePlatformChange}
            onProfileUrlChange={setProfileUrl}
            onStatusChange={handleRequestStatusChange}
          />
          <ScoreSummary auditResult={auditResult} isUsingFallback={isUsingFallback} />
          <CategoryScores categories={auditResult.categoryScores} />
          <QuickWins quickWins={auditResult.topQuickWins} />
          <DashboardStates auditResult={auditResult} requestStatus={requestStatus} />
          <VisibilityMemoryPanel
            auditResult={auditResult}
            context={planContext}
            isUsingFallback={isUsingFallback}
            memoryDebug={memoryDebug}
            memoryEntriesSnapshot={memoryEntriesSnapshot}
            memoryAccountKey={memoryAccountKey}
            memoryRevision={memoryRevision}
            profileUrl={profileUrl}
          />
          {!isUsingFallback && requestStatus === "success" ? (
            <StrategyCta
              auditResult={auditResult}
              liveScan={liveScan}
              onGeneratePlan={() => setActiveModule("titan-studio")}
              platform={platform}
              profileUrl={profileUrl}
            />
          ) : null}
        </>
      ) : null}

      {activeModule === "home" ? (
        <DashboardHome
          auditResult={auditResult}
          onClearResults={clearCurrentResults}
          isUsingFallback={isUsingFallback}
          onOpenAudit={() => setActiveModule("audit")}
          onOpenStudio={() => setActiveModule("titan-studio")}
          onOpenReports={() => setActiveModule("reports")}
        />
      ) : null}

      {activeModule === "titan-studio" ? (
        <TitanStudio
          auditResult={auditResult}
          context={planContext}
          isUsingFallback={isUsingFallback}
          memoryAccountKey={memoryAccountKey}
          memoryEntriesSnapshot={memoryEntriesSnapshot}
          onClearResults={clearCurrentResults}
          platform={platform}
        />
      ) : null}

      {activeModule === "reports" ? (
        <div className="pt-8">
          <AuditAssets
            auditResult={auditResult}
            liveScan={liveScan}
            platform={platform}
            profileUrl={profileUrl}
          />
        </div>
      ) : null}

      {activeModule === "competitor-intelligence" ? (
        <CompetitorIntelligence platform={platform} />
      ) : null}

      {activeModule !== "audit" &&
      activeModule !== "home" &&
      activeModule !== "titan-studio" &&
      activeModule !== "competitor-intelligence" &&
      activeModule !== "reports" ? (
        <ModulePlaceholder
          auditResult={auditResult}
          module={activeModule}
          onOpenStudio={() => setActiveModule("titan-studio")}
          onOpenAudit={() => setActiveModule("audit")}
        />
      ) : null}
    </DashboardShell>
  );
}

function ModulePlaceholder({
  auditResult,
  module,
  onOpenAudit,
  onOpenStudio
}: {
  auditResult: AiAuditResult;
  module: TitanOsModule;
  onOpenAudit: () => void;
  onOpenStudio: () => void;
}) {
  const moduleLabels: Record<TitanOsModule, string> = {
    home: "Command Center",
    audit: "Visibility Audit",
    "titan-studio": "Titan Studio",
    "trend-finder": "Trend Finder",
    "competitor-intelligence": "Competitor Intelligence",
    "content-planner": "Content Planner",
    reports: "Reports"
  };
  const weakAreas = [...auditResult.categoryScores]
    .sort((first, second) => first.score - second.score)
    .slice(0, 3)
    .map((category) => category.name);

  return (
    <section className="px-5 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <article className="premium-surface min-w-0 rounded-lg p-6 shadow-gold sm:p-10">
          <p className="text-sm font-bold uppercase text-titan-muted">
            Titan Visibility OS
          </p>
          <h1 className="text-anywhere mt-3 text-4xl font-black text-titan-ivory sm:text-6xl">
            {moduleLabels[module]}
          </h1>
          <p className="text-anywhere mt-5 max-w-3xl text-lg leading-8 text-titan-ivory/66">
            This module is staged into the OS architecture and ready to connect
            to the shared audit intelligence layer. The current active workflow
            is Visibility Audit to Titan Studio to Reports.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {weakAreas.map((area) => (
              <div
                className="rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                key={area}
              >
                <p className="text-xs font-bold uppercase text-titan-muted">
                  Audit signal
                </p>
                <p className="text-anywhere mt-2 font-black text-titan-bright">
                  {area}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-titan-gold px-6 text-sm font-black uppercase text-black shadow-gold transition hover:-translate-y-0.5 hover:bg-titan-bright"
              onClick={onOpenStudio}
              type="button"
            >
              Build 30-Day Plan
            </button>
            <button
              className="luxury-border inline-flex min-h-12 items-center justify-center rounded-full bg-white/5 px-6 text-sm font-bold uppercase text-titan-ivory transition hover:border-titan-bright hover:bg-white/10"
              onClick={onOpenAudit}
              type="button"
            >
              Run Visibility Audit
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

function DashboardHome({
  auditResult,
  isUsingFallback,
  onClearResults,
  onOpenAudit,
  onOpenReports,
  onOpenStudio
}: {
  auditResult: AiAuditResult;
  isUsingFallback: boolean;
  onClearResults: () => void;
  onOpenAudit: () => void;
  onOpenReports: () => void;
  onOpenStudio: () => void;
}) {
  const weakestCategories = [...auditResult.categoryScores]
    .sort((first, second) => first.score - second.score)
    .slice(0, 3);

  return (
    <section className="px-5 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <article className="premium-surface min-w-0 rounded-lg p-6 shadow-gold sm:p-10">
          <p className="text-sm font-bold uppercase text-titan-muted">
            Titan Visibility OS
          </p>
          <h1 className="text-anywhere mt-3 text-4xl font-black leading-tight text-titan-ivory sm:text-6xl">
            Visibility intelligence, content execution, and client-ready reports.
          </h1>
          <p className="text-anywhere mt-5 max-w-4xl text-lg leading-8 text-titan-ivory/66">
            AI-powered visibility intelligence and execution system for creators
            and businesses. Start with a Visibility Audit, convert the findings
            into a Titan Studio execution plan, then package the work into a
            polished report.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-titan-gold px-6 text-sm font-black uppercase text-black shadow-gold transition hover:-translate-y-0.5 hover:bg-titan-bright"
              onClick={onOpenAudit}
              type="button"
            >
              Run Visibility Audit
            </button>
            <button
              className="luxury-border inline-flex min-h-12 items-center justify-center rounded-full bg-white/5 px-6 text-sm font-bold uppercase text-titan-ivory transition hover:border-titan-bright hover:bg-white/10"
              onClick={onOpenStudio}
              type="button"
            >
              Open Titan Studio
            </button>
            {!isUsingFallback ? (
              <button
                className="luxury-border inline-flex min-h-12 items-center justify-center rounded-full bg-black/20 px-6 text-sm font-bold uppercase text-titan-ivory/70 transition hover:border-titan-bright hover:text-titan-bright"
                onClick={onClearResults}
                type="button"
              >
                Clear Current Results
              </button>
            ) : null}
          </div>
        </article>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <HomeCard
            action="Start scan"
            description="Analyze a profile URL, live public signals, category scores, and conversion gaps."
            eyebrow="Intelligence"
            onClick={onOpenAudit}
            title="Visibility Audit"
          />
          <HomeCard
            action="Build plan"
            description="Turn audit weak areas into hooks, scripts, captions, CTAs, and a 30-day schedule."
            eyebrow="Execution"
            onClick={onOpenStudio}
            title="Titan Studio"
          />
          <HomeCard
            action="Export report"
            description="Generate a polished client-ready PDF with scores, diagnosis, wins, and next steps."
            eyebrow="Delivery"
            onClick={onOpenReports}
            title="Reports"
          />
        </div>

        <article className="premium-surface mt-5 min-w-0 rounded-lg p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-titan-muted">
                Current intelligence layer
              </p>
              <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory">
                {isUsingFallback ? "Awaiting a live profile audit" : auditResult.businessName}
              </h2>
            </div>
            <span className="rounded-full bg-titan-gold/10 px-4 py-2 text-xs font-black uppercase text-titan-bright">
              {isUsingFallback ? "Baseline ready" : "Live audit active"}
            </span>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {weakestCategories.map((category) => (
              <div
                className="rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                key={category.name}
              >
                <p className="text-xs font-bold uppercase text-titan-muted">
                  Priority signal
                </p>
                <p className="text-anywhere mt-2 font-black text-titan-ivory">
                  {category.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-titan-ivory/56">
                  Score {category.score}: {category.benchmark}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function HomeCard({
  action,
  description,
  eyebrow,
  onClick,
  title
}: {
  action: string;
  description: string;
  eyebrow: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <article className="interactive-card premium-surface min-w-0 rounded-lg p-6">
      <p className="text-sm font-bold uppercase text-titan-muted">{eyebrow}</p>
      <h2 className="text-anywhere mt-3 text-2xl font-black text-titan-ivory">
        {title}
      </h2>
      <p className="text-anywhere mt-4 min-h-24 text-sm leading-6 text-titan-ivory/62">
        {description}
      </p>
      <button
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-white/5 px-5 text-xs font-black uppercase text-titan-bright transition hover:bg-titan-gold hover:text-black"
        onClick={onClick}
        type="button"
      >
        {action}
      </button>
    </article>
  );
}
