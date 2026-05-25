import { randomUUID } from "crypto";
import type {
  VideoAnalysisJobRecord,
  VideoAnalysisJobStatus,
  VideoUrlType
} from "@/lib/video-intelligence";

type CreateVideoAnalysisJobInput = {
  inputUrl: string;
  platform: VideoUrlType;
  userId?: string;
  workspaceId?: string;
};

const videoAnalysisJobs = new Map<string, VideoAnalysisJobRecord>();

type SupabaseVideoAnalysisJobRow = {
  created_at: string;
  error_message?: string | null;
  final_audit_result?: unknown;
  frame_analysis_result?: unknown;
  id: string;
  input_url: string;
  metadata_result?: unknown;
  platform: VideoUrlType;
  progress_message: string;
  status: VideoAnalysisJobStatus;
  transcript_result?: unknown;
  updated_at: string;
  user_id?: string | null;
  workspace_id?: string | null;
};

function getSupabaseJobStoreConfig() {
  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
    "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  return {
    isConfigured: Boolean(supabaseUrl && serviceRoleKey),
    serviceRoleKey,
    supabaseUrl: supabaseUrl.replace(/\/$/, "")
  };
}

export function isSupabaseVideoJobStoreConfigured() {
  return getSupabaseJobStoreConfig().isConfigured;
}

function supabaseHeaders(serviceRoleKey: string, prefer?: string) {
  return {
    ...(prefer ? { Prefer: prefer } : {}),
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json"
  };
}

function jobToRow(job: VideoAnalysisJobRecord): SupabaseVideoAnalysisJobRow {
  return {
    created_at: job.createdAt,
    error_message: job.errorMessage ?? null,
    final_audit_result: job.finalAuditResult ?? null,
    frame_analysis_result: job.frameAnalysisResult ?? null,
    id: job.id,
    input_url: job.inputUrl,
    metadata_result: job.metadataResult ?? null,
    platform: job.platform,
    progress_message: job.progressMessage,
    status: job.status,
    transcript_result: job.transcriptResult ?? null,
    updated_at: job.updatedAt,
    user_id: job.userId ?? null,
    workspace_id: job.workspaceId ?? null
  };
}

function rowToJob(row: SupabaseVideoAnalysisJobRow): VideoAnalysisJobRecord {
  return {
    createdAt: row.created_at,
    errorMessage: row.error_message ?? undefined,
    finalAuditResult: row.final_audit_result as VideoAnalysisJobRecord["finalAuditResult"],
    frameAnalysisResult:
      row.frame_analysis_result as VideoAnalysisJobRecord["frameAnalysisResult"],
    id: row.id,
    inputUrl: row.input_url,
    metadataResult: row.metadata_result as VideoAnalysisJobRecord["metadataResult"],
    platform: row.platform,
    progressMessage: row.progress_message,
    status: row.status,
    transcriptResult: row.transcript_result as VideoAnalysisJobRecord["transcriptResult"],
    updatedAt: row.updated_at,
    userId: row.user_id ?? undefined,
    workspaceId: row.workspace_id ?? undefined
  };
}

async function readSupabaseJson<T>(response: Response, label: string): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `${label} failed with status ${response.status}.${
        errorText ? ` ${errorText.slice(0, 240)}` : ""
      }`
    );
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `${label} returned non-JSON response.${errorText ? ` ${errorText.slice(0, 240)}` : ""}`
    );
  }

  return (await response.json()) as T;
}

async function createSupabaseVideoAnalysisJob(job: VideoAnalysisJobRecord) {
  const config = getSupabaseJobStoreConfig();

  if (!config.isConfigured) {
    return null;
  }

  const response = await fetch(`${config.supabaseUrl}/rest/v1/video_analysis_jobs`, {
    body: JSON.stringify(jobToRow(job)),
    headers: supabaseHeaders(config.serviceRoleKey, "return=representation"),
    method: "POST"
  });
  const rows = await readSupabaseJson<SupabaseVideoAnalysisJobRow[]>(
    response,
    "Create video analysis job"
  );

  return rows[0] ? rowToJob(rows[0]) : job;
}

async function getSupabaseVideoAnalysisJob(jobId: string) {
  const config = getSupabaseJobStoreConfig();

  if (!config.isConfigured) {
    return null;
  }

  const response = await fetch(
    `${config.supabaseUrl}/rest/v1/video_analysis_jobs?id=eq.${encodeURIComponent(jobId)}&select=*`,
    {
      headers: supabaseHeaders(config.serviceRoleKey),
      method: "GET"
    }
  );
  const rows = await readSupabaseJson<SupabaseVideoAnalysisJobRow[]>(
    response,
    "Read video analysis job"
  );

  return rows[0] ? rowToJob(rows[0]) : null;
}

function createLocalVideoAnalysisJob(job: VideoAnalysisJobRecord) {
  videoAnalysisJobs.set(job.id, job);
  return job;
}

export async function createVideoAnalysisJob(input: CreateVideoAnalysisJobInput) {
  const now = new Date().toISOString();
  const job: VideoAnalysisJobRecord = {
    createdAt: now,
    id: `video-job-${randomUUID()}`,
    inputUrl: input.inputUrl,
    platform: input.platform,
    progressMessage: "Queued",
    status: "queued",
    updatedAt: now,
    userId: input.userId,
    workspaceId: input.workspaceId
  };

  return (await createSupabaseVideoAnalysisJob(job)) ?? createLocalVideoAnalysisJob(job);
}

export async function getVideoAnalysisJob(jobId: string) {
  const supabaseJob = await getSupabaseVideoAnalysisJob(jobId);

  if (supabaseJob) {
    return supabaseJob;
  }

  return videoAnalysisJobs.get(jobId) ?? null;
}

export function updateVideoAnalysisJob(
  jobId: string,
  patch: Partial<Omit<VideoAnalysisJobRecord, "createdAt" | "id">> & {
    status?: VideoAnalysisJobStatus;
  }
) {
  const currentJob = videoAnalysisJobs.get(jobId);

  if (!currentJob) {
    return null;
  }

  const nextJob: VideoAnalysisJobRecord = {
    ...currentJob,
    ...patch,
    updatedAt: new Date().toISOString()
  };

  videoAnalysisJobs.set(jobId, nextJob);
  return nextJob;
}
