import { SiteHeader } from '@/app/components/site-header'
import { CreatePostForm } from '@/app/components/create-post-form'
import { PostList } from '@/app/components/post-list'
import { verifySession, getCurrentUser } from '@/app/lib/dal'
import { getPostsByAuthor } from '@/app/lib/posts'
import type { Post } from '@/app/lib/definitions'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Redirects to /login if there is no valid session.
  const session = await verifySession()
  const user = await getCurrentUser()

  let posts: Post[] = []
  try {
    posts = await getPostsByAuthor(session.userId)
  } catch (err) {
    console.error('Failed to load user posts:', err)
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-4 py-8">
        <section>
          <h1 className="mb-1 text-2xl font-bold">
            Witaj{user ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Napisz nowy post — pojawi się w publicznym feedzie.
          </p>
          <div className="mt-6 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
            <CreatePostForm />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Twoje posty</h2>
          <PostList posts={posts} />
        </section>
      </main>
    </>
  )
}
