import "server-only";
import { query } from "./db";

// ---------------------------------------------------------------------------
// Everything that touches the `users` table lives here. Keeping the SQL in one
// module means the rest of the app never writes raw queries and can't
// accidentally leak the password hash.
// ---------------------------------------------------------------------------

/** The full row as it exists in the database, including the secret hash. */
export type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
};

/**
 * The "safe" shape we're allowed to send to the browser / put in a JWT.
 * Note there is no password_hash here. This is the DTO pattern: decide once,
 * centrally, what a user is allowed to see about a user.
 */
export type PublicUser = {
  id: string;
  email: string;
  name: string;
};

export function toPublicUser(row: UserRow): PublicUser {
  return { id: row.id, email: row.email, name: row.name };
}

/** Look up a user by email. Returns null if there's no such account. */
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    "SELECT * FROM users WHERE email = $1",
    [email],
  );
  return rows[0] ?? null;
}

/** Look up a user by id. Used to re-load the user from the token's `sub`. */
export async function findUserById(id: string): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    "SELECT * FROM users WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

/**
 * Insert a new user and return the created row.
 *
 * `passwordHash` must already be hashed (see lib/auth.ts) — this function never
 * sees the plaintext password. `RETURNING *` hands us back the row Postgres
 * just created, including the generated id and created_at.
 */
export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<UserRow> {
  const rows = await query<UserRow>(
    `INSERT INTO users (email, name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.email, input.name, input.passwordHash],
  );
  return rows[0];
}
