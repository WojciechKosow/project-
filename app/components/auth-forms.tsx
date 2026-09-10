'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, register, type AuthState } from '@/app/actions/auth'
import { SubmitButton } from '@/app/components/submit-button'

const inputClass =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

export function LoginForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(login, undefined)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Hasło
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>
      <SubmitButton>Zaloguj się</SubmitButton>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Nie masz konta?{' '}
        <Link href="/register" className="font-medium text-blue-600 hover:underline">
          Zarejestruj się
        </Link>
      </p>
    </form>
  )
}

export function RegisterForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(register, undefined)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Imię
        </label>
        <input id="name" name="name" type="text" autoComplete="name" required className={inputClass} />
        <FieldError message={state?.fieldErrors?.name} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
        <FieldError message={state?.fieldErrors?.email} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Hasło
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className={inputClass}
        />
        <FieldError message={state?.fieldErrors?.password} />
      </div>
      <SubmitButton>Utwórz konto</SubmitButton>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Masz już konto?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  )
}
