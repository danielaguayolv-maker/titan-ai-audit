"use client";

import { useState } from "react";
import { createFallbackAuditResult } from "@/lib/audit-fallback";
import type { AiAuditResult, AuditPlatform, LiveScanResult } from "@/lib/audit-ai";
import { AiAuditPanel, type RequestStatus } from "./ai-audit-panel";
import { AuditAssets } from "./audit-assets";
import { CategoryScores } from "./category-scores";
import { DashboardStates } from "./dashboard-states";
import { DashboardShell } from "./dashboard-shell";
import { QuickWins } from "./quick-wins";
import { ScoreSummary } from "./score-summary";

export function DashboardContent() {
  const initialPlatform: AuditPlatform = "instagram";
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
  }

  function handlePlatformChange(platform: AuditPlatform) {
    setPlatform(platform);
    setAuditResult(createFallbackAuditResult(platform));
    setIsUsingFallback(true);
    setRequestStatus("idle");
  }

  return (
    <DashboardShell>
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
      <AuditAssets
        auditResult={auditResult}
        liveScan={liveScan}
        platform={platform}
        profileUrl={profileUrl}
      />
      <DashboardStates auditResult={auditResult} requestStatus={requestStatus} />
    </DashboardShell>
  );
}
