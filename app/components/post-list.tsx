import type { Post } from '@/app/lib/definitions'

function formatDate(value: string): string {
  return new Date(value).toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
        Brak postów. Bądź pierwszą osobą, która coś opublikuje!
      </p>
    )
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li
          key={post.id}
          className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <h3 className="text-lg font-semibold">{post.title}</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {post.author_name} · {formatDate(post.created_at)}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {post.content}
          </p>
        </li>
      ))}
    </ul>
  )
}
