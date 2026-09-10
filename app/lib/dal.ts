import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { decrypt, getSessionCookie } from '@/app/lib/session'
import { getUserById } from '@/app/lib/users'
import type { User } from '@/app/lib/definitions'

// Reads and validates the session. Memoized per-request via React `cache` so
// multiple calls during one render don't re-verify the token.
export const getSession = cache(async () => {
  const cookie = await getSessionCookie()
  const session = await decrypt(cookie)
  if (!session?.userId) return null
  return { userId: session.userId }
})

// Use in protected pages/actions: redirects to /login when there is no session.
export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
})

// Returns the current user or null. Does not redirect — handy for optional UI
// (e.g. showing login vs. logout in the header).
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession()
  if (!session) return null
  try {
    return await getUserById(session.userId)
  } catch {
    return null
  }
})
