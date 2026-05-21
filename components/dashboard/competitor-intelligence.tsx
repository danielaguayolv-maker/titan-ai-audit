"use client";

import { useMemo, useState, type FormEvent } from "react";
import type {
  AiAuditResult,
  AuditApiResponse,
  AuditPlatform,
  BusinessAuditFormData,
  LiveScanResult,
  ProfileData
} from "@/lib/audit-ai";
import {
  createCompetitorIntelligenceReport,
  type CompetitorComparisonDimension,
  type CompetitorIntelligenceReport,
  type CompetitorSnapshot
} from "@/lib/competitor-intelligence";

type CompetitorIntelligenceProps = {
  platform: AuditPlatform;
};

type RunStatus = "idle" | "loading" | "success" | "error";

type AuditSnapshotState = {
  result: AiAuditResult;
  profileData: ProfileData | null;
  liveScan: LiveScanResult;
  profileUrl: string;
  platform: AuditPlatform;
};

const fieldClass =
  "mt-2 w-full rounded-lg border border-titan-gold/15 bg-black/30 px-4 py-3 text-sm text-titan-ivory outline-none transition placeholder:text-titan-ivory/30 focus:border-titan-bright focus:ring-2 focus:ring-titan-gold/20";

const stages = [
  "Scanning your profile",
  "Scanning competitor profile",
  "Comparing visibility signals",
  "Reading visual strategy",
  "Building competitor intelligence"
];

const platformLabels: Record<AuditPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  general: "General Page"
};

function inferPlatformFromUrl(url: string): AuditPlatform | null {
  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.includes("instagram.com")) {
    return "instagram";
  }

  if (normalizedUrl.includes("tiktok.com")) {
    return "tiktok";
  }

  return null;
}

function profileNameFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const handle =
      parsedUrl.pathname
        .split("/")
        .filter(Boolean)
        .find((segment) => segment.startsWith("@")) ??
      parsedUrl.pathname.split("/").filter(Boolean)[0] ??
      parsedUrl.hostname;

    return handle.replace(/^@/, "") || parsedUrl.hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "") || "Profile";
  }
}

function buildAuditPayload(
  profileUrl: string,
  platform: AuditPlatform,
  role: "your profile" | "competitor"
): BusinessAuditFormData {
  const detectedPlatform = inferPlatformFromUrl(profileUrl) ?? platform;
  const profileName = profileNameFromUrl(profileUrl);

  return {
    platform: detectedPlatform,
    businessName: profileName,
    industry: "",
    city: "",
    website: "",
    goals:
      role === "competitor"
        ? "Competitor intelligence comparison"
        : "Visibility benchmark against a competitor",
    currentChallenges:
      role === "competitor"
        ? "Analyze this account as the competitor benchmark inside Titan Visibility OS."
        : "Analyze this account as the user's profile inside Titan Visibility OS competitor intelligence.",
    profileUrl,
    bio: "",
    usernameDisplayName: profileName,
    pinnedPostTopics: "",
    recentCaptions: "",
    targetCustomer: "",
    offer: "",
    location: "",
    businessGoal: "Compare visibility strategy, content rhythm, audience psychology, and conversion signals."
  };
}

