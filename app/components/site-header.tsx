import Link from 'next/link'
import { getCurrentUser } from '@/app/lib/dal'
import { LogoutButton } from '@/app/components/logout-button'

export async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          Mini Blog
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="font-medium text-blue-600 hover:underline">
                Panel
              </Link>
              <span className="hidden text-zinc-500 sm:inline">{user.name}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="font-medium hover:underline">
                Zaloguj się
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white transition-colors hover:bg-blue-500"
              >
                Zarejestruj się
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
