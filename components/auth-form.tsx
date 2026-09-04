"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// ---------------------------------------------------------------------------
// A Client Component ("use client") because it needs browser state: form
// values, a submitting flag, error messages, and navigation after success.
//
// It POSTs to our own Route Handlers (/api/auth/...). Those set the httpOnly
// cookie in their response, so this component never touches the token itself —
// it just calls router.refresh() so Server Components re-read the new session.
// ---------------------------------------------------------------------------

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Where to go after auth: the ?next=... the proxy set, or the dashboard.
  const next = searchParams.get("next") || "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const payload = isRegister
      ? {
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }
      : { email: form.get("email"), password: form.get("password") };

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }

      // Success: the cookie is now set. Navigate and force Server Components
      // (like the dashboard and landing page) to re-read the session.
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not reach the server. Is it running?");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Acme
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {isRegister
              ? "Sign up to get started."
              : "Log in to your account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <Field
              label="Name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
            />
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder={isRegister ? "At least 8 characters" : "••••••••"}
          />

          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-foreground px-4 py-2.5 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending
              ? "Please wait…"
              : isRegister
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium underline underline-offset-4">
                Log in
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium underline underline-offset-4">
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-foreground dark:border-white/15 dark:bg-black"
      />
    </label>
  );
}
