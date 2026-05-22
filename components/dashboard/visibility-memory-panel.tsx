"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AiAuditResult,
  BusinessAuditFormData,
  ProfileData
} from "@/lib/audit-ai";
import {
  createVisibilityMemoryReport,
  normalizeAccountKey,
  readVisibilityMemoryEntriesWithDebug,
  visibilityMemoryStorageKey,
  type VisibilityMemoryDebugState,
  type VisibilityMemoryEntry
} from "@/lib/visibility-memory";

type VisibilityMemoryPanelProps = {
  auditResult: AiAuditResult;
  context: { formData?: BusinessAuditFormData; profileData?: ProfileData | null };
  isUsingFallback: boolean;
  memoryDebug: VisibilityMemoryDebugState;
  memoryEntriesSnapshot: VisibilityMemoryEntry[];
  memoryAccountKey: string;
  memoryRevision: number;
  profileUrl: string;
};

export function VisibilityMemoryPanel({
  auditResult,
  context,
  isUsingFallback,
  memoryDebug,
  memoryEntriesSnapshot,
  memoryAccountKey,
  memoryRevision,
  profileUrl
}: VisibilityMemoryPanelProps) {
  const [entries, setEntries] = useState<VisibilityMemoryEntry[]>([]);
  const [readDebug, setReadDebug] = useState<VisibilityMemoryDebugState | null>(null);
  const accountKey =
    memoryAccountKey ||
    normalizeAccountKey(
      profileUrl || context.formData?.profileUrl || context.profileData?.profileUrl || "",
      auditResult.businessName
    );

  useEffect(() => {
    const memoryReadResult = readVisibilityMemoryEntriesWithDebug();
    setEntries(
      memoryEntriesSnapshot.length > 0
        ? memoryEntriesSnapshot
        : memoryReadResult.entries
    );
    setReadDebug(memoryReadResult.debug);
  }, [memoryEntriesSnapshot, memoryRevision]);

  const memoryReport = useMemo(
    () => createVisibilityMemoryReport(entries, accountKey),
    [accountKey, entries]
  );

  return (
    <section className="px-5 pb-16 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <article className="premium-surface min-w-0 rounded-lg p-6 shadow-gold sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase text-titan-muted">
                Titan Visibility Memory Engine
              </p>
              <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory sm:text-5xl">
                Pattern recognition over time.
              </h2>
              <p className="text-anywhere mt-4 max-w-3xl text-sm leading-6 text-titan-ivory/60">
                Titan now remembers recurring hooks, CTA habits, pacing behavior,
                visual fingerprints, audience language, and emotional patterns for
                each audited account on this device.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-titan-gold/10 px-4 py-2 text-xs font-black uppercase text-titan-bright">
                {memoryReport.auditCount} audit{memoryReport.auditCount === 1 ? "" : "s"} remembered
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase text-titan-ivory/68">
                Local memory
              </span>
            </div>
          </div>

          <details className="mt-6 rounded-lg border border-titan-gold/15 bg-black/24 p-4">
            <summary className="cursor-pointer text-sm font-black uppercase text-titan-bright">
              Memory Debug Panel
            </summary>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <DebugItem label="Normalized account key" value={accountKey || "Not set"} />
              <DebugItem
                label="Saved account key"
                value={memoryDebug.normalizedAccountKey || "No save attempted"}
              />
              <DebugItem
                label="localStorage write key"
                value={memoryDebug.storageWriteKey || visibilityMemoryStorageKey}
              />
              <DebugItem
                label="localStorage read key"
                value={readDebug?.storageReadKey || memoryDebug.storageReadKey || visibilityMemoryStorageKey}
              />
              <DebugItem label="Stored audits found" value={String(entries.length)} />
              <DebugItem
                label="Matching audits for account"
                value={String(memoryReport.auditCount)}
              />
              <DebugItem
                label="Audit count before save"
                value={String(memoryDebug.auditCountBeforeSave)}
              />
              <DebugItem
                label="Audit count after save"
                value={String(memoryDebug.auditCountAfterSave)}
              />
              <DebugItem
                label="Serialized JSON length"
                value={String(memoryDebug.serializedJsonLength)}
              />
              <DebugItem
                label="Last attempted save"
                value={memoryDebug.lastAttemptedSaveAt || "No save attempted"}
              />
              <DebugItem
                label="saveMemoryAudit() called"
                value={memoryDebug.saveMemoryAuditCalled ? "Yes" : "No"}
              />
              <DebugItem
                label="Audit passed validation"
                value={memoryDebug.auditObjectPassedValidation ? "Yes" : "No"}
              />
              <DebugItem
                label="Window/localStorage available"
                value={memoryDebug.windowAvailable || readDebug?.windowAvailable ? "Yes" : "No"}
              />
              <DebugItem
                label="Save error"
                value={memoryDebug.saveError || "None"}
              />
              <DebugItem
                label="Read error"
                value={readDebug?.readError || memoryDebug.readError || "None"}
              />
            </div>
            <div className="mt-4 grid gap-3">
              <DebugPre
                label="Full memory object before write"
                value={memoryDebug.memoryObjectBeforeWrite || "No write payload captured"}
              />
              <DebugPre
                label="Raw localStorage value immediately after setItem()"
                value={
                  memoryDebug.rawLocalStorageValueAfterSet ||
                  "No raw localStorage value captured"
                }
              />
            </div>
          </details>

          {isUsingFallback ? (
            <div className="mt-7 rounded-lg border border-titan-gold/10 bg-black/24 p-5">
              <p className="text-anywhere text-sm leading-6 text-titan-ivory/68">
                Run a live Visibility Audit to start building account memory.
                Snapshot analysis becomes stronger once Titan can compare behavior
                across multiple audits.
              </p>
            </div>
          ) : (
            <div className="mt-7 grid min-w-0 gap-5 xl:grid-cols-2">
              <MemoryCard
                eyebrow="Compared to last audit"
                items={memoryReport.comparedToLastAudit}
                title="Movement"
              />
              <MemoryCard
                eyebrow="Persistent weaknesses"
                items={memoryReport.persistentWeaknesses}
                title="Patterns that keep returning"
              />
              <MemoryCard
                eyebrow="Evolving strengths"
                items={memoryReport.evolvingStrengths}
                title="What is getting more reliable"
              />
              <MemoryCard
                eyebrow="Repeated mistakes"
                items={memoryReport.repeatedMistakes}
                title="Habits to break"
              />
              <MemoryCard
                eyebrow="Repeated wins"
                items={memoryReport.repeatedWins}
                title="What keeps working"
              />
              <MemoryCard
                eyebrow="Emotional patterns"
                items={memoryReport.emotionalPatterns}
                title="Tone and triggers"
              />
              <MemoryCard
                eyebrow="Creative identity"
                items={memoryReport.identityAnalysis}
                title="Brand fingerprints"
              />
              <MemoryCard
                eyebrow="Pacing and CTA habits"
                items={memoryReport.pacingHabits}
                title="Behavioral rhythm"
              />
              <MemoryCard
                eyebrow="Creator presence"
                items={memoryReport.creatorPresenceTrends}
                title="How the account feels"
              />
              <MemoryCard
                eyebrow="Predictive strategy"
                items={memoryReport.predictiveSignals}
                title="Likely next winners"
              />
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

function DebugPre({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] font-black uppercase text-titan-muted">{label}</p>
      <pre className="text-anywhere mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-black/30 p-3 text-[11px] leading-5 text-titan-ivory/70">
        {value}
      </pre>
    </div>
  );
}

function DebugItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] font-black uppercase text-titan-muted">{label}</p>
      <p className="text-anywhere mt-2 text-xs leading-5 text-titan-ivory/70">
        {value}
      </p>
    </div>
  );
}

function MemoryCard({
  eyebrow,
  items,
  title
}: {
  eyebrow: string;
  items: string[];
  title: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-5">
      <p className="text-xs font-bold uppercase text-titan-muted">{eyebrow}</p>
      <h3 className="text-anywhere mt-2 text-xl font-black text-titan-ivory">
        {title}
      </h3>
      <div className="mt-4 grid gap-3">
        {items.slice(0, 4).map((item) => (
          <p
            className="text-anywhere rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-titan-ivory/68"
            key={item}
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
