import type {
  AiAuditResult,
  AuditPlatform,
  BusinessAuditFormData,
  LiveScanResult,
  ProfileData
} from "@/lib/audit-ai";
import type { VisibilityContentPlan } from "@/lib/content-plan";

export const titanWorkspaceStorageKey = "titan-visibility-workspace-v1";
export const titanStudioPlanStorageKey = "titan-visibility-studio-plan-v1";
export const titanCompetitorStorageKey = "titan-visibility-competitor-v1";
export const titanWorkspaceFoundationStorageKey =
  "titan-workspace-foundation-v1";

export type TitanWorkspaceRecord = {
  id: string;
  ownerUserId: string;
  ownerEmail?: string;
  ownerName?: string;
  businessName?: string;
  phone?: string;
  viewMode: "client" | "strategist";
  whiteLabel?: {
    brandName?: string;
    logoUrl?: string;
    accentColor?: string;
  };
  name: string;
  mode: "local" | "supabase";
  currentStrategicMission: string;
  pinnedPriorities: string[];
  savedAccountIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type TitanAuditedAccountRecord = {
  id: string;
  workspaceId: string;
  ownerEmail?: string;
  profileUrl: string;
  platform: AuditPlatform;
  displayName: string;
  lastAuditScore?: number;
  lastAuditAt?: string;
};

export type TitanStrategicTimelineRecord = {
  id: string;
  workspaceId: string;
  accountId?: string;
  title: string;
  summary: string;
  createdAt: string;
  source:
    | "audit"
    | "memory"
    | "evolution"
    | "experiment"
    | "studio"
    | "competitor"
    | "note";
};

export type TitanWorkspacePersistenceEnvelope = {
  activeWorkspaceId: string;
  auditedAccounts: TitanAuditedAccountRecord[];
  strategicTimeline: TitanStrategicTimelineRecord[];
  workspaces: TitanWorkspaceRecord[];
};

export type PersistedAuditWorkspace = {
  savedAt: string;
  ownerEmail?: string;
  ownerUserId?: string;
  auditResult: AiAuditResult;
  platform: AuditPlatform;
  profileUrl: string;
  liveScan: LiveScanResult;
  planContext: {
    formData?: BusinessAuditFormData;
    profileData?: ProfileData | null;
  };
};

export type PersistedTitanStudioPlan = {
  savedAt: string;
  auditKey: string;
  plan: VisibilityContentPlan;
};

export function makeWorkspaceScopedStorageKey(baseKey: string, workspaceId: string) {
  const safeWorkspaceId = workspaceId.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `${baseKey}:${safeWorkspaceId || "default"}`;
}

export function createDefaultTitanWorkspace(
  userId: string,
  userEmail: string,
  mode: "local" | "supabase"
): TitanWorkspacePersistenceEnvelope {
  const now = new Date().toISOString();
  const workspaceId = `workspace-${userId}`;

  return {
    activeWorkspaceId: workspaceId,
    auditedAccounts: [],
    strategicTimeline: [
      {
        createdAt: now,
        id: `timeline-${Date.now()}`,
        source: "note",
        summary:
          "Workspace created. Titan can now preserve audits, experiments, notes, plans, and strategic movement under one account.",
        title: "Titan workspace initialized",
        workspaceId
      }
    ],
    workspaces: [
      {
        createdAt: now,
        currentStrategicMission:
          "Build a durable visibility system and track movement over time.",
        id: workspaceId,
        mode,
        name: `${userEmail.split("@")[0] || "Titan"} Workspace`,
        ownerEmail: userEmail,
        ownerUserId: userId,
        pinnedPriorities: [
          "Run first audit",
          "Identify primary blocker",
          "Start first strategic experiment"
        ],
        viewMode: "strategist",
        whiteLabel: {
          brandName: "Titan Media Group"
        },
        savedAccountIds: [],
        updatedAt: now
      }
    ]
  };
}

export function makeAuditWorkspaceKey(auditResult: AiAuditResult, profileUrl: string) {
  return `${auditResult.businessName}-${profileUrl}-${Math.round(auditResult.overallScore)}`;
}

export function readJsonStorage<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : null;
  } catch (error) {
    console.error(`Titan workspace storage read failed for ${key}`, error);
    return null;
  }
}

export function writeJsonStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Titan workspace storage write failed for ${key}`, error);
  }
}

export function clearJsonStorage(...keys: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  keys.forEach((key) => window.localStorage.removeItem(key));
}
