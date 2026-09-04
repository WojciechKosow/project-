import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

// POST /api/auth/logout
// Deletes the session cookie. Because our session is a stateless JWT, "logging
// out" just means throwing the token away on the client side.
export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
