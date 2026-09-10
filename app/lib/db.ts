import 'server-only'
import { Pool, type QueryResult, type QueryResultRow } from 'pg'

// Reuse a single pool across hot reloads in development to avoid exhausting
// Postgres connections. In production a fresh module instance is fine.
const globalForPg = globalThis as unknown as { pgPool?: Pool }

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env.local and configure it.',
    )
  }

  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  }

  return globalForPg.pgPool
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params as never[]);
}
