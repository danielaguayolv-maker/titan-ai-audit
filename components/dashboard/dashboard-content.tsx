"use client";

import { useState } from "react";
import { createFallbackAuditResult } from "@/lib/audit-fallback";
import type { AiAuditResult, AuditPlatform, LiveScanResult } from "@/lib/audit-ai";
import { AiAuditPanel, type RequestStatus } from "./ai-audit-panel";
import { AuditAssets } from "./audit-assets";
import { CategoryScores } from "./category-scores";
import { ContentBuddy } from "./content-buddy";
import { DashboardStates } from "./dashboard-states";
import { DashboardShell, type TitanOsModule } from "./dashboard-shell";
import { QuickWins } from "./quick-wins";
import { ScoreSummary } from "./score-summary";

export function DashboardContent() {
  const initialPlatform: AuditPlatform = "instagram";
  const [activeModule, setActiveModule] = useState<TitanOsModule>("audit");
  const [auditResult, setAuditResult] = useState<AiAuditResult>(() =>
    createFallbackAuditResult(initialPlatform)
  );
  const [isUsingFallback, setIsUsingFallback] = useState(true);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [platform, setPlatform] = useState<AuditPlatform>(initialPlatform);
  const [profileUrl, setProfileUrl] = useState("");
  const [liveScan, setLiveScan] = useState<LiveScanResult>({
    status: "skipped",
    message: "Live Scan: Ready",
    dataPointsFound: [],
    missingDataPoints: [],
    scanCompleteness: 0,
    confidenceScore: 0,
    metricsStatus: "limited"
  });

  function handleAuditGenerated(result: AiAuditResult) {
    setAuditResult(result);
    setIsUsingFallback(false);
    setActiveModule("contentbuddy");
  }

  function handlePlatformChange(platform: AuditPlatform) {
    setPlatform(platform);
    setAuditResult(createFallbackAuditResult(platform));
    setIsUsingFallback(true);
    setRequestStatus("idle");
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
            isUsingFallback={isUsingFallback}
            onAuditGenerated={handleAuditGenerated}
            onLiveScanChange={setLiveScan}
            onPlatformChange={handlePlatformChange}
            onProfileUrlChange={setProfileUrl}
            onStatusChange={setRequestStatus}
          />
          <ScoreSummary auditResult={auditResult} isUsingFallback={isUsingFallback} />
          <CategoryScores categories={auditResult.categoryScores} />
          <QuickWins quickWins={auditResult.topQuickWins} />
          <DashboardStates auditResult={auditResult} requestStatus={requestStatus} />
        </>
      ) : null}

      {activeModule === "contentbuddy" ? (
        <ContentBuddy
          auditResult={auditResult}
          isUsingFallback={isUsingFallback}
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

      {activeModule !== "audit" &&
      activeModule !== "contentbuddy" &&
      activeModule !== "reports" ? (
        <ModulePlaceholder
          auditResult={auditResult}
          module={activeModule}
          onOpenContentBuddy={() => setActiveModule("contentbuddy")}
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
  onOpenContentBuddy
}: {
  auditResult: AiAuditResult;
  module: TitanOsModule;
  onOpenAudit: () => void;
  onOpenContentBuddy: () => void;
}) {
  const moduleLabels: Record<TitanOsModule, string> = {
    audit: "Visibility Audit",
    contentbuddy: "ContentBuddy",
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
            is Visibility Audit to ContentBuddy to Reports.
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
              onClick={onOpenContentBuddy}
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
