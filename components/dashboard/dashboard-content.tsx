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
  const primaryBlocker = buildPrimaryBlocker(
    strategicMetrics,
    warnings,
    weakestCategories,
    momentum.label
  );
  const strategicPriorities = buildStrategicPriorities(
    strategicMetrics,
    warnings,
    opportunities,
    recommendations,
    weakestCategories
  );
  const pulseFeed = buildTitanPulseFeed(
    strategicMetrics,
    warnings,
    opportunities,
    momentum.label
  );
  const strategicFocus = buildStrategicFocusMode(
    strategicMetrics,
    warnings,
    opportunities,
    recommendations
  );
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

            <div className={`${severityVisual(momentum.severity).panelClass} rounded-lg p-5`}>
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

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
          <PrimaryBlockerCard blocker={primaryBlocker} />
          <StrategicPriorityRanking priorities={strategicPriorities} />
        </div>

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

          <article className="premium-surface min-w-0 overflow-hidden rounded-lg p-6 sm:p-7">
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

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <TitanPulseFeed items={pulseFeed} />
          <MovementVisualization metrics={strategicMetrics} />
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

        <StrategicFocusMode focus={strategicFocus} />

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

type StrategicSeverity =
  | "Critical"
  | "High Priority"
  | "Warning"
  | "Opportunity"
  | "Stable"
  | "Emerging"
  | "High Confidence"
  | "Volatile";

type StrategicBlocker = {
  title: string;
  description: string;
  severity: StrategicSeverity;
  confidence: number;
  movement: EvolutionMovementStatus;
  recommendedFocus: string;
};

type StrategicPriority = {
  label: string;
  title: string;
  description: string;
  severity: StrategicSeverity;
  confidence: number;
  movement: EvolutionMovementStatus;
  recommendedFocus: string;
};

type TitanPulseItem = {
  label: string;
  message: string;
  severity: StrategicSeverity;
  movement: EvolutionMovementStatus;
};

