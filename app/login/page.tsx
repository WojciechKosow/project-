import { redirect } from 'next/navigation'
import { SiteHeader } from '@/app/components/site-header'
import { LoginForm } from '@/app/components/auth-forms'
import { getSession } from '@/app/lib/dal'

export default async function LoginPage() {
  // Already signed in? Go straight to the dashboard.
  if (await getSession()) redirect('/dashboard')

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-sm flex-1 px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold">Logowanie</h1>
        <LoginForm />
      </main>
    </>
  )
}
