import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

// This is the AUTHORITATIVE auth check. The proxy already does a fast,
// optimistic redirect, but we re-verify here against the database. Because this
// is a Server Component, the check runs on the server before any HTML is sent —
// the protected data never reaches an unauthenticated browser.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    // Belt-and-suspenders: if the token is missing/invalid or the user was
    // deleted, bounce to login even though the proxy normally catches this.
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10">
        <span className="text-lg font-semibold tracking-tight">Dashboard</span>
        <LogoutButton />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {user.name} 👋
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          You&apos;re logged in. This page is protected — only authenticated
          users can see it.
        </p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card label="Name" value={user.name} />
          <Card label="Email" value={user.email} />
          <Card label="User ID" value={user.id} mono />
        </dl>

        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          This is where your real SaaS app would go. The <code>user</code>{" "}
          object here comes straight from <code>getCurrentUser()</code>, so any
          server-side data you fetch can be safely scoped to{" "}
          <code>user.id</code>.
        </p>
      </main>
    </div>
  );
}

function Card({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className={`mt-1 text-sm ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
