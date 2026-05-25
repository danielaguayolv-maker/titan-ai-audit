import { NextResponse } from "next/server";
import { getVideoAnalysisJob } from "@/lib/video-analysis-jobs";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params;
  const authHeader = request.headers.get("authorization") ?? "";
  const authToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : undefined;
  const job = await getVideoAnalysisJob(jobId, authToken);

  if (!job) {
    return NextResponse.json(
      {
        error: "Video analysis job not found.",
        message: "Video job was not found in persistent storage."
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ job });
}
