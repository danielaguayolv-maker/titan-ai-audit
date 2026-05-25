# Titan Video Intelligence Worker

Railway-ready worker for heavy Video Intelligence jobs.

## What It Does

- Polls Supabase `video_analysis_jobs` where `status = queued`
- Claims one job at a time by moving it to `processing`
- Resolves TikTok media through Apify
- Supports an optional secondary Apify downloader chain
- Downloads video when a real media URL is available
- Uses `ffmpeg` / `ffprobe` to extract key frames
- Calls OpenAI vision analysis
- Saves metadata, frames, transcript status, final audit result, progress, and errors back to Supabase
- Falls back to partial cover/caption/metadata analysis when downloadable video is unavailable

## Required Supabase Table

Create this table in Supabase:

```sql
create table if not exists public.video_analysis_jobs (
  id text primary key,
  user_id text,
  workspace_id text,
  input_url text not null,
  platform text not null,
  status text not null default 'queued',
  progress_message text not null default 'Queued',
  error_message text,
  metadata_result jsonb,
  frame_analysis_result jsonb,
  transcript_result jsonb,
  final_audit_result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists video_analysis_jobs_status_created_at_idx
on public.video_analysis_jobs (status, created_at);
```

The worker uses `SUPABASE_SERVICE_ROLE_KEY`, so keep it server-side only.

## Railway Deploy

1. Create a new Railway service from this repository.
2. Set the service root directory to `worker`.
3. Configure Railway to build with the worker Dockerfile:
   - Root directory: `worker`
   - Dockerfile path: `worker/Dockerfile` if Railway asks from repo root, or `Dockerfile` if the service root is already `worker`.
4. Add variables from `.env.example`.
   - `APIFY_TIKTOK_VIDEO_ACTOR_ID` is the primary actor.
   - `APIFY_TIKTOK_DOWNLOADER_ACTOR_ID` and `APIFY_TIKTOK_SECONDARY_VIDEO_ACTOR_ID` are optional fallback actors. Add a downloader actor here if the primary scraper only returns metadata and cover images.
   - `HEARTBEAT_INTERVAL_MS` keeps active jobs fresh in Supabase while Railway is processing.
   - `JOB_STALE_MINUTES` controls how quickly the worker requeues stuck `processing` jobs.
   - `JOB_TIMEOUT_MS` caps MVP processing time before the worker fails or falls back to partial analysis.
5. Keep the start command:

```bash
npm start
```

The included Dockerfile installs Debian's `ffmpeg` package, which provides both `ffmpeg` and `ffprobe` in PATH. The worker defaults to:

```bash
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe
```

If Railway is configured without Dockerfile builds, `spawn ffprobe ENOENT` means the runtime does not include ffmpeg. Switch the worker service to the Dockerfile build or provide custom `FFMPEG_PATH` / `FFPROBE_PATH` values.

## Vercel App Behavior

The Vercel app should create jobs in Supabase and poll job status. Heavy work should happen here, not inside Vercel request handlers.

For local development without `SUPABASE_SERVICE_ROLE_KEY`, the app still keeps a temporary fallback processor so the UI remains usable.
