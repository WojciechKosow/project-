import 'server-only'
import { query } from '@/app/lib/db'
import type { Post } from '@/app/lib/definitions'

export async function getPosts(limit = 50): Promise<Post[]> {
  const result = await query<Post>(
    `SELECT p.id, p.author_id, u.name AS author_name, p.title, p.content, p.created_at
     FROM posts p
     JOIN users u ON u.id = p.author_id
     ORDER BY p.created_at DESC
     LIMIT $1`,
    [limit],
  )
  return result.rows
}

export async function getPostsByAuthor(authorId: number): Promise<Post[]> {
  const result = await query<Post>(
    `SELECT p.id, p.author_id, u.name AS author_name, p.title, p.content, p.created_at
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.author_id = $1
     ORDER BY p.created_at DESC`,
    [authorId],
  )
  return result.rows
}

export async function createPost(
  authorId: number,
  title: string,
  content: string,
): Promise<Post> {
  const result = await query<Post>(
    `INSERT INTO posts (author_id, title, content)
     VALUES ($1, $2, $3)
     RETURNING id, author_id, title, content, created_at`,
    [authorId, title, content],
  )
  return result.rows[0]
}
