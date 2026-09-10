import { SiteHeader } from '@/app/components/site-header'
import { PostList } from '@/app/components/post-list'
import { getPosts } from '@/app/lib/posts'
import type { Post } from '@/app/lib/definitions'

// The feed reads live data on every request.
export const dynamic = 'force-dynamic'

export default async function Home() {
  let posts: Post[] = []
  let dbError = false
  try {
    posts = await getPosts()
  } catch (err) {
    console.error('Failed to load posts:', err)
    dbError = true
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Najnowsze posty</h1>
        {dbError ? (
          <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40">
            Nie udało się połączyć z bazą danych. Sprawdź konfigurację{' '}
            <code>DATABASE_URL</code> i uruchom <code>npm run db:init</code>.
          </p>
        ) : (
          <PostList posts={posts} />
        )}
      </main>
    </>
  )
}
