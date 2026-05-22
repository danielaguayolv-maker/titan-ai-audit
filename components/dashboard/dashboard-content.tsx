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
  createVisibilityEvolutionReport,
  createVisibilityMemoryReport,
  emptyVisibilityMemoryDebug,
  normalizeAccountKey,
  readVisibilityMemoryEntries,
  saveMemoryAudit,
  type EvolutionMovementStatus,
  type VisibilityEvolutionMetric,
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
    setMemoryEntriesSnapshot(readVisibilityMemoryEntries());
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
          memoryAccountKey={memoryAccountKey}
          memoryEntriesSnapshot={memoryEntriesSnapshot}
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
  memoryAccountKey,
  memoryEntriesSnapshot,
  onClearResults,
  onOpenAudit,
  onOpenReports,
  onOpenStudio
}: {
  auditResult: AiAuditResult;
  isUsingFallback: boolean;
  memoryAccountKey: string;
  memoryEntriesSnapshot: VisibilityMemoryEntry[];
  onClearResults: () => void;
  onOpenAudit: () => void;
  onOpenReports: () => void;
  onOpenStudio: () => void;
}) {
  const weakestCategories = [...auditResult.categoryScores]
    .sort((first, second) => first.score - second.score)
    .slice(0, 3);
  const accountKey =
    memoryAccountKey || normalizeAccountKey("", auditResult.businessName);
  const memoryReport = createVisibilityMemoryReport(
    memoryEntriesSnapshot,
    accountKey
  );
  const evolutionReport = createVisibilityEvolutionReport(
    memoryEntriesSnapshot,
    accountKey
  );
  const momentum = commandMomentum(evolutionReport.movementScores);
  const strategicMetrics = buildStrategicHealthMetrics(
    auditResult,
    evolutionReport.movementScores
  );
  const warnings = buildBehaviorWarnings(memoryReport, evolutionReport, weakestCategories);
  const opportunities = buildOpportunitySignals(memoryReport, evolutionReport);
  const recommendations = buildCommandRecommendations(memoryReport, evolutionReport);
  const identitySignals = [
    ...evolutionReport.identityEvolution,
    ...memoryReport.identityAnalysis
  ].slice(0, 5);
  const emotionalTriggers = [
    ...memoryReport.emotionalPatterns,
    ...auditResult.topQuickWins.map((win) => win.title)
  ].slice(0, 4);

  return (
    <section className="px-5 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <article className="premium-surface min-w-0 overflow-hidden rounded-lg p-6 shadow-gold sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase text-titan-muted">
                Titan Visibility Command Center
              </p>
              <h1 className="text-anywhere mt-3 text-4xl font-black leading-tight text-titan-ivory sm:text-6xl">
                Daily strategic pulse for visibility, identity, and audience movement.
              </h1>
              <p className="text-anywhere mt-5 max-w-4xl text-lg leading-8 text-titan-ivory/66">
                {isUsingFallback
                  ? "Run a Visibility Audit to activate live momentum, audience behavior, and predictive strategy."
                  : `${auditResult.businessName} is being monitored through memory, evolution, and adaptive strategy signals.`}
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
            </div>

            <div className="rounded-lg border border-titan-gold/15 bg-black/30 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-titan-muted">
                    Momentum status
                  </p>
                  <h2 className="mt-2 text-4xl font-black text-titan-bright">
                    {momentum.label}
                  </h2>
                </div>
                <div className="flex size-20 items-center justify-center rounded-full border border-titan-gold/25 bg-titan-gold/10 text-4xl text-titan-bright shadow-gold">
                  {momentum.arrow}
                </div>
              </div>
              <p className="text-anywhere mt-4 text-sm leading-6 text-titan-ivory/64">
                {momentum.summary}
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-titan-gold transition-all duration-700"
                  style={{ width: `${momentum.confidence}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-bold uppercase text-titan-muted">
                {momentum.confidence}% confidence
              </p>
            </div>
          </div>
        </article>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-titan-muted">
                  Strategic health metrics
                </p>
                <h2 className="text-anywhere mt-2 text-3xl font-black text-titan-ivory">
                  Signals that matter today.
                </h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase text-titan-ivory/65">
                {isUsingFallback ? "Baseline" : "Live workspace"}
              </span>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {strategicMetrics.map((metric) => (
                <CommandMetricCard metric={metric} key={metric.label} />
              ))}
            </div>
          </article>

          <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
            <p className="text-sm font-bold uppercase text-titan-muted">
              Strategic pulse
            </p>
            <div className="mt-5 grid gap-4">
              <PulseItem label="Visibility score" value={`${Math.round(auditResult.overallScore)}`} />
              <PulseItem label="Memory points" value={`${memoryReport.auditCount}`} />
              <PulseItem label="Identity stability" value={identitySignals.length > 2 ? "Active" : "Forming"} />
              <PulseItem label="Predictive direction" value={momentum.label} />
            </div>
          </article>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          <CommandListCard
            eyebrow="Behavioral warnings"
            items={warnings}
            tone="warning"
            title="What could quietly weaken performance"
          />
          <CommandListCard
            eyebrow="Opportunity signals"
            items={opportunities}
            tone="positive"
            title="Where momentum can be created"
          />
          <CommandListCard
            eyebrow="Strategic recommendations"
            items={recommendations}
            tone="neutral"
            title="What to do this week"
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
            <p className="text-sm font-bold uppercase text-titan-muted">
              Emotional trigger visualization
            </p>
            <h2 className="text-anywhere mt-2 text-2xl font-black text-titan-ivory">
              Audience behavior clusters.
            </h2>
            <div className="mt-6 grid gap-3">
              {emotionalTriggers.map((trigger, index) => (
                <div key={trigger}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-anywhere text-sm font-bold text-titan-ivory/72">
                      {trigger}
                    </p>
                    <span className="text-xs font-black uppercase text-titan-bright">
                      {Math.max(42, 92 - index * 13)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-titan-gold transition-all duration-700"
                      style={{ width: `${Math.max(42, 92 - index * 13)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-titan-muted">
                  Identity stability layer
                </p>
                <h2 className="text-anywhere mt-2 text-2xl font-black text-titan-ivory">
                  Aesthetic, atmosphere, and audience identity.
                </h2>
              </div>
              <span className="rounded-full border border-titan-gold/20 bg-titan-gold/10 px-3 py-1 text-xs font-black uppercase text-titan-bright">
                {identitySignals.length > 2 ? "Stabilizing" : "Emerging"}
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {identitySignals.map((signal) => (
                <div
                  className="rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                  key={signal}
                >
                  <span className="mb-3 block size-2 rounded-full bg-titan-gold shadow-gold" />
                  <p className="text-anywhere text-sm leading-6 text-titan-ivory/66">
                    {signal}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="premium-surface mt-5 min-w-0 rounded-lg p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase text-titan-muted">
                Command routes
              </p>
              <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory">
                Move from signal to execution.
              </h2>
            </div>
            <span className="rounded-full bg-titan-gold/10 px-4 py-2 text-xs font-black uppercase text-titan-bright">
              {isUsingFallback ? "Baseline ready" : "Live audit active"}
            </span>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <HomeCard
              action="Start scan"
              description="Refresh live public signals, category scores, and conversion gaps."
              eyebrow="Intelligence"
              onClick={onOpenAudit}
              title="Visibility Audit"
            />
            <HomeCard
              action="Build plan"
              description="Turn memory and movement into adaptive hooks, scripts, CTAs, and a 30-day roadmap."
              eyebrow="Execution"
              onClick={onOpenStudio}
              title="Titan Studio"
            />
            <HomeCard
              action="Export report"
              description="Package the current strategic read into a polished client-ready PDF."
              eyebrow="Delivery"
              onClick={onOpenReports}
              title="Reports"
            />
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

type CommandMetric = {
  label: string;
  score: number;
  direction: EvolutionMovementStatus;
  confidence: number;
  interpretation: string;
};

function movementArrow(status: EvolutionMovementStatus) {
  const arrows: Record<EvolutionMovementStatus, string> = {
    improving: "↗",
    declining: "↘",
    stable: "→",
    inconsistent: "↕",
    emerging: "↗"
  };

  return arrows[status];
}

function commandMomentum(metrics: VisibilityEvolutionMetric[]) {
  const improving = metrics.filter((metric) => metric.status === "improving").length;
  const declining = metrics.filter((metric) => metric.status === "declining").length;
  const inconsistent = metrics.filter((metric) => metric.status === "inconsistent").length;

  if (metrics.length === 0) {
    return {
      label: "Emerging",
      arrow: "↗",
      confidence: 38,
      summary: "Momentum is emerging. Run a live audit to give Titan a stronger behavioral baseline."
    };
  }

  if (improving >= 3) {
    return {
      label: "Strengthening",
      arrow: "↗",
      confidence: 84,
      summary: "Momentum is strengthening. Multiple strategic signals are moving in the right direction."
    };
  }

  if (declining >= 2) {
    return {
      label: "Weakening",
      arrow: "↘",
      confidence: 78,
      summary: "The account is losing ground in visible places. Fix the repeated behavior before scaling content volume."
    };
  }

  if (inconsistent >= 2) {
    return {
      label: "Flattening",
      arrow: "↕",
      confidence: 70,
      summary: "Execution is inconsistent. Strong ideas are appearing, but they are not repeating cleanly yet."
    };
  }

  return {
    label: "Stable",
    arrow: "→",
    confidence: 66,
    summary: "Emotional engagement signals are stabilizing. The next move is making the winning pattern louder."
  };
}

function findMovement(metrics: VisibilityEvolutionMetric[], label: string) {
  return metrics.find((metric) => metric.label === label);
}

function categoryScoreForCommand(auditResult: AiAuditResult, keys: string[]) {
  const category = auditResult.categoryScores.find((item) => {
    const text = `${item.name} ${item.benchmark} ${item.insight}`.toLowerCase();
    return keys.some((key) => text.includes(key));
  });

  return category?.score ?? Math.round(auditResult.overallScore);
}

function buildStrategicHealthMetrics(
  auditResult: AiAuditResult,
  movementScores: VisibilityEvolutionMetric[]
): CommandMetric[] {
  const definitions = [
    ["Hook Stability", "Hook Strength", ["hook", "profile clarity"]],
    ["Audience Pull", "Emotional Identity", ["engagement", "emotion", "audience"]],
    ["Conversion Friction", "CTA Strength", ["cta", "conversion", "offer"]],
    ["Emotional Identity", "Emotional Identity", ["emotion", "identity", "brand"]],
    ["Memorability", "Memorability", ["memory", "visual", "content"]],
    ["Search Momentum", "Search/Keyword Alignment", ["search", "keyword", "seo", "local"]],
    ["Audience Tension", "Retention Potential", ["retention", "pacing", "hook"]],
    ["CTA Efficiency", "CTA Strength", ["cta", "conversion"]],
    ["Identity Consistency", "Content Consistency", ["consistency", "posting", "content"]]
  ] as const;

  return definitions.map(([label, movementLabel, keys]) => {
    const movement = findMovement(movementScores, movementLabel);
    const score = movement?.currentScore ?? categoryScoreForCommand(auditResult, [...keys]);
    const direction = movement?.status ?? "emerging";

    return {
      label,
      score,
      direction,
      confidence: movement?.previousScore === undefined ? 42 : Math.min(92, Math.max(54, 58 + Math.abs(movement.delta) * 4)),
      interpretation:
        movement?.summary ??
        `${label} is being read from the latest audit until more history accumulates.`
    };
  });
}

function buildBehaviorWarnings(
  memoryReport: ReturnType<typeof createVisibilityMemoryReport>,
  evolutionReport: ReturnType<typeof createVisibilityEvolutionReport>,
  weakCategories: AiAuditResult["categoryScores"]
) {
  return [
    ...memoryReport.persistentWeaknesses,
    ...evolutionReport.regressions,
    ...evolutionReport.unstablePatterns,
    ...weakCategories.map((category) => `${category.name}: ${category.insight}`)
  ]
    .filter(Boolean)
    .slice(0, 4);
}

function buildOpportunitySignals(
  memoryReport: ReturnType<typeof createVisibilityMemoryReport>,
  evolutionReport: ReturnType<typeof createVisibilityEvolutionReport>
) {
  return [
    ...memoryReport.repeatedWins,
    ...evolutionReport.strengtheningSignals,
    ...evolutionReport.emergingPatterns,
    "Room-energy visuals, reaction frames, and identity-led openings are the next places to look for audience pull."
  ]
    .filter(Boolean)
    .slice(0, 4);
}

function buildCommandRecommendations(
  memoryReport: ReturnType<typeof createVisibilityMemoryReport>,
  evolutionReport: ReturnType<typeof createVisibilityEvolutionReport>
) {
  return [
    ...memoryReport.predictiveSignals,
    ...evolutionReport.momentumAnalysis,
    "Use more emotionally legible openings this week.",
    "Avoid informational openings for the next 5 posts unless the first frame already creates tension."
  ]
    .filter(Boolean)
    .slice(0, 5);
}

function CommandMetricCard({ metric }: { metric: CommandMetric }) {
  return (
    <div className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-4 transition hover:border-titan-gold/30 hover:bg-black/35">
      <div className="flex items-start justify-between gap-3">
        <p className="text-anywhere font-black text-titan-ivory">{metric.label}</p>
        <span className="rounded-full bg-titan-gold/10 px-2 py-1 text-xs font-black text-titan-bright">
          {movementArrow(metric.direction)}
        </span>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-3xl font-black text-titan-bright">{Math.round(metric.score)}</span>
        <span className="pb-1 text-[11px] font-bold uppercase text-titan-ivory/45">
          {metric.direction}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-titan-gold transition-all duration-700"
          style={{ width: `${metric.confidence}%` }}
        />
      </div>
      <p className="text-anywhere mt-3 text-xs leading-5 text-titan-ivory/58">
        {metric.interpretation}
      </p>
    </div>
  );
}

function PulseItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-titan-gold/10 bg-black/24 p-4">
      <p className="text-xs font-black uppercase text-titan-muted">{label}</p>
      <p className="text-anywhere text-lg font-black text-titan-bright">{value}</p>
    </div>
  );
}

function CommandListCard({
  eyebrow,
  items,
  title,
  tone
}: {
  eyebrow: string;
  items: string[];
  title: string;
  tone: "warning" | "positive" | "neutral";
}) {
  const toneClass =
    tone === "warning"
      ? "border-amber-300/20 bg-amber-400/10"
      : tone === "positive"
        ? "border-emerald-300/20 bg-emerald-400/10"
        : "border-titan-gold/10 bg-black/24";

  return (
    <article className="premium-surface min-w-0 rounded-lg p-6">
      <p className="text-sm font-bold uppercase text-titan-muted">{eyebrow}</p>
      <h2 className="text-anywhere mt-3 text-2xl font-black text-titan-ivory">
        {title}
      </h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <p
            className={`text-anywhere rounded-lg border p-4 text-sm leading-6 text-titan-ivory/68 ${toneClass}`}
            key={item}
          >
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}
