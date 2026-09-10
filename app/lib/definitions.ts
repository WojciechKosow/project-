// Shared domain types.

export type User = {
  id: number
  email: string
  name: string
  created_at: string
}

export type Post = {
  id: number
  author_id: number
  author_name: string
  title: string
  content: string
  created_at: string
}

// Data we store inside the signed session JWT. Keep it minimal — just enough
// to identify the user on subsequent requests.
export type SessionPayload = {
  userId: number
  expiresAt: Date
}