async function runAuditForProfile(
  profileUrl: string,
  platform: AuditPlatform,
  role: "your profile" | "competitor"
): Promise<AuditSnapshotState> {
  const payload = buildAuditPayload(profileUrl, platform, role);
  const response = await fetch("/api/audit", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = (await response.json()) as AuditApiResponse;

  if (!response.ok || "error" in data) {
    throw new Error(
      "error" in data
        ? `${role === "competitor" ? "Competitor" : "Your"} audit failed: ${data.error}`
        : "The competitor intelligence audit could not be generated."
    );
  }

  return {
    result: data.result,
    profileData: data.profileData,
    liveScan: data.liveScan,
    profileUrl,
    platform: payload.platform
  };
}

export function CompetitorIntelligence({
  platform
}: CompetitorIntelligenceProps) {
  const [yourProfileUrl, setYourProfileUrl] = useState("");
  const [competitorProfileUrl, setCompetitorProfileUrl] = useState("");
  const [status, setStatus] = useState<RunStatus>("idle");
  const [error, setError] = useState("");
  const [activeStage, setActiveStage] = useState(-1);
  const [yourAudit, setYourAudit] = useState<AuditSnapshotState | null>(null);
  const [competitorAudit, setCompetitorAudit] =
    useState<AuditSnapshotState | null>(null);

  const report = useMemo<CompetitorIntelligenceReport | null>(() => {
    if (!yourAudit || !competitorAudit) {
      return null;
    }

    const yourSnapshot: CompetitorSnapshot = yourAudit;
    const competitorSnapshot: CompetitorSnapshot = competitorAudit;

    return createCompetitorIntelligenceReport(yourSnapshot, competitorSnapshot);
  }, [competitorAudit, yourAudit]);

  async function submitComparison(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setYourAudit(null);
    setCompetitorAudit(null);
    setActiveStage(0);

    try {
      const yourResult = await runAuditForProfile(
        yourProfileUrl.trim(),
        inferPlatformFromUrl(yourProfileUrl) ?? platform,
        "your profile"
      );
      setYourAudit(yourResult);
      setActiveStage(1);

      const competitorResult = await runAuditForProfile(
        competitorProfileUrl.trim(),
        inferPlatformFromUrl(competitorProfileUrl) ?? yourResult.platform,
        "competitor"
      );
      setCompetitorAudit(competitorResult);
      setActiveStage(4);
      setStatus("success");
    } catch (caughtError) {
      setStatus("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Competitor intelligence could not be generated right now."
      );
    }
  }

  return (
    <section className="px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
      <div className="mx-auto w-full max-w-7xl">
        <article className="premium-surface min-w-0 rounded-lg p-6 shadow-gold sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase text-titan-muted">
                Competitor Intelligence
              </p>
              <h1 className="text-anywhere mt-3 text-4xl font-black leading-tight text-titan-ivory sm:text-6xl">
                Reverse-engineer why one account wins attention.
              </h1>
              <p className="text-anywhere mt-5 max-w-3xl text-lg leading-8 text-titan-ivory/66">
                Paste your profile and a competitor profile. Titan Visibility OS
                runs both through the shared audit engine, then compares hooks,
                proof, CTA clarity, visual pacing, content rhythm, and audience
                psychology.
              </p>
            </div>

            <form
              className="min-w-0 rounded-lg border border-titan-gold/15 bg-black/24 p-4 sm:p-5"
              onSubmit={submitComparison}
            >
              <label className="block min-w-0 text-sm font-bold text-titan-ivory/72">
                Your profile URL
                <input
                  className={`${fieldClass} min-h-14 text-base`}
                  onChange={(event) => setYourProfileUrl(event.target.value)}
                  placeholder="https://www.instagram.com/yourbrand"
                  required
                  type="url"
                  value={yourProfileUrl}
                />
              </label>

              <label className="mt-4 block min-w-0 text-sm font-bold text-titan-ivory/72">
                Competitor profile URL
                <input
                  className={`${fieldClass} min-h-14 text-base`}
                  onChange={(event) => setCompetitorProfileUrl(event.target.value)}
                  placeholder="https://www.instagram.com/competitor"
                  required
                  type="url"
                  value={competitorProfileUrl}
                />
              </label>

              <button
                className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-titan-gold px-7 text-sm font-black uppercase text-black shadow-gold transition hover:-translate-y-0.5 hover:bg-titan-bright hover:shadow-[0_20px_70px_rgba(244,211,123,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={status === "loading"}
                type="submit"
              >
                {status === "loading" ? "Building Intelligence..." : "Compare Profiles"}
              </button>

              <div className="mt-4 flex flex-wrap gap-2">
                {["Hooks", "Visual strategy", "CTA clarity", "Audience psychology"].map((item) => (
                  <span
                    className="rounded-full border border-titan-gold/15 bg-titan-gold/10 px-3 py-1 text-xs font-bold uppercase text-titan-bright"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </form>
          </div>
        </article>

        {status === "loading" ? (
          <LoadingStages activeStage={activeStage} />
        ) : null}

        {status === "error" ? (
          <article className="mt-5 rounded-lg border border-red-400/25 bg-red-500/10 p-5">
            <p className="text-sm font-bold text-red-100">
              Competitor intelligence request failed
            </p>
            <p className="text-anywhere mt-2 text-sm leading-6 text-red-100/72">
              {error}
            </p>
          </article>
        ) : null}

        {report && yourAudit && competitorAudit ? (
          <CompetitorReport
            competitorAudit={competitorAudit}
            report={report}
            yourAudit={yourAudit}
          />
        ) : (
          status === "idle" ? <CompetitorEmptyState /> : null
        )}
      </div>
    </section>
  );
}

function LoadingStages({ activeStage }: { activeStage: number }) {
  return (
    <article className="premium-surface mt-5 rounded-lg p-6">
      <p className="text-sm font-bold uppercase text-titan-muted">
        Intelligence run
      </p>
      <div className="mt-5 grid gap-3">
        {stages.map((stage, index) => (
          <div
            className="flex items-center gap-3 rounded-lg border border-titan-gold/10 bg-black/24 p-4"
            key={stage}
          >
            <span
              className={`size-3 shrink-0 rounded-full ${
                index <= activeStage ? "bg-titan-gold shadow-gold" : "bg-white/15"
              }`}
            />
            <p className="text-sm font-bold text-titan-ivory/72">{stage}</p>
            {index === activeStage ? (
              <span className="ml-auto text-xs font-black uppercase text-titan-bright">
                Running
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}

function CompetitorEmptyState() {
  return (
    <article className="premium-surface mt-5 rounded-lg p-6 sm:p-8">
      <p className="text-sm font-bold uppercase text-titan-muted">
        Ready for reverse-engineering
      </p>
      <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory">
        Compare accounts by behavior, not vanity metrics.
      </h2>
      <p className="text-anywhere mt-4 max-w-3xl leading-7 text-titan-ivory/62">
        The report will show what the competitor does better, what you do
        better, and the biggest opportunity gap across visual execution,
        emotional triggers, content rhythm, and conversion clarity.
      </p>
    </article>
  );
}

function CompetitorReport({
  competitorAudit,
  report,
  yourAudit
}: {
  competitorAudit: AuditSnapshotState;
  report: CompetitorIntelligenceReport;
  yourAudit: AuditSnapshotState;
}) {
  return (
    <div className="mt-5 grid gap-5">
      <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ProfileSummary
            label="Your profile"
            niche={report.yourNiche.label}
            scan={yourAudit.liveScan}
            snapshot={yourAudit}
          />
          <ProfileSummary
            label="Competitor"
            niche={report.competitorNiche.label}
            scan={competitorAudit.liveScan}
            snapshot={competitorAudit}
          />
        </div>
      </article>

      <div className="grid gap-5 lg:grid-cols-3">
        <InsightCard
          eyebrow="What They Do Better"
          items={report.whatTheyDoBetter}
          title="Competitor edge"
        />
        <InsightCard
          eyebrow="What You Do Better"
          items={report.whatYouDoBetter}
          title="Defendable advantage"
        />
        <article className="premium-surface min-w-0 rounded-lg p-6">
          <p className="text-sm font-bold uppercase text-titan-muted">
            Biggest Opportunity Gap
          </p>
          <h2 className="text-anywhere mt-3 text-2xl font-black text-titan-bright">
            Where to attack first
          </h2>
          <p className="text-anywhere mt-4 text-sm leading-7 text-titan-ivory/66">
            {report.biggestOpportunityGap}
          </p>
        </article>
      </div>

      <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-8">
        <p className="text-sm font-bold uppercase text-titan-muted">
          Signal-by-signal comparison
        </p>
        <div className="mt-6 grid gap-4">
          {report.dimensions.map((dimension) => (
            <DimensionCard dimension={dimension} key={dimension.label} />
          ))}
        </div>
      </article>

      <div className="grid gap-5 xl:grid-cols-2">
        <InsightCard
          eyebrow="Strategic strengths"
          items={report.strategicStrengths}
          title="What to protect"
        />
        <InsightCard
          eyebrow="Strategic weaknesses"
          items={report.strategicWeaknesses}
          title="What to tighten"
        />
        <InsightCard
          eyebrow="Visibility gaps"
          items={report.visibilityGaps}
          title="Where competitor pressure shows up"
        />
        <InsightCard
          eyebrow="Content opportunities"
          items={report.contentOpportunities}
          title="What to create next"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <InsightCard
          eyebrow="Hook / style differences"
          items={report.hookStyleDifferences}
          title="First-frame psychology"
        />
        <InsightCard
          eyebrow="CTA differences"
          items={report.ctaDifferences}
          title="Conversion behavior"
        />
        <InsightCard
          eyebrow="Visual execution differences"
          items={report.visualExecutionDifferences}
          title="Content direction"
        />
        <InsightCard
          eyebrow="Audience psychology"
          items={report.audiencePsychologyDifferences}
          title="Why the audience responds"
        />
      </div>
    </div>
  );
}

function ProfileSummary({
  label,
  niche,
  scan,
  snapshot
}: {
  label: string;
  niche: string;
  scan: LiveScanResult;
  snapshot: AuditSnapshotState;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-titan-muted">
            {label}
          </p>
          <h2 className="text-anywhere mt-2 text-2xl font-black text-titan-ivory">
            {snapshot.result.businessName}
          </h2>
          <p className="text-anywhere mt-2 text-sm leading-6 text-titan-ivory/56">
            {snapshot.profileUrl}
          </p>
        </div>
        <span className="rounded-full bg-titan-gold px-3 py-1 text-xs font-black uppercase text-black">
          {Math.round(snapshot.result.overallScore)}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-titan-gold/15 bg-titan-gold/10 px-3 py-1 text-xs font-bold uppercase text-titan-bright">
          {platformLabels[snapshot.platform]}
        </span>
        <span className="rounded-full border border-titan-gold/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase text-titan-ivory/64">
          {niche}
        </span>
        <span className="rounded-full border border-titan-gold/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase text-titan-ivory/64">
          {scan.status}
        </span>
      </div>
      <p className="text-anywhere mt-4 text-sm leading-6 text-titan-ivory/62">
        {snapshot.result.personalizedDiagnosis}
      </p>
    </div>
  );
}

function DimensionCard({
  dimension
}: {
  dimension: CompetitorComparisonDimension;
}) {
  const competitorAhead = dimension.scoreDelta > 4;
  const youAhead = dimension.scoreDelta < -4;

  return (
    <div className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-titan-muted">
            Competitive signal
          </p>
          <h3 className="text-anywhere mt-2 text-2xl font-black text-titan-bright">
            {dimension.label}
          </h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase text-titan-ivory/70">
          {competitorAhead
            ? "Competitor edge"
            : youAhead
              ? "Your edge"
              : "Close signal"}
        </span>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <SignalBlock label="Your signal" text={dimension.yourSignal} />
        <SignalBlock label="Competitor signal" text={dimension.competitorSignal} />
      </div>
      <p className="text-anywhere mt-5 text-sm leading-7 text-titan-ivory/68">
        {dimension.strategicRead}
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <DiagnosticBlock title="Why it hurts" text={dimension.whyItMatters} />
        <DiagnosticBlock title="Retention read" text={dimension.retentionRead} />
        <DiagnosticBlock title="Sequence fix" text={dimension.sequenceFix} />
        <DiagnosticBlock title="Missing trigger" text={dimension.emotionalTrigger} />
      </div>
      <p className="text-anywhere mt-3 rounded-lg border border-titan-gold/10 bg-titan-gold/10 p-4 text-sm leading-6 text-titan-ivory/72">
        {dimension.contentDirection}
      </p>
    </div>
  );
}

function DiagnosticBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/20 p-4">
      <p className="text-xs font-black uppercase text-titan-bright">{title}</p>
      <p className="text-anywhere mt-2 text-sm leading-6 text-titan-ivory/62">
        {text}
      </p>
    </div>
  );
}

function SignalBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-black uppercase text-titan-muted">{label}</p>
      <p className="text-anywhere mt-2 text-sm leading-6 text-titan-ivory/62">
        {text}
      </p>
    </div>
  );
}

function InsightCard({
  eyebrow,
  items,
  title
}: {
  eyebrow: string;
  items: string[];
  title: string;
}) {
  return (
    <article className="premium-surface min-w-0 rounded-lg p-6">
      <p className="text-sm font-bold uppercase text-titan-muted">{eyebrow}</p>
      <h2 className="text-anywhere mt-3 text-2xl font-black text-titan-ivory">
        {title}
      </h2>
      <div className="mt-5 grid gap-3">
        {(items.length > 0 ? items : ["No major gap detected yet. Re-run with richer profile data for a sharper read."]).map((item) => (
          <p
            className="text-anywhere rounded-lg border border-titan-gold/10 bg-black/24 p-4 text-sm leading-6 text-titan-ivory/66"
            key={item}
          >
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}
