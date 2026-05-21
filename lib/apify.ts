import type {
  AuditPlatform,
  ProfileContentItem,
  ProfileData
} from "@/lib/audit-ai";

const APIFY_BASE_URL = "https://api.apify.com/v2/acts";
const APIFY_DATASETS_URL = "https://api.apify.com/v2/datasets";
const DEFAULT_INSTAGRAM_ACTOR_ID = "apify/instagram-profile-scraper";
const DEFAULT_TIKTOK_ACTOR_ID = "clockworks/tiktok-profile-scraper";

type ApifyRunOptions = {
  logPrefix?: string;
  profileUrl?: string;
  platform?: AuditPlatform;
  username?: string;
};

type ApifyRunResult = {
  items: unknown[];
  runStatus: string;
};

const APIFY_WAIT_SECONDS = 60;
const APIFY_TIMEOUT_MS = 65000;

function actorPath(actorId: string) {
  return actorId.replace("/", "~");
}

function getToken() {
  return process.env.APIFY_TOKEN?.trim() ?? "";
}

function safeLog(prefix: string, message: string, details?: unknown) {
  if (details === undefined) {
    console.info(`[${prefix}] ${message}`);
    return;
  }

  console.info(`[${prefix}] ${message}`, details);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isTimeoutError(error: unknown) {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return true;
  }

  if (error instanceof Error) {
    return /timeout|timed out|timing-out|aborted/i.test(error.message);
  }

  return false;
}

function getNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[,\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function firstDefined<T>(...values: Array<T | undefined>) {
  return values.find((value) => value !== undefined);
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function uniqueStrings(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function extractHashtags(text: string) {
  return [...text.matchAll(/#([\p{L}\p{N}_]+)/gu)].map((match) => match[1].toLowerCase());
}

function findNestedRecords(value: unknown, maxDepth = 5): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];

  function visit(current: unknown, depth: number) {
    if (depth > maxDepth || current === null || current === undefined) {
      return;
    }

    if (Array.isArray(current)) {
      current.slice(0, 30).forEach((item) => visit(item, depth + 1));
      return;
    }

    if (typeof current !== "object") {
      return;
    }

    const record = current as Record<string, unknown>;
    records.push(record);

    Object.values(record).forEach((child) => visit(child, depth + 1));
  }

  visit(value, 0);
  return records;
}

function findFirstString(records: Record<string, unknown>[], keys: string[]) {
  for (const record of records) {
    for (const key of keys) {
      const value = getString(record[key]);

      if (value) {
        return value;
      }
    }
  }

  return undefined;
}

function findFirstNumber(records: Record<string, unknown>[], keys: string[]) {
  for (const record of records) {
    for (const key of keys) {
      const value = getNumber(record[key]);

      if (typeof value === "number") {
        return value;
      }
    }
  }

  return undefined;
}

function findFirstBoolean(records: Record<string, unknown>[], keys: string[]) {
  for (const record of records) {
    for (const key of keys) {
      const value = getBoolean(record[key]);

      if (typeof value === "boolean") {
        return value;
      }
    }
  }

  return undefined;
}

function findFirstArray(records: Record<string, unknown>[], keys: string[]) {
  for (const record of records) {
    for (const key of keys) {
      const value = getArray(record[key]);

      if (value.length > 0) {
        return value;
      }
    }
  }

  return [];
}

function average(values: Array<number | undefined>) {
  const numbers = values.filter((value): value is number => typeof value === "number");

  if (numbers.length === 0) {
    return undefined;
  }

  return Math.round(numbers.reduce((total, value) => total + value, 0) / numbers.length);
}

function estimatePostingFrequency(contentCount: number) {
  if (contentCount >= 10) return "High recent activity";
  if (contentCount >= 4) return "Moderate recent activity";
  if (contentCount >= 1) return "Limited recent activity";
  return "Not enough public content returned";
}

function enrichProfileData(
  profileData: Omit<
    ProfileData,
    | "dataPointsFound"
    | "missingDataPoints"
    | "scanCompleteness"
    | "confidenceScore"
    | "metricsStatus"
  >
): ProfileData {
  const metricItems = profileData.recentContent.filter(
    (item) =>
      typeof item.likes === "number" ||
      typeof item.comments === "number" ||
      typeof item.views === "number"
  );
  const hashtagsUsed = uniqueStrings([
    ...profileData.hashtagsUsed,
    ...profileData.recentContent.flatMap((item) => item.hashtags ?? []),
    ...profileData.recentContent.flatMap((item) => extractHashtags(item.caption))
  ]);
  const withAverages = {
    ...profileData,
    hashtagsUsed,
    averageLikes: average(profileData.recentContent.map((item) => item.likes)),
    averageComments: average(profileData.recentContent.map((item) => item.comments)),
    averageViews: average(profileData.recentContent.map((item) => item.views)),
    postingFrequencyEstimate: estimatePostingFrequency(profileData.recentContent.length)
  };
  const checks: Array<[string, boolean]> = [
    ["username", Boolean(withAverages.username)],
    ["display name", Boolean(withAverages.displayName)],
    ["bio", Boolean(withAverages.bio)],
    ["follower count", typeof withAverages.followerCount === "number"],
    ["following count", typeof withAverages.followingCount === "number"],
    ["like count", typeof withAverages.likeCount === "number"],
    ["video/post count", typeof withAverages.contentCount === "number"],
    ["verified status", typeof withAverages.verified === "boolean"],
    ["profile picture", Boolean(withAverages.profilePictureUrl)],
    ["recent captions/descriptions", withAverages.recentContent.length > 0],
    ["hashtags used", withAverages.hashtagsUsed.length > 0],
    ["engagement metrics", metricItems.length > 0],
    ["average engagement", Boolean(withAverages.averageLikes || withAverages.averageComments || withAverages.averageViews)],
    ["posting frequency estimate", Boolean(withAverages.postingFrequencyEstimate)],
    ["pinned content", withAverages.pinnedContent.length > 0]
  ];
  const dataPointsFound = checks
    .filter(([, found]) => found)
    .map(([label]) => label);
  const missingDataPoints = checks
    .filter(([, found]) => !found)
    .map(([label]) => label);
  const scanCompleteness = Math.round((dataPointsFound.length / checks.length) * 100);
  const metricsStatus =
    metricItems.length >= 3
      ? "confirmed"
      : metricItems.length > 0 || withAverages.recentContent.length > 0
        ? "estimated"
        : "limited";

  return {
    ...withAverages,
    metricsStatus,
    dataPointsFound,
    missingDataPoints,
    scanCompleteness,
    confidenceScore: Math.max(
      20,
      Math.min(95, scanCompleteness + (metricsStatus === "confirmed" ? 8 : 0))
    )
  };
}

function profileUsernameFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname
      .split("/")
      .filter(Boolean)[0]
      ?.replace(/^@/, "");
  } catch {
    return url.split("/").filter(Boolean).at(-1)?.replace(/^@/, "");
  }
}

function normalizeTikTokProfileUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const usernameSegment = parsedUrl.pathname
      .split("/")
      .filter(Boolean)
      .find((segment) => segment.startsWith("@"));

    if (!usernameSegment) {
      return url;
    }

    return `${parsedUrl.origin}/${usernameSegment}`;
  } catch {
    const usernameSegment = url
      .split("/")
      .filter(Boolean)
      .find((segment) => segment.startsWith("@"));

    return usernameSegment ? `https://www.tiktok.com/${usernameSegment}` : url;
  }
}

