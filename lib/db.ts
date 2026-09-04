import "server-only";
import { Pool } from "pg";

// ---------------------------------------------------------------------------
// Postgres connection pool.
//
// A Pool keeps a set of reusable TCP connections open to Postgres so we don't
// pay the cost of opening a new connection on every query. This is the direct
// equivalent of a HikariCP DataSource in Spring Boot.
//
// The tricky part in Next.js dev mode: the server hot-reloads your code on
// every file change, which would create a brand new Pool each time and slowly
// exhaust Postgres connections. To avoid that we stash the Pool on the global
// object and reuse it across reloads. In production this branch is only hit
// once, so it's harmless there too.
// ---------------------------------------------------------------------------

const globalForDb = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForDb.pool ??
  new Pool({
    // Everything (host, port, user, password, database) comes from this one
    // env var. See .env.example / SETUP.md.
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

/**
 * Run a parameterised SQL query.
 *
 * ALWAYS pass values via the `params` array (the `$1`, `$2` placeholders),
 * never by string-concatenating them into the SQL. The driver sends the values
 * separately from the query text, which is what makes SQL injection impossible
 * here — the same reason you use `?` placeholders / prepared statements in JDBC.
 *
 * Example:
 *   const rows = await query<User>(
 *     "SELECT * FROM users WHERE email = $1",
 *     [email],
 *   );
 */
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}
