"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Logging out is a mutation (it clears the cookie), so it goes through a POST
// to /api/auth/logout. Then we refresh so Server Components re-read the now-
// empty session, and send the user home.
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/[.06]"
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
