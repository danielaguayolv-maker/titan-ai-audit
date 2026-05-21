"use client";

import Image from "next/image";
import { useState } from "react";
import type { AiAuditResult, AuditPlatform, LiveScanResult } from "@/lib/audit-ai";
import { downloadTitanVisibilityReport } from "@/lib/pdf-report";

type AuditAssetsProps = {
  auditResult: AiAuditResult;
  liveScan: LiveScanResult;
  platform: AuditPlatform;
  profileUrl: string;
};

export function AuditAssets({
  auditResult,
  liveScan,
  platform,
  profileUrl
}: AuditAssetsProps) {
  const [downloadError, setDownloadError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  async function downloadPdfReport() {
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
    <section id="report" className="px-5 pb-16 sm:px-8 sm:pb-20">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article className="premium-surface min-w-0 max-w-full rounded-lg p-6 sm:p-8">
          <p className="text-sm font-bold uppercase text-titan-muted">
            Optimized bio output
          </p>
          <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory">
            Lead-facing positioning
          </h2>
          <div className="mt-6 rounded-lg border border-titan-gold/15 bg-titan-gold/10 p-5">
            <p className="text-anywhere text-lg font-bold leading-8 text-titan-ivory">
              {auditResult.optimizedBio}
            </p>
          </div>
          <p className="mt-5 text-sm leading-6 text-titan-ivory/58">
            Written to work across profile bios, landing pages, and outbound
            audit summaries without sounding like technical software copy.
          </p>
        </article>

        <article className="premium-surface min-w-0 max-w-full rounded-lg p-6 shadow-gold sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-titan-gold/10 pb-5">
            <span className="relative h-12 w-20 overflow-hidden rounded-md border border-titan-gold/20 bg-black/30">
              <Image
                alt="Titan Media Group logo"
                className="object-contain p-1"
                fill
                sizes="80px"
                src="/titan-logo.png"
              />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-titan-muted">
                Titan Media Group
              </p>
              <p className="text-sm font-black text-titan-ivory">
                Client-ready audit preview
              </p>
            </div>
          </div>
          <p className="text-sm font-bold uppercase text-titan-bright">
            Lead-ready audit report
          </p>
          <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory">
            What the prospect receives
          </h2>
          <div className="mt-7 grid gap-3">
            {auditResult.leadReadyAuditReport.findings.map((highlight) => (
              <div className="flex min-w-0 gap-3 rounded-lg border border-titan-gold/10 bg-black/25 p-4 transition hover:border-titan-bright/40" key={highlight}>
                <span className="mt-1 size-2 shrink-0 rounded-full bg-titan-gold" />
                <p className="text-anywhere min-w-0 leading-7 text-titan-ivory/72">{highlight}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-titan-gold px-6 text-sm font-bold uppercase text-black shadow-gold transition hover:bg-titan-bright"
              disabled={isDownloading}
              onClick={downloadPdfReport}
              type="button"
            >
              {isDownloading ? "Building PDF..." : "Download PDF Report"}
            </button>
            <a
              className="luxury-border inline-flex min-h-12 items-center justify-center rounded-full bg-white/5 px-6 text-sm font-bold uppercase text-titan-ivory transition hover:border-titan-bright hover:bg-white/10"
              href="#report"
            >
              Copy Summary
            </a>
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
