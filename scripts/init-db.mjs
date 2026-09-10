// Initialize the database schema.
// Usage: npm run db:init  (reads DATABASE_URL from the environment)
//
// Loads .env.local / .env if present, then runs db/schema.sql.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Minimal .env loader so the script works without extra dependencies.
function loadEnvFile(file) {
  try {
    const content = readFileSync(join(root, file), 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // File may not exist — that's fine.
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Configure it in .env.local first.')
  process.exit(1)
}

const schema = readFileSync(join(root, 'db', 'schema.sql'), 'utf8')

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })

try {
  await client.connect()
  await client.query(schema)
  console.log('✅ Database schema applied successfully.')
} catch (err) {
  console.error('❌ Failed to apply schema:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
