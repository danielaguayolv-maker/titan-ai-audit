"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  createLocalTitanSession,
  getSupabaseEnvDebug,
  readTitanAuthSession,
  signInWithSupabase,
  signUpWithSupabase,
  writeTitanAuthSession,
  type TitanAuthSession
} from "@/lib/titan-auth";
import {
  createDefaultTitanWorkspace,
  readJsonStorage,
  titanWorkspaceFoundationStorageKey,
  writeJsonStorage,
  type TitanWorkspacePersistenceEnvelope
} from "@/lib/workspace-persistence";

type TitanAuthWorkspaceGateProps = {
  children: (props: {
    session: TitanAuthSession;
    workspaceEnvelope: TitanWorkspacePersistenceEnvelope;
    onLogout: () => void;
    onWorkspaceEnvelopeChange: (envelope: TitanWorkspacePersistenceEnvelope) => void;
  }) => ReactNode;
};

type AuthMode = "login" | "signup";

export function TitanAuthWorkspaceGate({ children }: TitanAuthWorkspaceGateProps) {
  const [session, setSession] = useState<TitanAuthSession | null>(null);
  const [workspaceEnvelope, setWorkspaceEnvelope] =
    useState<TitanWorkspacePersistenceEnvelope | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const restoredSession = readTitanAuthSession();

    if (restoredSession) {
      setSession(restoredSession);
      setWorkspaceEnvelope(restoreWorkspaceEnvelope(restoredSession));
    }

    setHasLoaded(true);
  }, []);

  function establishSession(nextSession: TitanAuthSession) {
    writeTitanAuthSession(nextSession);
    setSession(nextSession);
    setWorkspaceEnvelope(restoreWorkspaceEnvelope(nextSession));
  }

  function updateWorkspaceEnvelope(envelope: TitanWorkspacePersistenceEnvelope) {
    setWorkspaceEnvelope(envelope);
    writeJsonStorage(titanWorkspaceFoundationStorageKey, envelope);
  }

  function logout() {
    writeTitanAuthSession(null);
    setSession(null);
    setWorkspaceEnvelope(null);
  }

  if (!hasLoaded) {
    return (
      <section className="min-h-screen px-5 py-12 sm:px-8">
        <div className="premium-surface mx-auto max-w-3xl rounded-lg p-8">
          <p className="text-sm font-black uppercase text-titan-muted">
            Titan Visibility OS
          </p>
          <h1 className="mt-3 text-4xl font-black text-titan-ivory">
            Preparing your workspace.
          </h1>
        </div>
      </section>
    );
  }

  if (!session || !workspaceEnvelope) {
    return <TitanAuthScreen onAuthenticated={establishSession} />;
  }

  return (
    <>
      {children({
        onLogout: logout,
        onWorkspaceEnvelopeChange: updateWorkspaceEnvelope,
        session,
        workspaceEnvelope
      })}
    </>
  );
}

