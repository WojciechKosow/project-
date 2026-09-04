// ---------------------------------------------------------------------------
// Tiny input validation. Kept deliberately dependency-free and readable.
// For a larger app you'd likely reach for a schema library like Zod, but the
// rules here are simple enough to spell out by hand.
//
// Every function returns either { ok: true, value } with a cleaned-up value,
// or { ok: false, error } with a human-readable message.
// ---------------------------------------------------------------------------

export type Validated<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

// Good-enough email check. Real deliverability is only ever proven by actually
// emailing the address, which this app intentionally doesn't do.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(input: unknown): Validated<string> {
  if (typeof input !== "string") return { ok: false, error: "Email is required." };
  const email = input.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email." };
  return { ok: true, value: email };
}

export function validateName(input: unknown): Validated<string> {
  if (typeof input !== "string") return { ok: false, error: "Name is required." };
  const name = input.trim();
  if (name.length < 2) return { ok: false, error: "Name must be at least 2 characters." };
  if (name.length > 100) return { ok: false, error: "Name is too long." };
  return { ok: true, value: name };
}

export function validatePassword(input: unknown): Validated<string> {
  if (typeof input !== "string") return { ok: false, error: "Password is required." };
  // Don't trim passwords — leading/trailing spaces are legitimate characters.
  if (input.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (input.length > 200) return { ok: false, error: "Password is too long." };
  return { ok: true, value: input };
}
