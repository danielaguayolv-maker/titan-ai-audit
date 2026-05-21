"use client";

import { useState } from "react";
import type { AiAuditResult, AuditPlatform, LiveScanResult } from "@/lib/audit-ai";
import { downloadTitanVisibilityReport } from "@/lib/pdf-report";

type StrategyCtaProps = {
  auditResult: AiAuditResult;
  liveScan: LiveScanResult;
  platform: AuditPlatform;
  profileUrl: string;
  onGeneratePlan: () => void;
};

export function StrategyCta({
  auditResult,
  liveScan,
  onGeneratePlan,
  platform,
  profileUrl
}: StrategyCtaProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  async function downloadReport() {
    setDownloadError("");
    setIsDownloading(true);

    try {
      await downloadTitanVisibilityReport({
        auditResult,
        liveScan,
        platform,
        profileUrl
      });
    } catch (error) {
      console.error("PDF generation failed", error);
      setDownloadError("PDF export failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="px-5 pb-16 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <article className="premium-surface min-w-0 rounded-lg p-6 shadow-gold sm:p-10">
          <p className="text-sm font-bold uppercase text-titan-muted">
            Strategy handoff
          </p>
          <h2 className="text-anywhere mt-3 text-4xl font-black text-titan-ivory sm:text-5xl">
            Ready to Improve Your Visibility?
          </h2>
          <p className="text-anywhere mt-5 max-w-3xl text-lg leading-8 text-titan-ivory/68">
            Titan Visibility OS identified growth opportunities for your brand.
            Titan Media Group can help implement the strategy.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-titan-gold px-6 text-sm font-black uppercase text-black shadow-gold transition hover:-translate-y-0.5 hover:bg-titan-bright"
              href="mailto:hello@titanmediagroup.com?subject=Titan%20Visibility%20Strategy%20Call"
            >
              Book Strategy Call
            </a>
            <button
              className="luxury-border inline-flex min-h-12 items-center justify-center rounded-full bg-white/5 px-6 text-sm font-bold uppercase text-titan-ivory transition hover:border-titan-bright hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isDownloading}
              onClick={downloadReport}
              type="button"
            >
              {isDownloading ? "Building PDF..." : "Download Report"}
            </button>
            <button
              className="luxury-border inline-flex min-h-12 items-center justify-center rounded-full bg-white/5 px-6 text-sm font-bold uppercase text-titan-bright transition hover:border-titan-bright hover:bg-titan-gold hover:text-black"
              onClick={onGeneratePlan}
              type="button"
            >
              Generate 30-Day Visibility Plan
            </button>
          </div>

          {downloadError ? (
            <p className="mt-4 rounded-lg border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-100">
              {downloadError}
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}
