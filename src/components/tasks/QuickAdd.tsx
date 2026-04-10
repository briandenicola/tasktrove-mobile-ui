import { useState, useRef, useEffect, useCallback } from 'react'
import { useCreateTask } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { cn } from '@/lib/utils'

interface QuickAddProps {
  open: boolean
  onClose: () => void
}

export function QuickAdd({ open, onClose }: QuickAddProps) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const createTask = useCreateTask()
  const { data: projects } = useProjects()

  useEffect(() => {
    if (open) {
      // Small delay so the animation starts before focus
      const t = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [open])

  const reset = useCallback(() => {
    setTitle('')
    setDueDate('')
    setProjectId('')
    setError('')
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Title is required')
      return
    }

    createTask.mutate(
      {
        title: trimmed,
        ...(dueDate && { dueDate }),
        ...(projectId && { projectId }),
      },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
        onError: () => {
          setError('Failed to create task')
        },
      },
    )
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      reset()
      onClose()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Add task"
    >
      <div
        ref={panelRef}
        className={cn(
          'w-full max-w-lg rounded-t-2xl bg-white px-4 pb-8 pt-4 shadow-xl',
          'animate-slide-up',
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">New Task</h2>
          <button
            type="button"
            onClick={() => { reset(); onClose() }}
            className="rounded p-1 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError('') }}
              placeholder="What needs to be done?"
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-base outline-none transition-colors',
                'placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                error ? 'border-red-400' : 'border-gray-300',
              )}
              aria-label="Task title"
              aria-invalid={!!error}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="quick-add-date" className="sr-only">Due date</label>
              <input
                id="quick-add-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {projects && projects.length > 0 && (
              <div className="flex-1">
                <label htmlFor="quick-add-project" className="sr-only">Project</label>
                <select
                  id="quick-add-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={createTask.isPending}
            className={cn(
              'flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-base font-medium text-white transition-colors',
              'hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            )}
          >
            {createTask.isPending ? 'Adding…' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  )
}
