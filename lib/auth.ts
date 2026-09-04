import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import {
  signToken,
  verifyToken,
  TOKEN_COOKIE,
  TOKEN_MAX_AGE_SECONDS,
  type SessionClaims,
} from "./jwt";
import {
  findUserById,
  toPublicUser,
  type PublicUser,
  type UserRow,
} from "./users";

// ---------------------------------------------------------------------------
// The server-side auth module: password hashing, and reading/writing the
// login session (a JWT stored in an httpOnly cookie).
//
// Why a cookie instead of returning the JWT to JavaScript?
//   The cookie is `httpOnly`, so client-side JS (and therefore any XSS attack)
//   can't read the token. The browser attaches it automatically on every
//   request to our own domain. This is the safer default for a browser app.
//   If you were building a mobile/native client instead, you'd send the JWT in
//   an `Authorization: Bearer` header like you do in Spring Boot — the token is
//   the same, only the transport differs.
// ---------------------------------------------------------------------------

// bcrypt "cost factor". Higher = slower to hash = harder to brute-force.
// 12 is a good modern default.
const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Log a user in: sign a JWT for them and store it in the httpOnly cookie.
 * Call this from a Route Handler after you've verified their credentials.
 */
export async function createSession(user: UserRow | PublicUser): Promise<void> {
  const claims: SessionClaims = {
    sub: user.id,
    email: user.email,
    name: user.name,
  };
  const token = await signToken(claims);
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true, // not readable by client-side JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS-only in prod
    sameSite: "lax", // sent on top-level navigations, blocks most CSRF
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS, // cookie expires with the token
  });
}

/** Log out: delete the cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

/**
 * Read the current user from the token cookie.
 *
 * Two levels of trust:
 *   1. The claims in the token are cryptographically trustworthy (signed).
 *   2. But we still re-load the user from the DB, so a deleted user (or one
 *      whose name/email changed) is always resolved against real data. This is
 *      the "secure check" — the optimistic version (proxy.ts) only checks 1.
 *
 * Returns null if there's no valid session or the user no longer exists.
 */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  const claims = await verifyToken(token);
  if (!claims) return null;

  const user = await findUserById(claims.sub);
  if (!user) return null;

  return toPublicUser(user);
}
