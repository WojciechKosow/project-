'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addPost, type PostState } from '@/app/actions/posts'
import { SubmitButton } from '@/app/components/submit-button'

const inputClass =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'

export function CreatePostForm() {
  const [state, formAction] = useActionState<PostState, FormData>(addPost, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  // Clear the form after a successful submission.
  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state?.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40">
          Post został dodany.
        </p>
      )}
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Tytuł
        </label>
        <input id="title" name="title" type="text" required maxLength={200} className={inputClass} />
        {state?.fieldErrors?.title && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.title}</p>
        )}
      </div>
      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium">
          Treść
        </label>
        <textarea id="content" name="content" required rows={5} className={inputClass} />
        {state?.fieldErrors?.content && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.content}</p>
        )}
      </div>
      <SubmitButton>Opublikuj post</SubmitButton>
    </form>
  )
}
