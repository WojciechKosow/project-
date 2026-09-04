import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ---------------------------------------------------------------------------
// JWT signing / verification.
//
// This file intentionally depends ONLY on `jose` (no pg, no bcrypt, no
// next/headers). That keeps it lightweight so it can also be imported from
// `proxy.ts`, which runs on every request and must stay fast.
//
// If you know JWTs from Spring Boot this is the same idea: a signed token
// carrying a few claims. We sign with HS256 using a shared secret. The token's
// signature is what makes it tamper-proof: change the payload and the
// signature no longer matches, so verification fails.
// ---------------------------------------------------------------------------

// The secret used to sign tokens. Must be set in .env.local (see SETUP.md).
// We resolve + encode it lazily inside each function so that importing this
// module never throws at build time.
function getKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Add it to .env.local (see SETUP.md).",
    );
  }
  return new TextEncoder().encode(secret);
}

// How long a token stays valid. After this the user must log in again.
// (A "real SaaS" refinement would add refresh tokens to avoid forcing a
// re-login; see the README's "Where to go next" section.)
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionClaims = {
  sub: string; // the user id — standard JWT "subject" claim
  email: string;
  name: string;
};

/** Sign a JWT for the given user. Returns the compact token string. */
export async function signToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({ email: claims.email, name: claims.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE_SECONDS}s`)
    .sign(getKey());
}

/**
 * Verify a token and return its claims, or null if it's missing, expired, or
 * has an invalid signature. Never throws — callers just check for null.
 */
export async function verifyToken(
  token: string | undefined,
): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    return claimsFrom(payload);
  } catch {
    // Expired, tampered, or otherwise invalid — treat as "not logged in".
    return null;
  }
}

function claimsFrom(payload: JWTPayload): SessionClaims | null {
  if (
    typeof payload.sub === "string" &&
    typeof payload.email === "string" &&
    typeof payload.name === "string"
  ) {
    return { sub: payload.sub, email: payload.email, name: payload.name };
  }
  return null;
}

export const TOKEN_COOKIE = "token";
export { TOKEN_MAX_AGE_SECONDS };
