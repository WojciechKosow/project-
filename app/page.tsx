import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

// The landing page is a Server Component, so it can read the session directly
// with getCurrentUser() and show the right buttons — no client-side flicker.
export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-lg font-semibold tracking-tight">Acme</span>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-foreground px-4 py-2 font-medium text-background transition-opacity hover:opacity-90"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 font-medium hover:opacity-70">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-foreground px-4 py-2 font-medium text-background transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-6">
          <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-zinc-500 dark:border-white/15 dark:text-zinc-400">
            JWT auth starter
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            The SaaS starter with auth already wired up.
          </h1>
          <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
            Register, log in, and a protected dashboard — backed by Postgres,
            bcrypt-hashed passwords, and JWT sessions in httpOnly cookies.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
              >
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-full bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
                >
                  Create an account
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-black/10 px-6 py-3 font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Built with Next.js, Postgres &amp; JWT.
      </footer>
    </div>
  );
}
