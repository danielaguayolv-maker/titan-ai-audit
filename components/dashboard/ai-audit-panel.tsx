"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  emptyBusinessAuditForm,
  type AuditPlatform,
  type AiAuditResult,
  type AuditApiResponse,
  type BusinessAuditFormData,
  type LiveScanResult,
  type ProfileData
} from "@/lib/audit-ai";

export type RequestStatus = "idle" | "loading" | "success" | "error";

type AiAuditPanelProps = {
  auditResult: AiAuditResult;
  isUsingFallback: boolean;
  onAuditGenerated: (
    result: AiAuditResult,
    context: { formData: BusinessAuditFormData; profileData: ProfileData | null }
  ) => void;
  onLiveScanChange: (liveScan: LiveScanResult) => void;
  onPlatformChange: (platform: AuditPlatform) => void;
  onProfileUrlChange: (profileUrl: string) => void;
  onStatusChange: (status: RequestStatus) => void;
};

export type LeadCaptureData = {
  name: string;
  email: string;
  businessCreatorName: string;
  phone: string;
  capturedAt?: string;
};

const fieldClass =
  "mt-2 w-full rounded-lg border border-titan-gold/15 bg-black/30 px-4 py-3 text-sm text-titan-ivory outline-none transition placeholder:text-titan-ivory/30 focus:border-titan-bright focus:ring-2 focus:ring-titan-gold/20";
const leadStorageKey = "titan-visibility-os-lead";

const loadingStages = [
  "Scanning profile",
  "Reading content signals",
  "Scoring visibility",
  "Generating recommendations",
  "Building report"
];

const initialLiveScan: LiveScanResult = {
  status: "skipped",
  message: "Live Scan: Ready",
  dataPointsFound: [],
  missingDataPoints: [],
  scanCompleteness: 0,
  confidenceScore: 0,
  metricsStatus: "limited"
};

const scanningLiveScan: LiveScanResult = {
  status: "scanning",
  message: "Live Scan: Scanning",
  dataPointsFound: [],
  missingDataPoints: [],
  scanCompleteness: 0,
  confidenceScore: 0,
  metricsStatus: "limited"
};

const platformLabels: Record<AuditPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  general: "General Business Page"
};

const platformFocus: Record<AuditPlatform, string[]> = {
  instagram: [
    "Bio clarity",
    "Profile name SEO",
    "Pinned posts",
    "Recent captions",
    "Content consistency",
    "CTA strength",
    "Local keywords",
    "Offer clarity"
  ],
  tiktok: [
    "Bio clarity",
    "Hook strength",
    "Video topics",
    "Retention strategy",
    "Posting consistency",
    "Conversion path",
    "Search intent",
    "CTA strength"
  ],
  general: [
    "Offer clarity",
    "Local SEO",
    "Lead capture",
    "Trust signals",
    "Content quality",
    "CTA strength"
  ]
};

