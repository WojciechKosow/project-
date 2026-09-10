import 'server-only'
import bcrypt from 'bcryptjs'
import { query } from '@/app/lib/db'
import type { User } from '@/app/lib/definitions'

type UserWithHash = User & { password_hash: string }

export async function getUserByEmail(
  email: string,
): Promise<UserWithHash | null> {
  const result = await query<UserWithHash>(
    'SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1',
    [email],
  )
  return result.rows[0] ?? null
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await query<User>(
    'SELECT id, email, name, created_at FROM users WHERE id = $1',
    [id],
  )
  return result.rows[0] ?? null
}

export async function createUser(
  email: string,
  name: string,
  password: string,
): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 10)
  const result = await query<User>(
    `INSERT INTO users (email, name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at`,
    [email, name, passwordHash],
  )
  return result.rows[0]
}

export function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}
