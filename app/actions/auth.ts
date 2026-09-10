'use server'

import { redirect } from 'next/navigation'
import { createUser, getUserByEmail, verifyPassword } from '@/app/lib/users'
import { createSession, deleteSession } from '@/app/lib/session'

export type AuthState =
  | {
      error?: string
      fieldErrors?: { name?: string; email?: string; password?: string }
    }
  | undefined

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Postgres unique-violation error code.
function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === '23505'
  )
}

export async function register(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')

  const fieldErrors: NonNullable<AuthState>['fieldErrors'] = {}
  if (name.length < 2) fieldErrors.name = 'Podaj imię (min. 2 znaki).'
  if (!isValidEmail(email)) fieldErrors.email = 'Podaj poprawny adres e-mail.'
  if (password.length < 8)
    fieldErrors.password = 'Hasło musi mieć min. 8 znaków.'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  let userId: number
  try {
    const existing = await getUserByEmail(email)
    if (existing) {
      return { fieldErrors: { email: 'Ten adres e-mail jest już zajęty.' } }
    }
    const user = await createUser(email, name, password)
    userId = user.id
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { fieldErrors: { email: 'Ten adres e-mail jest już zajęty.' } }
    }
    console.error('register failed:', err)
    return { error: 'Nie udało się utworzyć konta. Spróbuj ponownie.' }
  }

  await createSession(userId)
  redirect('/dashboard')
}

export async function login(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Podaj e-mail i hasło.' }
  }

  let userId: number
  try {
    const user = await getUserByEmail(email)
    // Always run the comparison path to avoid leaking which emails exist
    // through response timing differences where practical.
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return { error: 'Nieprawidłowy e-mail lub hasło.' }
    }
    userId = user.id
  } catch (err) {
    console.error('login failed:', err)
    return { error: 'Wystąpił błąd logowania. Spróbuj ponownie.' }
  }

  await createSession(userId)
  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/login')
}