type StrategicFocus = {
  focusThisWeek: string;
  ignoreTemporarily: string;
  stabilizing: string;
  becomingDangerous: string;
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
      severity: "Emerging" as StrategicSeverity,
      summary: "Momentum is emerging. Run a live audit to give Titan a stronger behavioral baseline."
    };
  }

  if (improving >= 3) {
    return {
      label: "Strengthening",
      arrow: "↗",
      confidence: 84,
      severity: "Opportunity" as StrategicSeverity,
      summary: "Momentum is strengthening. Multiple strategic signals are moving in the right direction."
    };
  }

  if (declining >= 2) {
    return {
      label: "Weakening",
      arrow: "↘",
      confidence: 78,
      severity: "Critical" as StrategicSeverity,
      summary: "The account is losing ground in visible places. Fix the repeated behavior before scaling content volume."
    };
  }

  if (inconsistent >= 2) {
    return {
      label: "Flattening",
      arrow: "↕",
      confidence: 70,
      severity: "Volatile" as StrategicSeverity,
      summary: "Execution is inconsistent. Strong ideas are appearing, but they are not repeating cleanly yet."
    };
  }

  return {
    label: "Stable",
    arrow: "→",
    confidence: 66,
    severity: "Stable" as StrategicSeverity,
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

function severityFromMovement(
  movement: EvolutionMovementStatus,
  score: number
): StrategicSeverity {
  if (movement === "declining" && score < 58) {
    return "Critical";
  }

  if (movement === "declining") {
    return "High Priority";
  }

  if (movement === "inconsistent") {
    return "Volatile";
  }

  if (movement === "improving" && score >= 78) {
    return "High Confidence";
  }

  if (movement === "improving") {
    return "Opportunity";
  }

  if (movement === "stable") {
    return "Stable";
  }

  return "Emerging";
}

function severityVisual(severity: StrategicSeverity) {
  const visuals: Record<
    StrategicSeverity,
    {
      badgeClass: string;
      dotClass: string;
      icon: string;
      panelClass: string;
      pulseClass: string;
    }
  > = {
    Critical: {
      badgeClass: "border-red-300/35 bg-red-500/15 text-red-100",
      dotClass: "bg-red-300 shadow-[0_0_18px_rgba(252,165,165,0.75)]",
      icon: "!",
      panelClass:
        "border border-red-300/30 bg-red-500/10 shadow-[0_0_42px_rgba(127,29,29,0.42)]",
      pulseClass: "animate-pulse"
    },
    "High Priority": {
      badgeClass: "border-amber-300/35 bg-amber-400/15 text-amber-100",
      dotClass: "bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.72)]",
      icon: "!",
      panelClass:
        "border border-amber-300/25 bg-amber-400/10 shadow-[0_0_34px_rgba(146,64,14,0.34)]",
      pulseClass: ""
    },
    Warning: {
      badgeClass: "border-orange-300/30 bg-orange-400/12 text-orange-100",
      dotClass: "bg-orange-300 shadow-[0_0_14px_rgba(253,186,116,0.62)]",
      icon: "~",
      panelClass: "border border-orange-300/20 bg-orange-400/10",
      pulseClass: ""
    },
    Opportunity: {
      badgeClass: "border-emerald-300/30 bg-emerald-400/12 text-emerald-100",
      dotClass: "bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.62)]",
      icon: "↗",
      panelClass:
        "border border-emerald-300/20 bg-emerald-400/10 shadow-[0_0_30px_rgba(6,95,70,0.22)]",
      pulseClass: ""
    },
    Stable: {
      badgeClass: "border-titan-gold/20 bg-titan-gold/10 text-titan-bright",
      dotClass: "bg-titan-gold shadow-gold",
      icon: "→",
      panelClass: "border border-titan-gold/15 bg-black/30",
      pulseClass: ""
    },
    Emerging: {
      badgeClass: "border-sky-300/25 bg-sky-400/10 text-sky-100",
      dotClass: "bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.52)]",
      icon: "↗",
      panelClass: "border border-sky-300/20 bg-sky-400/10",
      pulseClass: "animate-pulse"
    },
    "High Confidence": {
      badgeClass: "border-titan-bright/35 bg-titan-gold/15 text-titan-bright",
      dotClass: "bg-titan-bright shadow-gold",
      icon: "✓",
      panelClass:
        "border border-titan-bright/30 bg-titan-gold/10 shadow-[0_0_38px_rgba(212,175,55,0.28)]",
      pulseClass: ""
    },
    Volatile: {
      badgeClass: "border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-100",
      dotClass: "bg-fuchsia-300 shadow-[0_0_16px_rgba(240,171,252,0.58)]",
      icon: "↕",
      panelClass:
        "border border-fuchsia-300/20 bg-fuchsia-400/10 shadow-[0_0_30px_rgba(112,26,117,0.26)]",
      pulseClass: "animate-pulse"
    }
  };

  return visuals[severity];
}

function cleanSignalText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function buildPrimaryBlocker(
  metrics: CommandMetric[],
  warnings: string[],
  weakCategories: AiAuditResult["categoryScores"],
  momentumLabel: string
): StrategicBlocker {
  const urgentMetric =
    metrics.find((metric) => metric.direction === "declining") ??
    metrics.find((metric) => metric.direction === "inconsistent") ??
    [...metrics].sort((first, second) => first.score - second.score)[0];
  const weakCategory = weakCategories[0];
  const titleByMetric: Record<string, string> = {
    "Hook Stability": "The opening is not creating enough tension before context appears.",
    "Audience Pull": "The audience understands the content before they feel pulled into it.",
    "Conversion Friction": "The strongest moments are losing energy before the next step appears.",
    "Emotional Identity": "The account has signal, but the emotional world is not fully claimed.",
    Memorability: "Nothing is surviving the scroll consistently enough yet.",
    "Search Momentum": "Search intent is present, but it is not carrying the account hard enough.",
    "Audience Tension": "The payoff arrives before the viewer has enough reason to stay.",
    "CTA Efficiency": "The conversion moment is arriving after the emotional peak.",
    "Identity Consistency": "Identity inconsistency is weakening memorability."
  };

  const blockerTitle =
    titleByMetric[urgentMetric?.label ?? ""] ??
    (weakCategory
      ? `${weakCategory.name} is the current visibility bottleneck.`
      : "Titan needs a fresh audit before it can isolate the real bottleneck.");

  return {
    title: blockerTitle,
    description: cleanSignalText(
      warnings[0] ??
        weakCategory?.insight ??
        "Run a new Visibility Audit to activate live blocker detection."
    ),
    severity:
      momentumLabel === "Weakening"
        ? "Critical"
        : severityFromMovement(urgentMetric?.direction ?? "emerging", urgentMetric?.score ?? 45),
    confidence: urgentMetric?.confidence ?? 40,
    movement: urgentMetric?.direction ?? "emerging",
    recommendedFocus:
      urgentMetric?.label === "CTA Efficiency" ||
      urgentMetric?.label === "Conversion Friction"
        ? "Move the CTA closer to the strongest emotional or visual moment."
        : urgentMetric?.label === "Hook Stability" ||
            urgentMetric?.label === "Audience Tension"
          ? "Fix the first three seconds before increasing posting volume."
          : "Use this week to make the strongest recurring signal easier to recognize."
  };
}

function buildStrategicPriorities(
  metrics: CommandMetric[],
  warnings: string[],
  opportunities: string[],
  recommendations: string[],
  weakCategories: AiAuditResult["categoryScores"]
): StrategicPriority[] {
  const dangerousMetric =
    metrics.find((metric) => metric.direction === "declining") ??
    metrics.find((metric) => metric.direction === "inconsistent") ??
    [...metrics].sort((first, second) => first.score - second.score)[0];
  const opportunityMetric =
    metrics.find((metric) => metric.direction === "improving") ??
    [...metrics].sort((first, second) => second.score - first.score)[0];
  const strongestMetric = [...metrics].sort(
    (first, second) => second.score - first.score
  )[0];
  const fastestWin = weakCategories[0];

  return [
    {
      label: "Most dangerous issue",
      title: dangerousMetric?.label ?? "Visibility baseline",
      description:
        warnings[0] ??
        dangerousMetric?.interpretation ??
        "Titan needs one more audit before ranking risk with confidence.",
      severity: severityFromMovement(
        dangerousMetric?.direction ?? "emerging",
        dangerousMetric?.score ?? 42
      ),
      confidence: dangerousMetric?.confidence ?? 42,
      movement: dangerousMetric?.direction ?? "emerging",
      recommendedFocus:
        dangerousMetric?.label === "Conversion Friction"
          ? "Do not scale volume until the CTA lands while energy is still high."
          : "Stabilize this before chasing secondary optimizations."
    },
    {
      label: "Biggest opportunity",
      title: opportunityMetric?.label ?? "Audience pull",
      description:
        opportunities[0] ??
        "The next lift comes from making the strongest emotional signal more visible.",
      severity: "Opportunity",
      confidence: opportunityMetric?.confidence ?? 54,
      movement: opportunityMetric?.direction ?? "emerging",
      recommendedFocus: "Turn the strongest signal into a repeatable content pattern."
    },
    {
      label: "Strongest signal",
      title: strongestMetric?.label ?? "Emerging identity",
      description:
        strongestMetric?.interpretation ??
        "The account is beginning to show a recognizable strategic pattern.",
      severity:
        (strongestMetric?.confidence ?? 0) > 70
          ? "High Confidence"
          : "Emerging",
      confidence: strongestMetric?.confidence ?? 48,
      movement: strongestMetric?.direction ?? "emerging",
      recommendedFocus: "Protect this pattern. Make it easier for the audience to name."
    },
    {
      label: "Fastest potential win",
      title: fastestWin?.name ?? "First-frame clarity",
      description:
        recommendations[0] ??
        fastestWin?.insight ??
        "A sharper opening and cleaner next step will create the fastest lift.",
      severity: "High Priority",
      confidence: 72,
      movement: "improving",
      recommendedFocus:
        fastestWin?.name?.toLowerCase().includes("cta")
          ? "Place the action while attention is still emotionally warm."
          : "Make this fix visible in the next three posts."
    }
  ];
}

function buildTitanPulseFeed(
  metrics: CommandMetric[],
  warnings: string[],
  opportunities: string[],
  momentumLabel: string
): TitanPulseItem[] {
  const volatile = metrics.find((metric) => metric.direction === "inconsistent");
  const declining = metrics.find((metric) => metric.direction === "declining");
  const improving = metrics.find((metric) => metric.direction === "improving");
  const stable = metrics.find((metric) => metric.direction === "stable");

  return [
    {
      label: "Signal shift detected",
      message:
        momentumLabel === "Weakening"
          ? "Momentum is losing ground in visible places."
          : momentumLabel === "Strengthening"
            ? "Multiple signals are moving with more conviction."
            : "Titan is watching for the next clear movement pattern.",
      severity: momentumLabel === "Weakening" ? "Critical" : "Emerging",
      movement: momentumLabel === "Weakening" ? "declining" : "emerging"
    },
    {
      label: volatile ? "Retention volatility detected" : "Pattern stability check",
      message:
        volatile?.interpretation ??
        stable?.interpretation ??
        "The strategic baseline is forming. More audits will sharpen the read.",
      severity: volatile ? "Volatile" : "Stable",
      movement: volatile?.direction ?? stable?.direction ?? "emerging"
    },
    {
      label: improving ? `${improving.label} strengthening` : "Opportunity watch",
      message:
        opportunities[0] ??
        improving?.interpretation ??
        "Titan is looking for a repeatable creative signal that can become the week’s focus.",
      severity: "Opportunity",
      movement: improving?.direction ?? "emerging"
    },
    {
      label: declining ? `${declining.label} needs attention` : "Friction scan",
      message:
        warnings[0] ??
        declining?.interpretation ??
        "No critical friction has repeated enough to dominate the dashboard yet.",
      severity: declining ? "High Priority" : "Warning",
      movement: declining?.direction ?? "stable"
    }
  ];
}

function buildStrategicFocusMode(
  metrics: CommandMetric[],
  warnings: string[],
  opportunities: string[],
  recommendations: string[]
): StrategicFocus {
  const weakest =
    metrics.find((metric) => metric.direction === "declining") ??
    metrics.find((metric) => metric.direction === "inconsistent") ??
    [...metrics].sort((first, second) => first.score - second.score)[0];
  const stable = metrics.find((metric) => metric.direction === "stable");
  const dangerous = metrics.find((metric) => metric.direction === "declining");

  return {
    focusThisWeek:
      recommendations[0] ??
      (weakest
        ? `Make ${weakest.label.toLowerCase()} the weekly operating focus.`
        : "Run a new audit so Titan can isolate the weekly focus."),
    ignoreTemporarily:
      weakest?.label === "Search Momentum"
        ? "Ignore content volume temporarily. Search language is the real bottleneck."
        : "Ignore cosmetic tweaks temporarily. Fix the behavior that changes attention first.",
    stabilizing:
      stable
        ? `${stable.label} is stabilizing. Keep the pattern visible without overworking it.`
        : opportunities[0] ?? "Identity signals are still forming.",
    becomingDangerous:
      dangerous
        ? `${dangerous.label} is becoming dangerous enough to prioritize now.`
        : warnings[0] ?? "No single danger signal is dominant yet."
  };
}

function SeverityBadge({ severity }: { severity: StrategicSeverity }) {
  const visual = severityVisual(severity);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase ${visual.badgeClass}`}
    >
      <span className={`size-1.5 rounded-full ${visual.dotClass} ${visual.pulseClass}`} />
      {severity}
    </span>
  );
}

function PrimaryBlockerCard({ blocker }: { blocker: StrategicBlocker }) {
  const visual = severityVisual(blocker.severity);

  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-lg p-6 sm:p-8 ${visual.panelClass}`}
    >
      <div className="absolute right-6 top-6 h-28 w-28 rounded-full border border-titan-gold/10 opacity-40 shadow-[0_0_80px_rgba(212,175,55,0.18)]" />
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-titan-muted">
            Primary Blocker
          </p>
          <SeverityBadge severity={blocker.severity} />
        </div>
        <h2 className="text-anywhere mt-5 max-w-4xl text-3xl font-black leading-tight text-titan-ivory sm:text-4xl">
          {blocker.title}
        </h2>
        <p className="text-anywhere mt-4 max-w-4xl text-sm leading-7 text-titan-ivory/68 sm:text-base">
          {blocker.description}
        </p>
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-black/24 p-4">
            <p className="text-xs font-black uppercase text-titan-muted">
              Movement
            </p>
            <p className="mt-2 text-2xl font-black text-titan-bright">
              {movementArrow(blocker.movement)} {blocker.movement}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/24 p-4">
            <p className="text-xs font-black uppercase text-titan-muted">
              Confidence
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-titan-gold transition-all duration-700"
                style={{ width: `${blocker.confidence}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-black text-titan-bright">
              {blocker.confidence}%
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/24 p-4">
            <p className="text-xs font-black uppercase text-titan-muted">
              Recommended focus
            </p>
            <p className="text-anywhere mt-2 text-sm leading-6 text-titan-ivory/70">
              {blocker.recommendedFocus}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function StrategicPriorityRanking({
  priorities
}: {
  priorities: StrategicPriority[];
}) {
  return (
    <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
      <p className="text-sm font-bold uppercase text-titan-muted">
        Strategic priority ranking
      </p>
      <h2 className="text-anywhere mt-2 text-2xl font-black text-titan-ivory">
        What deserves attention first.
      </h2>
      <div className="mt-5 grid gap-3">
        {priorities.map((priority, index) => (
          <div
            className={`rounded-lg p-4 ${severityVisual(priority.severity).panelClass}`}
            key={priority.label}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-titan-muted">
                  {index + 1}. {priority.label}
                </p>
                <h3 className="text-anywhere mt-1 font-black text-titan-ivory">
                  {priority.title}
                </h3>
              </div>
              <SeverityBadge severity={priority.severity} />
            </div>
            <p className="text-anywhere mt-3 text-sm leading-6 text-titan-ivory/64">
              {priority.description}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-anywhere text-xs font-bold uppercase text-titan-ivory/50">
                {movementArrow(priority.movement)} {priority.movement} ·{" "}
                {priority.confidence}% confidence
              </p>
              <p className="text-anywhere text-xs font-black uppercase text-titan-bright">
                {priority.recommendedFocus}
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function TitanPulseFeed({ items }: { items: TitanPulseItem[] }) {
  return (
    <article className="premium-surface min-w-0 overflow-hidden rounded-lg p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-titan-muted">
            Titan pulse feed
          </p>
          <h2 className="text-anywhere mt-2 text-2xl font-black text-titan-ivory">
            Live strategist activity.
          </h2>
        </div>
        <span className="relative flex size-12 items-center justify-center rounded-full border border-titan-gold/20 bg-titan-gold/10">
          <span className="absolute size-8 animate-ping rounded-full bg-titan-gold/15" />
          <span className="size-2 rounded-full bg-titan-bright shadow-gold" />
        </span>
      </div>
      <div className="mt-6 grid gap-3">
        {items.map((item) => {
          const visual = severityVisual(item.severity);

          return (
            <div
              className="relative grid gap-3 rounded-lg border border-titan-gold/10 bg-black/24 p-4 sm:grid-cols-[auto_minmax(0,1fr)]"
              key={`${item.label}-${item.message}`}
            >
              <div className="flex items-start gap-3 sm:block">
                <span
                  className={`mt-1 block size-2.5 rounded-full ${visual.dotClass} ${visual.pulseClass}`}
                />
                <span className="text-xl font-black text-titan-bright sm:mt-4 sm:block">
                  {movementArrow(item.movement)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-anywhere text-sm font-black text-titan-ivory">
                    {item.label}
                  </p>
                  <SeverityBadge severity={item.severity} />
                </div>
                <p className="text-anywhere mt-2 text-sm leading-6 text-titan-ivory/64">
                  {item.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function MovementVisualization({ metrics }: { metrics: CommandMetric[] }) {
  const featuredMetrics = metrics.slice(0, 5);

  return (
    <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
      <p className="text-sm font-bold uppercase text-titan-muted">
        Movement visualization
      </p>
      <h2 className="text-anywhere mt-2 text-2xl font-black text-titan-ivory">
        Strategic signal movement.
      </h2>
      <div className="mt-6 grid gap-4">
        {featuredMetrics.map((metric, index) => {
          const severity = severityFromMovement(metric.direction, metric.score);
          const visual = severityVisual(severity);
          const curve = buildMiniTrend(metric, index);

          return (
            <div
              className="rounded-lg border border-titan-gold/10 bg-black/24 p-4"
              key={metric.label}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-anywhere text-sm font-black text-titan-ivory">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase text-titan-ivory/45">
                    {movementArrow(metric.direction)} {metric.direction}
                  </p>
                </div>
                <span className={`size-2.5 rounded-full ${visual.dotClass} ${visual.pulseClass}`} />
              </div>
              <div className="mt-4 flex h-12 items-end gap-1.5">
                {curve.map((height, curveIndex) => (
                  <span
                    className="flex-1 rounded-full bg-gradient-to-t from-titan-gold/20 to-titan-bright transition-all duration-700"
                    key={`${metric.label}-${height}-${curveIndex}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-titan-gold transition-all duration-700"
                  style={{ width: `${Math.max(18, metric.score)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function buildMiniTrend(metric: CommandMetric, index: number) {
  const base = Math.max(22, Math.min(78, metric.score));
  const patterns: Record<EvolutionMovementStatus, number[]> = {
    improving: [base - 18, base - 8, base + 4, base + 11, base + 16],
    declining: [base + 18, base + 10, base + 3, base - 8, base - 15],
    stable: [base - 2, base + 2, base - 1, base + 1, base],
    inconsistent: [base + 10, base - 12, base + 16, base - 6, base + 3],
    emerging: [base - 12, base - 3, base + 1, base + 7, base + 12]
  };

  return patterns[metric.direction].map((height) =>
    Math.max(18, Math.min(96, height + (index % 2 === 0 ? 0 : -4)))
  );
}

function StrategicFocusMode({ focus }: { focus: StrategicFocus }) {
  const focusCards = [
    {
      label: "Focus this week",
      value: focus.focusThisWeek,
      severity: "High Priority" as StrategicSeverity
    },
    {
      label: "Ignore temporarily",
      value: focus.ignoreTemporarily,
      severity: "Stable" as StrategicSeverity
    },
    {
      label: "Stabilizing",
      value: focus.stabilizing,
      severity: "Opportunity" as StrategicSeverity
    },
    {
      label: "Becoming dangerous",
      value: focus.becomingDangerous,
      severity: "Warning" as StrategicSeverity
    }
  ];

  return (
    <article className="premium-surface mt-5 min-w-0 rounded-lg p-6 sm:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-titan-muted">
            Strategic focus mode
          </p>
          <h2 className="text-anywhere mt-2 text-2xl font-black text-titan-ivory">
            This week’s operating read.
          </h2>
        </div>
        <span className="rounded-full border border-titan-gold/20 bg-titan-gold/10 px-3 py-1 text-xs font-black uppercase text-titan-bright">
          Prioritized by severity
        </span>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {focusCards.map((card) => (
          <div
            className={`min-w-0 rounded-lg p-4 ${severityVisual(card.severity).panelClass}`}
            key={card.label}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase text-titan-muted">
                {card.label}
              </p>
              <SeverityBadge severity={card.severity} />
            </div>
            <p className="text-anywhere mt-4 text-sm leading-6 text-titan-ivory/68">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
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
  const severity = severityFromMovement(metric.direction, metric.score);
  const visual = severityVisual(severity);

  return (
    <div className={`min-w-0 rounded-lg p-4 transition hover:-translate-y-0.5 ${visual.panelClass}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-anywhere font-black text-titan-ivory">{metric.label}</p>
        <SeverityBadge severity={severity} />
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
