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

export type PersistedAuditWorkspace = {
  savedAt: string;
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
