"use client";

export const titanAuthSessionStorageKey = "titan-auth-session-v1";

export type TitanAuthMode = "supabase" | "local";

export type TitanAuthUser = {
  id: string;
  email: string;
  name?: string;
};

export type TitanAuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  mode: TitanAuthMode;
  user: TitanAuthUser;
};

type SupabaseAuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id?: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
  error?: string;
  error_description?: string;
  msg?: string;
};

export type SupabaseEnvDebug = {
  hasSupabaseUrl: boolean;
  hasSupabaseAnonKey: boolean;
  urlHostname: string;
};

export function getSupabaseEnvDebug(): SupabaseEnvDebug {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  return {
    hasSupabaseAnonKey: supabaseAnonKey.length > 0,
    hasSupabaseUrl: supabaseUrl.length > 0,
    urlHostname: getSafeSupabaseHostname(supabaseUrl)
  };
}

export function isSupabaseConfigured() {
  const envDebug = getSupabaseEnvDebug();
  return envDebug.hasSupabaseUrl && envDebug.hasSupabaseAnonKey;
}

export function readTitanAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedSession = window.localStorage.getItem(titanAuthSessionStorageKey);
    return storedSession
      ? (JSON.parse(storedSession) as TitanAuthSession)
      : null;
  } catch (error) {
    console.error("Titan auth session read failed", error);
    return null;
  }
}

export function writeTitanAuthSession(session: TitanAuthSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(titanAuthSessionStorageKey);
    return;
  }

  window.localStorage.setItem(titanAuthSessionStorageKey, JSON.stringify(session));
}

export async function signInWithSupabase(email: string, password: string) {
  return requestSupabaseAuth("/token?grant_type=password", {
    email,
    password
  });
}

export async function signUpWithSupabase(
  email: string,
  password: string,
  name: string
) {
  return requestSupabaseAuth("/signup", {
    email,
    password,
    data: {
      name
    }
  });
}

export function createLocalTitanSession(email: string, name?: string): TitanAuthSession {
  return {
    accessToken: `local-${Date.now()}`,
    mode: "local",
    user: {
      email,
      id: `local-${email.toLowerCase()}`,
      name
    }
  };
}

async function requestSupabaseAuth(path: string, body: unknown): Promise<TitanAuthSession> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const envDebug = getSupabaseEnvDebug();

  if (!envDebug.hasSupabaseUrl || !envDebug.hasSupabaseAnonKey) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1${path}`, {
    body: JSON.stringify(body),
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });
  const data = (await response.json()) as SupabaseAuthResponse;

  if (!response.ok || data.error) {
    throw new Error(
      data.error_description ||
        data.msg ||
        data.error ||
        "Titan authentication failed."
    );
  }

  if (!data.access_token || !data.user?.id || !data.user.email) {
    throw new Error("Titan authentication did not return a complete session.");
  }

  return {
    accessToken: data.access_token,
    expiresAt: data.expires_in
      ? Math.floor(Date.now() / 1000) + data.expires_in
      : undefined,
    mode: "supabase",
    refreshToken: data.refresh_token,
    user: {
      email: data.user.email,
      id: data.user.id,
      name: data.user.user_metadata?.name ?? data.user.user_metadata?.full_name
    }
  };
}

function getSafeSupabaseHostname(value: string) {
  if (!value) {
    return "Not detected";
  }

  try {
    return new URL(value).hostname;
  } catch {
    return "Invalid URL";
  }
}