export function AiAuditPanel({
  auditResult,
  isUsingFallback,
  onAuditGenerated,
  onLiveScanChange,
  onPlatformChange,
  onProfileUrlChange,
  onStatusChange
}: AiAuditPanelProps) {
  const [formData, setFormData] =
    useState<BusinessAuditFormData>(emptyBusinessAuditForm);
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [error, setError] = useState("");
  const [liveScan, setLiveScan] = useState<LiveScanResult>(initialLiveScan);
  const [leadData, setLeadData] = useState<LeadCaptureData>({
    name: "",
    email: "",
    businessCreatorName: "",
    phone: ""
  });
  const currentLoadingStage = status === "loading" ? loadingStages.length - 2 : -1;
  const showFallbackReason =
    process.env.NODE_ENV !== "production" &&
    (liveScan.status === "fallback" || liveScan.status === "failed") &&
    Boolean(liveScan.fallbackReason);

  useEffect(() => {
    try {
      const storedLead = window.localStorage.getItem(leadStorageKey);

      if (storedLead) {
        setLeadData(JSON.parse(storedLead) as LeadCaptureData);
      }
    } catch {
      // Local persistence is optional and should never block an audit.
    }
  }, []);

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

  function updateField(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const nextValue = event.target.value;

    if (event.target.name === "platform") {
      onPlatformChange(nextValue as AuditPlatform);
    }

    if (event.target.name === "profileUrl") {
      onProfileUrlChange(nextValue);
      const inferredPlatform = inferPlatformFromUrl(nextValue);

      if (inferredPlatform && inferredPlatform !== formData.platform) {
        onPlatformChange(inferredPlatform);
        setFormData((current) => ({
          ...current,
          platform: inferredPlatform,
          profileUrl: nextValue
        }));
        return;
      }
    }

    setFormData((current) => ({
      ...current,
      [event.target.name]: nextValue
    }));
  }

  function updateLeadField(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setLeadData((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function submitAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requestPlatform = inferPlatformFromUrl(formData.profileUrl) ?? formData.platform;
    const requestData = {
      ...formData,
      platform: requestPlatform,
      profileUrl: formData.profileUrl.trim(),
      businessName:
        formData.businessName ||
        formData.usernameDisplayName ||
        leadData.businessCreatorName
    };
    const capturedLead: LeadCaptureData = {
      ...leadData,
      name: leadData.name.trim(),
      email: leadData.email.trim(),
      businessCreatorName: leadData.businessCreatorName.trim(),
      phone: leadData.phone.trim(),
      capturedAt: new Date().toISOString()
    };

    try {
      window.localStorage.setItem(leadStorageKey, JSON.stringify(capturedLead));
    } catch {
      // Temporary local lead storage is best-effort until database persistence is added.
    }

    if (requestPlatform !== formData.platform) {
      setFormData((current) => ({
        ...current,
        platform: requestPlatform
      }));
      onPlatformChange(requestPlatform);
    }

    onProfileUrlChange(requestData.profileUrl);
    setStatus("loading");
    onStatusChange("loading");
    setLiveScan(scanningLiveScan);
    onLiveScanChange(scanningLiveScan);
    setError("");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });
      const payload = (await response.json()) as AuditApiResponse;

      if (!response.ok || "error" in payload) {
        if ("liveScan" in payload && payload.liveScan) {
          setLiveScan(payload.liveScan);
          onLiveScanChange(payload.liveScan);
        }

        throw new Error(
          "error" in payload
            ? payload.error
            : "The audit could not be generated right now."
        );
      }

      setLiveScan(payload.liveScan);
      onLiveScanChange(payload.liveScan);
      onAuditGenerated(payload.result, {
        formData: requestData,
        profileData: payload.profileData
      });
      setStatus("success");
      onStatusChange("success");
    } catch (caughtError) {
      setStatus("error");
      onStatusChange("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The audit could not be generated right now."
      );
    }
  }

  return (
    <section className="relative px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
      <div className="subtle-grid pointer-events-none absolute inset-x-0 top-0 h-80" />
      <div className="mx-auto w-full max-w-7xl">
        <form className="premium-surface fade-up relative min-w-0 max-w-full rounded-lg p-6 sm:p-8 lg:p-10" onSubmit={submitAudit}>
          <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] lg:items-start">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase text-titan-muted">
                Visibility Audit
              </p>
              <h2 className="text-anywhere mt-3 max-w-3xl text-4xl font-black leading-tight text-titan-ivory sm:text-6xl">
                Paste a profile URL.{" "}
                <span className="gold-text">Run a premium visibility audit.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-titan-ivory/66">
                Start with an Instagram or TikTok URL. Add deeper context only if
                you want a sharper, more personalized report.
              </p>
            </div>

            <div className="min-w-0 max-w-full rounded-lg border border-titan-gold/15 bg-black/24 p-4 sm:p-5">
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="min-w-0 text-sm font-bold text-titan-ivory/72">
                  Profile URL
                  <input
                    className={`${fieldClass} min-h-14 text-base`}
                    name="profileUrl"
                    onChange={updateField}
                    placeholder="https://www.instagram.com/yourbusiness"
                    required
                    type="url"
                    value={formData.profileUrl}
                  />
                </label>
                <label className="min-w-0 text-sm font-bold text-titan-ivory/72">
                  Platform
                  <select
                    className={`${fieldClass} min-h-14 sm:min-w-48`}
                    name="platform"
                    onChange={updateField}
                    value={formData.platform}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="general">General Page</option>
                  </select>
                </label>
              </div>

              <div className="mt-5 rounded-lg border border-titan-gold/15 bg-black/30 p-4">
                <p className="text-xs font-black uppercase text-titan-muted">
                  Unlock the full report
                </p>
                <h3 className="mt-2 text-xl font-black text-titan-ivory">
                  Where should we send the visibility strategy?
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="min-w-0 text-sm font-bold text-titan-ivory/72">
                    Name
                    <input
                      className={fieldClass}
                      name="name"
                      onChange={updateLeadField}
                      required
                      value={leadData.name}
                    />
                  </label>
                  <label className="min-w-0 text-sm font-bold text-titan-ivory/72">
                    Email
                    <input
                      className={fieldClass}
                      name="email"
                      onChange={updateLeadField}
                      required
                      type="email"
                      value={leadData.email}
                    />
                  </label>
                  <label className="min-w-0 text-sm font-bold text-titan-ivory/72">
                    Business / Creator Name
                    <input
                      className={fieldClass}
                      name="businessCreatorName"
                      onChange={updateLeadField}
                      required
                      value={leadData.businessCreatorName}
                    />
                  </label>
                  <label className="min-w-0 text-sm font-bold text-titan-ivory/72">
                    Phone <span className="text-titan-ivory/36">(optional)</span>
                    <input
                      className={fieldClass}
                      name="phone"
                      onChange={updateLeadField}
                      type="tel"
                      value={leadData.phone}
                    />
                  </label>
                </div>
              </div>

              <button
                className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-titan-gold px-7 text-sm font-black uppercase text-black shadow-gold transition hover:-translate-y-0.5 hover:bg-titan-bright hover:shadow-[0_20px_70px_rgba(244,211,123,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={status === "loading"}
                type="submit"
              >
                {status === "loading" ? "Running Visibility Audit..." : "Run Visibility Audit"}
              </button>

              <div className="mt-4 flex flex-wrap gap-2">
                {platformFocus[formData.platform].slice(0, 6).map((item) => (
                  <span
                    className="rounded-full border border-titan-gold/15 bg-titan-gold/10 px-3 py-1 text-xs font-bold uppercase text-titan-bright"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <details className="mt-7 rounded-lg border border-titan-gold/15 bg-black/20 p-4">
            <summary className="cursor-pointer text-sm font-black uppercase text-titan-bright">
              Advanced Details
            </summary>
            <p className="mt-3 text-sm leading-6 text-titan-ivory/58">
              Optional context improves the audit, but the URL is enough to run.
            </p>

            <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="min-w-0 text-sm font-bold text-titan-ivory/72">
                Username / display name
                <input
                  className={fieldClass}
                  name="usernameDisplayName"
                  onChange={updateField}
                  value={formData.usernameDisplayName}
                />
              </label>
              <label className="min-w-0 text-sm font-bold text-titan-ivory/72">
                Target customer
                <input
                  className={fieldClass}
                  name="targetCustomer"
                  onChange={updateField}
                  value={formData.targetCustomer}
                />
              </label>
              <label className="min-w-0 text-sm font-bold text-titan-ivory/72">
                Offer
                <input
                  className={fieldClass}
                  name="offer"
                  onChange={updateField}
                  value={formData.offer}
                />
              </label>
              <label className="min-w-0 text-sm font-bold text-titan-ivory/72">
                Location
                <input
                  className={fieldClass}
                  name="location"
                  onChange={updateField}
                  value={formData.location}
                />
              </label>
              <label className="min-w-0 text-sm font-bold text-titan-ivory/72 sm:col-span-2">
                Business goal
                <input
                  className={fieldClass}
                  name="businessGoal"
                  onChange={updateField}
                  value={formData.businessGoal}
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-bold text-titan-ivory/72">
              Bio
              <textarea
                className={fieldClass}
                name="bio"
                onChange={updateField}
                rows={3}
                value={formData.bio}
              />
            </label>

            <label className="mt-4 block text-sm font-bold text-titan-ivory/72">
              Pinned post topics
              <textarea
                className={fieldClass}
                name="pinnedPostTopics"
                onChange={updateField}
                rows={3}
                value={formData.pinnedPostTopics}
              />
            </label>

            <label className="mt-4 block text-sm font-bold text-titan-ivory/72">
              Recent captions or video descriptions
              <textarea
                className={fieldClass}
                name="recentCaptions"
                onChange={updateField}
                rows={4}
                value={formData.recentCaptions}
              />
            </label>
          </details>

          {status === "error" ? (
            <div className="mt-5 rounded-lg border border-red-400/25 bg-red-500/10 p-4">
              <p className="text-sm font-bold text-red-100">Visibility intelligence request failed</p>
              <p className="mt-2 text-sm leading-6 text-red-100/72">{error}</p>
              <p className="mt-2 text-sm leading-6 text-titan-ivory/58">
                {isUsingFallback
                  ? "Showing the local scoring fallback below."
                  : "Keeping the latest successful audit visible below."}
              </p>
            </div>
          ) : null}
        </form>

        {status === "idle" && isUsingFallback ? null : (
        <article className="premium-surface mt-5 min-w-0 max-w-full rounded-lg p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-titan-muted">
                Generated output
              </p>
              <h2 className="mt-3 text-3xl font-black text-titan-ivory">
                {isUsingFallback ? "Readiness baseline" : "Visibility Audit result"}
              </h2>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-titan-ivory/70">
              {status === "loading"
                ? "Loading"
                : isUsingFallback
                  ? "Local fallback"
                  : "Live intelligence"}
            </span>
          </div>

          <div className="mt-5 min-w-0 max-w-full rounded-lg border border-titan-gold/15 bg-black/24 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-titan-bright">
                  {liveScan.message}
                </p>
                <p className="mt-1 text-sm leading-6 text-titan-ivory/58">
                  {liveScan.status === "scanning"
                    ? "Checking the live public profile now. Each audit starts with a fresh scan for the submitted URL."
                    : liveScan.status === "success"
                      ? "Apify returned public profile signals for this audit."
                      : liveScan.status === "partial"
                        ? "Apify returned some profile data, but not every public metric was available. The report uses confirmed signals and flags missing data."
                        : liveScan.status === "fallback" || liveScan.status === "failed"
                          ? formData.platform === "tiktok"
                            ? "TikTok data was not returned reliably by Apify. The AI audit still ran using the URL and any optional details you provided."
                            : "The live scan could not complete, so the audit continued with URL-only mode and optional context."
                          : "Paste a profile URL and run an audit to start the live scan."}
                </p>
                {showFallbackReason ? (
                  <p className="mt-2 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-100/80">
                    <span className="text-anywhere">{liveScan.fallbackReason}</span>
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-titan-ivory/70">
                  {liveScan.status === "scanning"
                    ? "Scanning"
                    : liveScan.status === "success"
                      ? "Live scan success"
                      : liveScan.status === "partial"
                        ? "Live scan partial"
                        : liveScan.status === "fallback"
                          ? "Using URL-only fallback"
                          : liveScan.status === "failed"
                            ? "Live scan failed"
                            : "Ready"}
                </span>
                <span className="rounded-full bg-titan-gold/10 px-3 py-1 text-xs font-bold uppercase text-titan-bright">
                  Quality {liveScan.scanCompleteness ?? 0}%
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-titan-ivory/70">
                  Confidence {liveScan.confidenceScore ?? 0}%
                </span>
              </div>
            </div>

            <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-3">
                <p className="text-xs font-bold uppercase text-titan-muted">
                  Platform detection
                </p>
                <p className="mt-2 text-sm font-black text-titan-ivory">
                  {platformLabels[formData.platform]}
                </p>
              </div>
              <div className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-3">
                <p className="text-xs font-bold uppercase text-titan-muted">
                  Metrics
                </p>
                <p className="mt-2 text-sm font-black capitalize text-titan-ivory">
                  {liveScan.metricsStatus ?? "limited"}
                </p>
              </div>
              <div className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-3">
                <p className="text-xs font-bold uppercase text-titan-muted">
                  Data points
                </p>
                <p className="mt-2 text-sm font-black text-titan-ivory">
                  {liveScan.dataPointsFound.length} extracted
                </p>
              </div>
            </div>

            {liveScan.dataPointsFound.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {liveScan.dataPointsFound.map((point) => (
                  <span
                    className="rounded-full border border-titan-gold/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase text-titan-ivory/66"
                    key={point}
                  >
                    {point}
                  </span>
                ))}
              </div>
            ) : null}

            {liveScan.missingDataPoints && liveScan.missingDataPoints.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase text-titan-muted">
                  Missing data
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {liveScan.missingDataPoints.slice(0, 8).map((point) => (
                    <span
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-bold uppercase text-titan-ivory/45"
                      key={point}
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {status === "loading" ? (
            <div className="mt-7 grid gap-3">
              {loadingStages.map((stage, index) => {
                const isActive = index <= currentLoadingStage;
                const isCurrent = index === currentLoadingStage;

                return (
                  <div
                    className="flex items-center gap-3 rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                    key={stage}
                  >
                    <span
                      className={`size-3 shrink-0 rounded-full ${
                        isActive ? "bg-titan-gold shadow-gold" : "bg-white/15"
                      }`}
                    />
                    <p className="text-sm font-bold text-titan-ivory/72">{stage}</p>
                    {isCurrent ? (
                      <span className="ml-auto text-xs font-black uppercase text-titan-bright">
                        Running
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-7 min-w-0 space-y-6">
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase text-titan-bright">
                  Diagnosis
                </p>
                <p className="text-anywhere mt-3 leading-7 text-titan-ivory/72">
                  {auditResult.personalizedDiagnosis}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold uppercase text-titan-bright">
                  Optimized bio
                </p>
                <p className="text-anywhere mt-3 rounded-lg border border-titan-gold/15 bg-titan-gold/10 p-4 font-bold leading-7 text-titan-ivory">
                  {auditResult.optimizedBio}
                </p>
              </div>

              <div className="grid min-w-0 gap-3">
                <p className="text-sm font-bold uppercase text-titan-bright">
                  Top quick wins
                </p>
                {auditResult.topQuickWins.map((win) => (
                  <div
                    className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                    key={win.title}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-anywhere mr-auto min-w-0 font-black text-titan-ivory">
                        {win.title}
                      </h3>
                      <span className="rounded-full bg-titan-gold px-2 py-1 text-xs font-black uppercase text-black">
                        {win.impact}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold uppercase text-titan-ivory/70">
                        {win.effort} effort
                      </span>
                    </div>
                    <p className="text-anywhere mt-3 text-sm leading-6 text-titan-ivory/64">
                      {win.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold uppercase text-titan-bright">
                  Lead-ready report
                </p>
                <h3 className="text-anywhere mt-3 text-2xl font-black text-titan-ivory">
                  {auditResult.leadReadyAuditReport.headline}
                </h3>
                <p className="text-anywhere mt-3 leading-7 text-titan-ivory/68">
                  {auditResult.leadReadyAuditReport.summary}
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase text-titan-bright">
                    Content recommendations
                  </p>
                  <div className="mt-3 grid gap-2">
                    {auditResult.contentRecommendations.map((recommendation) => (
                      <p
                        className="text-anywhere min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-3 text-sm leading-6 text-titan-ivory/68"
                        key={recommendation}
                      >
                        {recommendation}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase text-titan-bright">
                    Report next steps
                  </p>
                  <div className="mt-3 grid gap-2">
                    {auditResult.leadReadyAuditReport.nextSteps.map((step) => (
                      <p
                        className="text-anywhere min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-3 text-sm leading-6 text-titan-ivory/68"
                        key={step}
                      >
                        {step}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold uppercase text-titan-bright">
                  Report findings
                </p>
                <div className="mt-3 grid gap-2">
                  {auditResult.leadReadyAuditReport.findings.map((finding) => (
                    <p
                    className="text-anywhere min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-3 text-sm leading-6 text-titan-ivory/68"
                      key={finding}
                    >
                      {finding}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </article>
        )}
      </div>
    </section>
  );
}