async function runApifyActor(
  actorId: string,
  input: unknown,
  options: ApifyRunOptions = {}
) {
  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await runApifyActorAttempt(actorId, input, options, attempt);

      if (result.items.length > 0) {
        return result.items;
      }

      lastError = new Error("Apify dataset returned no items.");

      if (options.logPrefix) {
        safeLog(options.logPrefix, "Empty dataset received", {
          attempt,
          willRetry: attempt < maxAttempts
        });
      }

      if (attempt < maxAttempts) {
        continue;
      }
    } catch (error) {
      lastError = error;

      if (options.logPrefix) {
        safeLog(options.logPrefix, "Apify attempt failed", {
          attempt,
          willRetry: attempt < maxAttempts && isTimeoutError(error),
          error: getErrorMessage(error)
        });
      }

      if (attempt < maxAttempts && isTimeoutError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Apify live scan failed.");
}

async function runApifyActorAttempt(
  actorId: string,
  input: unknown,
  options: ApifyRunOptions = {},
  attempt: number
): Promise<ApifyRunResult> {
  const token = getToken();
  const logPrefix = options.logPrefix;

  if (!token) {
    if (logPrefix) {
      safeLog(logPrefix, "Apify token missing");
    }

    throw new Error("APIFY_TOKEN is not configured.");
  }

  if (logPrefix) {
    safeLog(logPrefix, "Live scan attempt", {
      attempt,
      platform: options.platform,
      profileUrl: options.profileUrl,
      parsedUsername: options.username,
      actorId
    });
    safeLog(logPrefix, "Actor ID", actorId);
    safeLog(logPrefix, "Input payload", input);
  }

  let runResponse: Response;

  try {
    runResponse = await fetch(
      `${APIFY_BASE_URL}/${actorPath(actorId)}/runs?token=${encodeURIComponent(token)}&waitForFinish=${APIFY_WAIT_SECONDS}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(APIFY_TIMEOUT_MS)
      }
    );
  } catch (error) {
    if (logPrefix) {
      safeLog(logPrefix, "Apify run request error", {
        attempt,
        error: getErrorMessage(error)
      });
    }

    if (isTimeoutError(error)) {
      throw new Error(`Apify run request timed out after ${Math.round(APIFY_TIMEOUT_MS / 1000)} seconds.`);
    }

    throw error;
  }

  if (logPrefix) {
    safeLog(logPrefix, "Apify run HTTP status", {
      status: runResponse.status,
      statusText: runResponse.statusText
    });
  }

  if (!runResponse.ok) {
    const errorText = await runResponse.text();

    if (logPrefix) {
      safeLog(logPrefix, "Apify error response", {
        attempt,
        body: errorText.slice(0, 1200)
      });
    }

    throw new Error(`Apify actor failed with status ${runResponse.status}: ${errorText.slice(0, 240)}`);
  }

  const runPayload = getRecord(await runResponse.json());
  const runData = getRecord(runPayload.data);
  const runStatus = getString(runData.status) ?? "UNKNOWN";
  const datasetId = getString(runData.defaultDatasetId);

  if (logPrefix) {
    safeLog(logPrefix, "Apify run status", runStatus);
  }

  if (["RUNNING", "READY", "TIMING-OUT"].includes(runStatus)) {
    throw new Error(`Apify actor timed out before finishing. Run status: ${runStatus}.`);
  }

  if (runStatus !== "SUCCEEDED") {
    const statusMessage =
      getString(runData.statusMessage) ??
      getString(runData.errorMessage) ??
      getString(runData.exitCode);

    if (logPrefix) {
      safeLog(logPrefix, "Apify non-success run body", runData);
    }

    throw new Error(
      `Apify actor did not complete successfully. Run status: ${runStatus}${statusMessage ? `, message: ${statusMessage}` : ""}.`
    );
  }

  if (!datasetId) {
    throw new Error("Apify run did not return a default dataset ID.");
  }

  let datasetResponse: Response;

  try {
    datasetResponse = await fetch(
      `${APIFY_DATASETS_URL}/${datasetId}/items?token=${encodeURIComponent(token)}&clean=true`,
      {
        signal: AbortSignal.timeout(APIFY_TIMEOUT_MS)
      }
    );
  } catch (error) {
    if (logPrefix) {
      safeLog(logPrefix, "Apify dataset request error", {
        attempt,
        error: getErrorMessage(error)
      });
    }

    if (isTimeoutError(error)) {
      throw new Error(`Apify dataset request timed out after ${Math.round(APIFY_TIMEOUT_MS / 1000)} seconds.`);
    }

    throw error;
  }

  if (!datasetResponse.ok) {
    const errorText = await datasetResponse.text();

    if (logPrefix) {
      safeLog(logPrefix, "Apify dataset error response", errorText.slice(0, 1200));
    }

    throw new Error(`Apify dataset fetch failed with status ${datasetResponse.status}.`);
  }

  const datasetPayload: unknown = await datasetResponse.json();
  const items = Array.isArray(datasetPayload) ? datasetPayload : [];

  if (logPrefix) {
    safeLog(logPrefix, "Dataset output count", items.length);
    safeLog(logPrefix, "First item keys", Object.keys(getRecord(items[0])));
    safeLog(
      logPrefix,
      "All returned dataset keys",
      uniqueStrings(items.flatMap((item) => Object.keys(getRecord(item)))).sort()
    );
    safeLog(
      logPrefix,
      "Nested keys detected",
      uniqueStrings(
        items.flatMap((item) =>
          findNestedRecords(item).flatMap((record) => Object.keys(record))
        )
      )
        .sort()
        .slice(0, 200)
    );
    safeLog(
      logPrefix,
      "Detected nested user/stat keys",
      uniqueStrings(
        items.flatMap((item) =>
          findNestedRecords(item)
            .filter((record) =>
              ["authorMeta", "author", "user", "profile", "stats", "videoMeta"].some(
                (key) => key in record
              )
            )
            .flatMap((record) => Object.keys(record))
        )
      )
        .sort()
        .slice(0, 200)
    );
  }

  return {
    items,
    runStatus
  };
}

function collectDataPoints(profileData: Omit<ProfileData, "dataPointsFound">) {
  const points: string[] = [];

  if (profileData.username) points.push("username");
  if (profileData.displayName) points.push("display name");
  if (profileData.bio) points.push("bio");
  if (typeof profileData.followerCount === "number") points.push("follower count");
  if (profileData.recentContent.length > 0) points.push("recent content");
  if (
    profileData.recentContent.some(
      (item) =>
        typeof item.likes === "number" ||
        typeof item.comments === "number" ||
        typeof item.shares === "number" ||
        typeof item.views === "number"
    )
  ) {
    points.push("engagement metrics");
  }

  return points;
}

function normalizeInstagramPost(value: unknown): ProfileContentItem | null {
  const post = getRecord(value);
  const records = findNestedRecords(post, 2);
  const caption =
    findFirstString(records, ["caption", "text", "description", "alt", "title"]);

  if (!caption) {
    return null;
  }

  return {
    caption,
    likes: findFirstNumber(records, ["likesCount", "likes", "likeCount"]),
    comments: findFirstNumber(records, ["commentsCount", "comments", "commentCount"]),
    views: findFirstNumber(records, ["videoViewCount", "views", "viewCount", "playCount"]),
    url: findFirstString(records, ["url", "shortCodeUrl", "postUrl", "displayUrl"]),
    hashtags: extractHashtags(caption),
    isPinned: findFirstBoolean(records, ["isPinned", "pinned", "is_pinned"])
  };
}

function normalizeTikTokVideo(value: unknown): ProfileContentItem | null {
  const video = getRecord(value);
  const records = findNestedRecords(video, 3);
  const caption =
    findFirstString(records, ["text", "caption", "description", "desc", "title"]);

  if (!caption) {
    return null;
  }

  return {
    caption,
    likes: findFirstNumber(records, ["diggCount", "likes", "likeCount", "heart", "heartCount"]),
    comments: findFirstNumber(records, ["commentCount", "comments"]),
    shares: findFirstNumber(records, ["shareCount", "shares"]),
    views: findFirstNumber(records, ["playCount", "views", "videoViews", "viewCount"]),
    url: findFirstString(records, ["webVideoUrl", "url", "videoUrl", "shareUrl"]),
    hashtags: extractHashtags(caption),
    isPinned: findFirstBoolean(records, ["isPinned", "pinned", "is_pinned"])
  };
}

export async function fetchInstagramProfile(url: string): Promise<ProfileData> {
  const username = profileUsernameFromUrl(url) ?? url;
  const actorId = process.env.APIFY_INSTAGRAM_ACTOR_ID ?? DEFAULT_INSTAGRAM_ACTOR_ID;
  const input = {
    usernames: [username],
    resultsLimit: 1
  };

  safeLog("Instagram Apify", "Original URL", url);
  safeLog("Instagram Apify", "Parsed username", username);

  const items = await runApifyActor(actorId, input, {
    logPrefix: "Instagram Apify",
    platform: "instagram",
    profileUrl: url,
    username
  });
  const profile = getRecord(items[0]);
  const records = findNestedRecords(profile);
  const latestPosts = [
    ...getArray(profile.latestPosts),
    ...getArray(profile.posts),
    ...getArray(profile.latestIgtvVideos),
    ...findFirstArray(records, ["latestPosts", "posts", "edges", "items"])
  ];
  const recentContent = latestPosts
    .map(normalizeInstagramPost)
    .filter((item): item is ProfileContentItem => Boolean(item))
    .slice(0, 12);
  const profileData = {
    platform: "instagram" as AuditPlatform,
    profileUrl: url,
    username: findFirstString(records, ["username", "userName", "handle"]) ?? username,
    displayName: findFirstString(records, ["fullName", "full_name", "name", "displayName"]),
    bio: findFirstString(records, ["biography", "bio", "description"]),
    followerCount: findFirstNumber(records, ["followersCount", "followers", "followerCount"]),
    followingCount: findFirstNumber(records, ["followsCount", "following", "followingCount"]),
    likeCount: findFirstNumber(records, ["likesCount", "likeCount", "likes"]),
    contentCount: findFirstNumber(records, ["postsCount", "mediaCount", "postCount", "videosCount"]),
    verified: findFirstBoolean(records, ["verified", "isVerified", "is_verified"]),
    profilePictureUrl: findFirstString(records, ["profilePicUrl", "profilePictureUrl", "profile_pic_url", "avatar"]),
    recentContent,
    hashtagsUsed: uniqueStrings(recentContent.flatMap((item) => item.hashtags ?? [])),
    pinnedContent: recentContent.filter((item) => item.isPinned)
  };

  return enrichProfileData(profileData);
}

export async function fetchTikTokProfile(url: string): Promise<ProfileData> {
  const actorId = process.env.APIFY_TIKTOK_ACTOR_ID ?? DEFAULT_TIKTOK_ACTOR_ID;
  const normalizedUrl = normalizeTikTokProfileUrl(url);
  const username = profileUsernameFromUrl(normalizedUrl) ?? normalizedUrl;
  const input = {
    profiles: [username],
    username,
    usernames: [username],
    userNames: [username],
    profileUrl: normalizedUrl,
    profileUrls: [normalizedUrl],
    startUrls: [normalizedUrl],
    profileScrapeSections: ["videos"],
    maxItems: 12,
    resultsLimit: 12,
    resultsPerPage: 12,
    shouldDownloadCovers: false,
    shouldDownloadSlideshowImages: false,
    shouldDownloadSubtitles: false,
    shouldDownloadVideos: false,
    proxyConfiguration: {}
  };

  safeLog("TikTok Apify", "Original URL", url);
  safeLog("TikTok Apify", "Normalized profile URL", normalizedUrl);
  safeLog("TikTok Apify", "Parsed username", username);

  const items = await runApifyActor(actorId, input, {
    logPrefix: "TikTok Apify",
    platform: "tiktok",
    profileUrl: normalizedUrl,
    username
  });
  const records = items.map(getRecord);
  const allNestedRecords = items.flatMap((item) => findNestedRecords(item));
  const profileRecord =
    records.find(
      (record) =>
        record.profile ||
        record.userInfo ||
        record.user ||
        record.authorMeta ||
        record.author ||
        record.stats
    ) ??
    records[0] ??
    {};
  const profile = getRecord(
    profileRecord.profile ?? profileRecord.userInfo ?? profileRecord.user
  );
  const authorMeta = getRecord(
    profileRecord.authorMeta ??
      profileRecord.author ??
      profileRecord.user ??
      profile.user ??
      profile.author
  );
  const stats = getRecord(
    profileRecord.stats ??
      profileRecord.statistics ??
      profile.stats ??
      profile.statistics ??
      authorMeta.stats ??
      authorMeta.statistics
  );
  const nestedVideos = [
    ...getArray(profileRecord.videos),
    ...getArray(profileRecord.posts),
    ...getArray(profileRecord.items),
    ...getArray(profile.videos),
    ...getArray(profile.posts),
    ...getArray(profile.items)
  ];
  const videoItems = nestedVideos.length > 0 ? nestedVideos : records;
  const videoRecords = videoItems.flatMap((item) => findNestedRecords(item, 2));
  const recentContent = videoItems
    .map(normalizeTikTokVideo)
    .filter((item): item is ProfileContentItem => Boolean(item))
    .slice(0, 12);
  const profileCandidates = [
    ...findNestedRecords(profileRecord),
    ...findNestedRecords(profile),
    ...findNestedRecords(authorMeta),
    ...findNestedRecords(stats),
    ...allNestedRecords
  ];
  const profileData = {
    platform: "tiktok" as AuditPlatform,
    profileUrl: normalizedUrl,
    username:
      findFirstString(profileCandidates, ["uniqueId", "username", "name", "secUid"]) ??
      profileUsernameFromUrl(normalizedUrl),
    displayName:
      findFirstString(profileCandidates, ["nickName", "nickname", "displayName", "authorNickName", "title"]),
    bio:
      findFirstString(profileCandidates, ["signature", "bio", "Bio", "description"]),
    followerCount: findFirstNumber(profileCandidates, ["fans", "followerCount", "followers", "authorFollowerCount"]),
    followingCount: findFirstNumber(profileCandidates, ["following", "followingCount", "authorFollowingCount"]),
    likeCount: findFirstNumber(profileCandidates, ["heart", "heartCount", "likes", "likeCount", "authorHeartCount", "authorTotalLikes"]),
    contentCount: findFirstNumber(profileCandidates, ["video", "videoCount", "videos", "postCount", "authorVideoCount"]),
    verified: findFirstBoolean(profileCandidates, ["verified", "isVerified"]),
    profilePictureUrl: findFirstString(profileCandidates, ["avatar", "avatarThumb", "avatarLarger", "avatarMedium", "profilePictureUrl", "profile_img"]),
    recentContent,
    hashtagsUsed: uniqueStrings([
      ...recentContent.flatMap((item) => item.hashtags ?? []),
      ...videoRecords.flatMap((record) =>
        getArray(record.hashtags)
          .map((hashtag) => getString(getRecord(hashtag).name) ?? getString(hashtag))
          .filter((hashtag): hashtag is string => Boolean(hashtag))
      )
    ]),
    pinnedContent: recentContent.filter((item) => item.isPinned)
  };

  return enrichProfileData(profileData);
}
