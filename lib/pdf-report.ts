import type { AiAuditResult, AuditPlatform, LiveScanResult } from "@/lib/audit-ai";

type PdfReportInput = {
  auditResult: AiAuditResult;
  liveScan: LiveScanResult;
  platform: AuditPlatform;
  profileUrl: string;
};

export async function downloadTitanVisibilityReport({
  auditResult,
  liveScan,
  platform,
  profileUrl
}: PdfReportInput) {
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
    options: {
      size?: number;
      color?: [number, number, number];
      bold?: boolean;
      gap?: number;
    } = {}
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
  textBlock(
    `Visibility Score: ${Math.round(auditResult.overallScore)}/100, Grade ${auditResult.grade}`,
    {
      bold: true,
      gap: 16
    }
  );

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
}
