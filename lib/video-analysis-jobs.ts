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

export function createVideoAnalysisJob(input: CreateVideoAnalysisJobInput) {
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

  videoAnalysisJobs.set(job.id, job);
  return job;
}

export function getVideoAnalysisJob(jobId: string) {
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

