import type { AiAuditResult } from "@/lib/audit-ai";
import type { RequestStatus } from "./ai-audit-panel";

type DashboardStatesProps = {
  auditResult: AiAuditResult;
  requestStatus: RequestStatus;
};

const processingStages = [
  "Scanning profile",
  "Reading content signals",
  "Scoring visibility",
  "Generating recommendations",
  "Building report"
];

export function DashboardStates({
  auditResult,
  requestStatus
}: DashboardStatesProps) {
  const weakestCategories = [...auditResult.categoryScores]
    .sort((first, second) => first.score - second.score)
    .slice(0, 3);
  const missingSignals = [
    ...weakestCategories.map((category) => category.insight),
    ...auditResult.leadReadyAuditReport.findings.slice(0, 2)
  ].slice(0, 4);
  const activeStage =
    requestStatus === "loading"
      ? processingStages.slice(0, 3)
      : requestStatus === "success"
        ? processingStages
        : processingStages.slice(0, 1);

  return (
    <section className="px-5 pb-16 sm:px-8">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 md:grid-cols-2">
        <article className="premium-surface min-w-0 max-w-full rounded-lg p-6">
          <p className="text-sm font-bold uppercase text-titan-muted">
            Detected audit gaps
          </p>
          <h2 className="text-anywhere mt-3 text-2xl font-black text-titan-ivory">
            Weakest signals to resolve next.
          </h2>
          <div className="mt-5 grid min-w-0 gap-3">
            {missingSignals.map((signal) => (
              <div
                className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                key={signal}
              >
                <p className="text-anywhere text-sm leading-6 text-titan-ivory/68">{signal}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="premium-surface min-w-0 max-w-full rounded-lg p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase text-titan-muted">
              AI report workflow
            </p>
            <span className="rounded-full bg-titan-gold/10 px-3 py-1 text-xs font-bold uppercase text-titan-bright">
              {requestStatus === "loading"
                ? "Processing"
                : requestStatus === "success"
                  ? "Complete"
                  : requestStatus === "error"
                    ? "Fallback active"
                    : "Ready"}
            </span>
          </div>
          <h2 className="text-anywhere mt-3 text-2xl font-black text-titan-ivory">
            {requestStatus === "loading"
              ? "Building the audit report"
              : "Report generation path"}
          </h2>
          <div className="mt-5 space-y-3">
            {processingStages.map((stage, index) => {
              const isActive = activeStage.includes(stage);
              const isCurrent =
                requestStatus === "loading" && index === activeStage.length - 1;

              return (
                <div
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                  key={stage}
                >
                  <span
                    className={`size-3 shrink-0 rounded-full ${
                      isActive ? "bg-titan-gold shadow-gold" : "bg-white/15"
                    }`}
                  />
                  <p className="min-w-0 text-sm font-bold text-titan-ivory/72">{stage}</p>
                  {isCurrent ? (
                    <span className="ml-auto text-xs font-bold uppercase text-titan-bright">
                      Running
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
