import { NextResponse } from "next/server";
import { createUser, findUserByEmail, toPublicUser } from "@/lib/users";
import { createSession, hashPassword } from "@/lib/auth";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation";

// POST /api/auth/register
// Body: { name, email, password }  (JSON)
// On success: creates the user, logs them in (sets the cookie), returns the user.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, email, password } = (body ?? {}) as Record<string, unknown>;

  // 1. Validate inputs.
  const nameResult = validateName(name);
  if (!nameResult.ok) return NextResponse.json({ error: nameResult.error }, { status: 400 });

  const emailResult = validateEmail(email);
  if (!emailResult.ok) return NextResponse.json({ error: emailResult.error }, { status: 400 });

  const passwordResult = validatePassword(password);
  if (!passwordResult.ok) return NextResponse.json({ error: passwordResult.error }, { status: 400 });

  // 2. Reject duplicate emails up front for a friendly message.
  const existing = await findUserByEmail(emailResult.value);
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  // 3. Hash the password, then store the user. The plaintext password never
  //    leaves this function and is never written to the database.
  const passwordHash = await hashPassword(passwordResult.value);

  let user;
  try {
    user = await createUser({
      email: emailResult.value,
      name: nameResult.value,
      passwordHash,
    });
  } catch (err) {
    // Safety net: if two requests race past the check above, the UNIQUE
    // constraint on `email` (Postgres error 23505) still protects us.
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }
    console.error("register failed:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }

  // 4. Log them in immediately by setting the session cookie.
  await createSession(user);

  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && err.code === "23505";
}
