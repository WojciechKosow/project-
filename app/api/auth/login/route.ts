import { NextResponse } from "next/server";
import { findUserByEmail, toPublicUser } from "@/lib/users";
import { createSession, verifyPassword } from "@/lib/auth";
import { validateEmail, validatePassword } from "@/lib/validation";

// POST /api/auth/login
// Body: { email, password }  (JSON)
// On success: logs the user in (sets the cookie) and returns the user.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;

  const emailResult = validateEmail(email);
  const passwordResult = validatePassword(password);

  // On login we don't reveal WHICH field was wrong or whether the email even
  // exists — that would let an attacker enumerate valid accounts. Any bad
  // input gets the same generic "invalid credentials" answer.
  if (!emailResult.ok || !passwordResult.ok) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const user = await findUserByEmail(emailResult.value);

  // Note: even when the user doesn't exist we still run a bcrypt compare
  // against a dummy hash below so both paths take roughly the same time. This
  // avoids a timing side-channel that could reveal which emails are registered.
  const hash = user?.password_hash ?? DUMMY_HASH;
  const passwordMatches = await verifyPassword(passwordResult.value, hash);

  if (!user || !passwordMatches) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession(user);

  return NextResponse.json({ user: toPublicUser(user) }, { status: 200 });
}

// A valid bcrypt hash of a random string. Used only to keep the timing of the
// "no such user" path similar to the real-compare path (see above).
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO3f8b9Vj7Wq3Yy1yQxq0mYyqk3sT4mZa";
