"use client";

import Image from "next/image";
import { useState } from "react";
import type { AiAuditResult, AuditPlatform, LiveScanResult } from "@/lib/audit-ai";

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
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 48;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      function addWhiteBackground() {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
      }

      function ensureSpace(height: number) {
        if (y + height <= pageHeight - margin) return;
        doc.addPage();
        addWhiteBackground();
        y = margin;
      }

      function textBlock(
        text: string,
        options: { size?: number; color?: [number, number, number]; bold?: boolean; gap?: number } = {}
      ) {
        const size = options.size ?? 10;
        const lineHeight = size + 5;
        doc.setFont("helvetica", options.bold ? "bold" : "normal");
        doc.setFontSize(size);
        doc.setTextColor(...(options.color ?? [20, 20, 20]));
        const lines = doc.splitTextToSize(text || "Not available", contentWidth);

        lines.forEach((line: string) => {
          ensureSpace(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        });
        y += options.gap ?? 8;
      }

      function section(title: string) {
        ensureSpace(42);
        doc.setFillColor(190, 143, 45);
        doc.rect(margin, y, 28, 3, "F");
        y += 18;
        textBlock(title.toUpperCase(), {
          size: 12,
          bold: true,
          color: [18, 18, 18],
          gap: 10
        });
      }

      function bullet(text: string) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(25, 25, 25);
        const lines = doc.splitTextToSize(text, contentWidth - 16);

        lines.forEach((line: string, index: number) => {
          ensureSpace(16);
          if (index === 0) {
            doc.setFillColor(190, 143, 45);
            doc.circle(margin + 3, y - 3, 2.5, "F");
          }
          doc.text(line, margin + 16, y);
          y += 15;
        });
        y += 4;
      }

      async function loadLogo() {
        try {
          const response = await fetch("/titan-logo.png");
          const blob = await response.blob();

          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("PDF logo loading failed", error);
          return null;
        }
      }

      addWhiteBackground();
      const logo = await loadLogo();

      if (logo) {
        try {
          doc.addImage(logo, "PNG", margin, y, 92, 62);
        } catch (error) {
          console.error("PDF logo rendering failed", error);
        }
      }

      doc.setFillColor(190, 143, 45);
      doc.rect(0, 0, pageWidth, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(18, 18, 18);
      doc.setFontSize(22);
      doc.text("Titan AI Visibility Audit", margin + 110, y + 22);
      doc.setFontSize(10);
      doc.setTextColor(95, 95, 95);
      doc.text("Prepared by Titan Media Group", margin + 110, y + 40);
      y += 88;

      textBlock(auditResult.businessName || "Profile Audit", {
        size: 20,
        bold: true,
        color: [18, 18, 18],
        gap: 12
      });
      textBlock(`Platform: ${platform}`, { bold: true, gap: 2 });
      textBlock(`Profile URL: ${profileUrl || "Not provided"}`, { gap: 2 });
      textBlock(`Live Scan Status: ${liveScan.message || "Not available"}`, { gap: 2 });
      textBlock(`Visibility Score: ${Math.round(auditResult.overallScore)}/100, Grade ${auditResult.grade}`, {
        bold: true,
        gap: 16
      });

      section("Diagnosis");
      textBlock(auditResult.personalizedDiagnosis, { size: 11 });

      section("Category Scores");
      auditResult.categoryScores.forEach((category) => {
        bullet(`${category.name}: ${category.score}/100 - ${category.insight}`);
      });

      section("Quick Wins");
      auditResult.topQuickWins.forEach((win) => {
        bullet(`${win.title} (${win.impact} impact, ${win.effort} effort): ${win.description}`);
      });

      section("Optimized Bio");
      textBlock(auditResult.optimizedBio, { size: 11 });

      section("Content Recommendations");
      auditResult.contentRecommendations.forEach((recommendation) => {
        bullet(recommendation);
      });

      section("Lead-Ready Audit Report");
      textBlock(auditResult.leadReadyAuditReport.summary, { size: 11 });
      auditResult.leadReadyAuditReport.findings.forEach((finding) => {
        bullet(finding);
      });

      section("Final CTA");
      textBlock("Book a Titan Visibility Strategy Call", {
        size: 16,
        bold: true,
        color: [18, 18, 18]
      });

      const pageCount = doc.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Titan Media Group | Page ${page} of ${pageCount}`, margin, pageHeight - 28);
      }

      const filename = `${auditResult.businessName || "titan-audit"}-report`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .concat(".pdf");
      doc.save(filename);
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
