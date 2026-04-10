import { useState, useRef, useEffect, useCallback } from 'react'
import { useCreateTask } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useLabels } from '@/hooks/useLabels'
import { cn } from '@/lib/utils'

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface QuickAddProps {
  open: boolean
  onClose: () => void
}

export function QuickAdd({ open, onClose }: QuickAddProps) {
  const { data: projects } = useProjects()
  const { data: labels } = useLabels()

  const meProject = projects?.find((p) => p.name.toLowerCase() === 'me')
  const defaultProjectId = meProject?.id ?? ''

  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(todayString)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [error, setError] = useState('')

  // Use explicit selection if user has interacted, otherwise default to "me"
  const effectiveProjectId = projectId ?? defaultProjectId

  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const createTask = useCreateTask()

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [open])

  const reset = useCallback(() => {
    setTitle('')
    setDueDate(todayString())
    setProjectId(null)
    setSelectedLabels([])
    setError('')
  }, [])

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId],
    )
  }

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
        ...(effectiveProjectId && { projectId: effectiveProjectId }),
        ...(selectedLabels.length > 0 && { labels: selectedLabels }),
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
          'w-full max-w-lg rounded-t-2xl bg-white dark:bg-gray-800 px-4 pb-8 pt-4 shadow-xl',
          'animate-slide-up',
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">New Task</h2>
          <button
            type="button"
            onClick={() => { reset(); onClose() }}
            className="rounded p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
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
                'w-full rounded-lg border px-3 py-2.5 text-base outline-none transition-colors bg-white dark:bg-gray-700 dark:text-gray-100',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600',
              )}
              aria-label="Task title"
              aria-invalid={!!error}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="sm:flex-1">
              <label htmlFor="quick-add-date" className="sr-only">Due date</label>
              <input
                id="quick-add-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {projects && projects.length > 0 && (
              <div className="min-w-0 sm:flex-1">
                <label htmlFor="quick-add-project" className="sr-only">Project</label>
                <select
                  id="quick-add-project"
                  value={effectiveProjectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full truncate rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Label picker */}
          {labels && labels.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Labels</p>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((label) => {
                  const selected = selectedLabels.includes(label.id)
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                        selected
                          ? 'border-transparent bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
                      )}
                      aria-pressed={selected}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                        aria-hidden="true"
                      />
                      {label.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

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
