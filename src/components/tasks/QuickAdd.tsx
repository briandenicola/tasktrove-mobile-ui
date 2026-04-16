import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useCreateTask } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import { getDefaultProject, getDefaultAssignee } from '@/lib/config'
import { getPriorityColor, getPriorityLabel, cn } from '@/lib/utils'
import type { Priority } from '@/lib/types'
import type { Label } from '@/lib/types'

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Extract #hashtag tokens from text and match against known labels (case-insensitive). */
function parseHashtagLabels(text: string, labels: Label[]): { matchedIds: string[]; cleanTitle: string } {
  const matchedIds: string[] = []
  let cleanTitle = text

  const hashtags = text.match(/#(\S+)/g)
  if (!hashtags || labels.length === 0) return { matchedIds, cleanTitle }

  for (const tag of hashtags) {
    const word = tag.slice(1).toLowerCase()
    const label = labels.find((l) => l.name.toLowerCase() === word)
    if (label && !matchedIds.includes(label.id)) {
      matchedIds.push(label.id)
      cleanTitle = cleanTitle.replace(tag, '').trim().replace(/\s{2,}/g, ' ')
    }
  }
  return { matchedIds, cleanTitle }
}

interface QuickAddProps {
  open: boolean
  onClose: () => void
}

export function QuickAdd({ open, onClose }: QuickAddProps) {
  const { data: labels } = useLabels()

  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(todayString)
  const [priority, setPriority] = useState<Priority>(4)
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [error, setError] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const createTask = useCreateTask()

  // Parse hashtag labels from the title
  const hashtagLabels = useMemo(
    () => parseHashtagLabels(title, labels ?? []),
    [title, labels],
  )

  // Merge hashtag-detected labels with manually selected ones
  const allSelectedLabels = useMemo(() => {
    const merged = new Set([...selectedLabels, ...hashtagLabels.matchedIds])
    return Array.from(merged)
  }, [selectedLabels, hashtagLabels.matchedIds])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [open])

  const reset = useCallback(() => {
    setTitle('')
    setDueDate(todayString())
    setPriority(4)
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
    const cleanTitle = hashtagLabels.cleanTitle.trim()
    if (!cleanTitle) {
      setError('Title is required')
      return
    }

    const defaultProject = getDefaultProject()
    const defaultAssignee = getDefaultAssignee()

    createTask.mutate(
      {
        title: cleanTitle,
        priority,
        ...(dueDate && { dueDate }),
        ...(defaultProject && { projectId: defaultProject }),
        ...(defaultAssignee && { ownerId: defaultAssignee, assignees: [defaultAssignee] }),
        ...(allSelectedLabels.length > 0 && { labels: allSelectedLabels }),
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

  /** Render the title with hashtag labels highlighted inline. */
  const renderHighlightedTitle = () => {
    if (!labels || labels.length === 0) return null
    const hashtags = title.match(/#(\S+)/g)
    if (!hashtags) return null

    const matchedTags = hashtags.filter((tag) => {
      const word = tag.slice(1).toLowerCase()
      return labels.some((l) => l.name.toLowerCase() === word)
    })
    if (matchedTags.length === 0) return null

    // Build segments: plain text + highlighted hashtags
    const segments: { text: string; label?: Label }[] = []
    let remaining = title
    for (const tag of matchedTags) {
      const idx = remaining.indexOf(tag)
      if (idx > 0) segments.push({ text: remaining.slice(0, idx) })
      const word = tag.slice(1).toLowerCase()
      const label = labels.find((l) => l.name.toLowerCase() === word)
      segments.push({ text: tag, label: label ?? undefined })
      remaining = remaining.slice(idx + tag.length)
    }
    if (remaining) segments.push({ text: remaining })

    return (
      <div className="mt-1.5 rounded-md bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 text-base" aria-hidden="true">
        {segments.map((seg, i) =>
          seg.label ? (
            <span
              key={i}
              className="inline-flex items-center gap-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 font-bold text-blue-700 dark:text-blue-300"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: seg.label.color }}
              />
              {seg.text}
            </span>
          ) : (
            <span key={i} className="text-gray-700 dark:text-gray-200">{seg.text}</span>
          ),
        )}
      </div>
    )
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

        <form onSubmit={handleSubmit} className="space-y-3 overflow-hidden">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError('') }}
              placeholder="What needs to be done? Use #label"
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-base outline-none transition-colors bg-white dark:bg-gray-700 dark:text-gray-100',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600',
              )}
              aria-label="Task title"
              aria-invalid={!!error}
            />
            {renderHighlightedTitle()}
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
            )}
          </div>

          <div>
            <label htmlFor="quick-add-date" className="sr-only">Due date</label>
            <input
              id="quick-add-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="box-border w-full max-w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Priority picker */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Priority</p>
            <div className="flex gap-2" role="radiogroup" aria-label="Priority">
              {([1, 2, 3, 4] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={priority === p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    'flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                    priority === p
                      ? `${getPriorityColor(p)} border-current bg-current/10`
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
                  )}
                >
                  {getPriorityLabel(p)}
                </button>
              ))}
            </div>
          </div>

          {/* Label picker */}
          {labels && labels.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Labels</p>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((label) => {
                  const selected = allSelectedLabels.includes(label.id)
                  const fromHashtag = hashtagLabels.matchedIds.includes(label.id)
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
                        selected
                          ? 'border-blue-400 dark:border-blue-500 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-bold shadow-sm'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700',
                        fromHashtag && 'ring-2 ring-blue-400/50 dark:ring-blue-500/50',
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
