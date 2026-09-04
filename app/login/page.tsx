import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

// The proxy already redirects logged-in users away from here, so this page can
// stay simple. AuthForm uses useSearchParams(), which Next.js requires to sit
// inside a <Suspense> boundary.
export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
