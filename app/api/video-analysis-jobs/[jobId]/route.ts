import { NextResponse } from "next/server";
import { getVideoAnalysisJob } from "@/lib/video-analysis-jobs";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params;
  const job = getVideoAnalysisJob(jobId);

  if (!job) {
    return NextResponse.json(
      {
        error: "Video analysis job not found.",
        message:
          "Titan could not find this job. It may have expired from the temporary local job store."
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ job });
}