function TitanAuthScreen({
  onAuthenticated
}: {
  onAuthenticated: (session: TitanAuthSession) => void;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabaseEnvDebug = getSupabaseEnvDebug();
  const supabaseConfigured =
    supabaseEnvDebug.hasSupabaseUrl && supabaseEnvDebug.hasSupabaseAnonKey;

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    console.info("Titan Supabase env detection", {
      hasSupabaseAnonKey: supabaseEnvDebug.hasSupabaseAnonKey,
      hasSupabaseUrl: supabaseEnvDebug.hasSupabaseUrl,
      urlHostname: supabaseEnvDebug.urlHostname
    });
  }, [
    supabaseEnvDebug.hasSupabaseAnonKey,
    supabaseEnvDebug.hasSupabaseUrl,
    supabaseEnvDebug.urlHostname
  ]);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const nextSession = supabaseConfigured
        ? mode === "login"
          ? await signInWithSupabase(email, password)
          : await signUpWithSupabase(email, password, name)
        : createLocalTitanSession(email, name);

      onAuthenticated(nextSession);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Titan authentication failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.48fr)] lg:items-center">
        <article className="premium-surface overflow-hidden rounded-lg p-6 shadow-gold sm:p-10">
          <div className="titan-pulse-line mb-8" />
          <p className="text-sm font-black uppercase tracking-[0.24em] text-titan-muted">
            Titan Visibility OS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-titan-ivory sm:text-6xl">
            Persistent strategic intelligence for real workspaces.
          </h1>
          <p className="titan-copy mt-6 text-lg text-titan-ivory/66">
            Sign in to preserve audits, account memory, strategic experiments,
            Titan Studio plans, competitor comparisons, and movement history
            across sessions and devices.
          </p>
          <div className="titan-readable-grid mt-8">
            {[
              "Saved workspaces",
              "Durable strategic history",
              "Cross-device continuity",
              "Agency/client-ready architecture"
            ].map((item) => (
              <div className="titan-signal-card rounded-lg p-4" key={item}>
                <p className="font-black text-titan-bright">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <form
          className="premium-surface rounded-lg p-6 sm:p-8"
          onSubmit={submitAuth}
        >
          <p className="text-sm font-bold uppercase text-titan-muted">
            {mode === "login" ? "Login" : "Create account"}
          </p>
          <h2 className="mt-3 text-3xl font-black text-titan-ivory">
            Enter your Titan workspace.
          </h2>
          {!supabaseConfigured ? (
            <p className="mt-4 rounded-lg border border-titan-gold/15 bg-titan-gold/10 p-4 text-sm leading-6 text-titan-ivory/66">
              Supabase environment variables are not configured yet. Titan will
              use local workspace mode for development.
            </p>
          ) : null}
          <div className="mt-4 rounded-lg border border-titan-gold/15 bg-black/25 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-titan-muted">
                Supabase env debug
              </p>
              <span className="rounded-full border border-titan-gold/20 px-3 py-1 text-[0.64rem] font-black uppercase tracking-[0.14em] text-titan-ivory/60">
                {supabaseConfigured ? "Browser auth ready" : "Local fallback"}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <SafeEnvDebugRow
                label="hasSupabaseUrl"
                value={String(supabaseEnvDebug.hasSupabaseUrl)}
              />
              <SafeEnvDebugRow
                label="hasSupabaseAnonKey"
                value={String(supabaseEnvDebug.hasSupabaseAnonKey)}
              />
              <SafeEnvDebugRow
                label="urlHostname"
                value={supabaseEnvDebug.urlHostname}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-titan-ivory/45">
              Expected client-safe names: NEXT_PUBLIC_SUPABASE_URL and
              NEXT_PUBLIC_SUPABASE_ANON_KEY. The anon key value is never shown.
            </p>
          </div>
          {mode === "signup" ? (
            <label className="mt-5 block text-sm font-bold text-titan-ivory/72">
              Name
              <input
                className="mt-2 w-full rounded-lg border border-titan-gold/15 bg-black/30 px-4 py-3 text-sm text-titan-ivory outline-none transition placeholder:text-titan-ivory/30 focus:border-titan-bright focus:ring-2 focus:ring-titan-gold/20"
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
          ) : null}
          <label className="mt-5 block text-sm font-bold text-titan-ivory/72">
            Email
            <input
              className="mt-2 w-full rounded-lg border border-titan-gold/15 bg-black/30 px-4 py-3 text-sm text-titan-ivory outline-none transition placeholder:text-titan-ivory/30 focus:border-titan-bright focus:ring-2 focus:ring-titan-gold/20"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="mt-4 block text-sm font-bold text-titan-ivory/72">
            Password
            <input
              className="mt-2 w-full rounded-lg border border-titan-gold/15 bg-black/30 px-4 py-3 text-sm text-titan-ivory outline-none transition placeholder:text-titan-ivory/30 focus:border-titan-bright focus:ring-2 focus:ring-titan-gold/20"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <button
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-titan-gold px-6 text-sm font-black uppercase text-black shadow-gold transition hover:-translate-y-0.5 hover:bg-titan-bright disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Entering Workspace..."
              : mode === "login"
                ? "Login"
                : "Create Workspace"}
          </button>
          <button
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-titan-gold/20 bg-white/[0.03] px-5 text-xs font-black uppercase text-titan-ivory/70 transition hover:border-titan-bright hover:text-titan-bright"
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "signup" : "login");
            }}
            type="button"
          >
            {mode === "login" ? "Create an account" : "Already have an account"}
          </button>
          {error ? (
            <p className="mt-4 rounded-lg border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}

function SafeEnvDebugRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-md border border-white/5 bg-white/[0.03] px-3 py-2">
      <span className="min-w-0 break-words font-bold text-titan-ivory/56">
        {label}
      </span>
      <span className="min-w-0 break-words text-right font-black text-titan-bright">
        {value}
      </span>
    </div>
  );
}

function restoreWorkspaceEnvelope(session: TitanAuthSession) {
  const savedEnvelope = readJsonStorage<TitanWorkspacePersistenceEnvelope>(
    titanWorkspaceFoundationStorageKey
  );

  if (savedEnvelope?.workspaces.some((workspace) => workspace.ownerUserId === session.user.id)) {
    return savedEnvelope;
  }

  const nextEnvelope = createDefaultTitanWorkspace(
    session.user.id,
    session.user.email,
    session.mode
  );

  writeJsonStorage(titanWorkspaceFoundationStorageKey, nextEnvelope);
  return nextEnvelope;
}
