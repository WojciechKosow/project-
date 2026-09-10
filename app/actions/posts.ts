'use server'

import { revalidatePath } from 'next/cache'
import { verifySession } from '@/app/lib/dal'
import { createPost } from '@/app/lib/posts'

export type PostState =
  | {
      error?: string
      fieldErrors?: { title?: string; content?: string }
      success?: boolean
    }
  | undefined

export async function addPost(
  _prevState: PostState,
  formData: FormData,
): Promise<PostState> {
  // Authorize inside the action — Server Actions are reachable via direct POST.
  const session = await verifySession()

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  const fieldErrors: NonNullable<PostState>['fieldErrors'] = {}
  if (title.length < 3) fieldErrors.title = 'Tytuł musi mieć min. 3 znaki.'
  if (title.length > 200) fieldErrors.title = 'Tytuł może mieć max 200 znaków.'
  if (content.length < 1) fieldErrors.content = 'Treść nie może być pusta.'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  try {
    await createPost(session.userId, title, content)
  } catch (err) {
    console.error('addPost failed:', err)
    return { error: 'Nie udało się dodać posta. Spróbuj ponownie.' }
  }

  // Refresh the feed and the dashboard so the new post shows up.
  revalidatePath('/')
  revalidatePath('/dashboard')
  return { success: true }
}
