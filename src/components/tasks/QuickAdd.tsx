import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useCreateTask } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import { getDefaultProject, getDefaultAssignee } from '@/lib/config'
import { getPriorityColor, getPriorityLabel, cn } from '@/lib/utils'
import type { Priority } from '@/lib/types'
import type { Subtask } from '@/lib/types'

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`
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
  const [labelInput, setLabelInput] = useState('')
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [error, setError] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const labelInputRef = useRef<HTMLInputElement>(null)
  const subtaskInputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const createTask = useCreateTask()

  const labelMap = useMemo(() => new Map(labels?.map((l) => [l.id, l]) ?? []), [labels])

  const availableLabelSuggestions = useMemo(() => {
    const needle = labelInput.trim().toLowerCase()
    return (labels ?? []).filter((label) => {
      if (selectedLabels.includes(label.id)) return false
      if (!needle) return true
      return label.name.toLowerCase().includes(needle)
    })
  }, [labelInput, labels, selectedLabels])

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
    setLabelInput('')
    setSubtasks([])
    setSubtaskInput('')
    setError('')
  }, [])

  const addLabel = useCallback((value: string) => {
    const trimmed = value.trim().toLowerCase()
    if (!trimmed || !labels?.length) return
    const match = labels.find((label) => label.name.toLowerCase() === trimmed)
    if (!match) return

    setSelectedLabels((prev) => (prev.includes(match.id) ? prev : [...prev, match.id]))
    setLabelInput('')
  }, [labels])

  const removeLabel = useCallback((labelId: string) => {
    setSelectedLabels((prev) => prev.filter((id) => id !== labelId))
  }, [])

  const addSubtask = useCallback((rawValue?: string) => {
    const trimmed = (rawValue ?? subtaskInput).trim()
    if (!trimmed) return

    setSubtasks((prev) => [...prev, { id: makeId(), title: trimmed, completed: false }])
    setSubtaskInput('')
  }, [subtaskInput])

  const removeSubtask = useCallback((subtaskId: string) => {
    setSubtasks((prev) => prev.filter((subtask) => subtask.id !== subtaskId))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanTitle = title.trim()
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
        ...(selectedLabels.length > 0 && { labels: selectedLabels }),
        ...(subtasks.length > 0 && { subtasks }),
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

        <form onSubmit={handleSubmit} className="space-y-3 overflow-hidden">
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

          {/* Label look-ahead input */}
          {labels && labels.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Labels</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  ref={labelInputRef}
                  value={labelInput}
                  list="quick-add-label-list"
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addLabel(e.currentTarget.value)
                    }
                  }}
                  placeholder="Type a label"
                  aria-label="Labels"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => addLabel(labelInputRef.current?.value ?? labelInput)}
                  className="h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-600 text-lg leading-none text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Add label"
                >
                  +
                </button>
              </div>
              <datalist id="quick-add-label-list">
                {availableLabelSuggestions.map((label) => (
                  <option key={label.id} value={label.name} />
                ))}
              </datalist>

              {selectedLabels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedLabels.map((labelId) => {
                    const label = labelMap.get(labelId)
                    return (
                      <button
                        key={labelId}
                        type="button"
                        onClick={() => removeLabel(labelId)}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-xs text-blue-700 dark:text-blue-200"
                        aria-label={`Remove label ${label?.name ?? labelId}`}
                      >
                        {label?.name ?? labelId} ×
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Subtasks input */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Subtasks</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                ref={subtaskInputRef}
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSubtask(e.currentTarget.value)
                  }
                }}
                placeholder="Add a subtask"
                aria-label="Subtask title"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => addSubtask(subtaskInputRef.current?.value ?? subtaskInput)}
                className="h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-600 text-lg leading-none text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Add subtask"
              >
                +
              </button>
            </div>

            {subtasks.length > 0 && (
              <ul className="mt-2 space-y-1">
                {subtasks.map((subtask) => (
                  <li key={subtask.id} className="flex items-center justify-between rounded-md bg-gray-50 dark:bg-gray-700/50 px-2 py-1.5 text-sm dark:text-gray-200">
                    <span>{subtask.title}</span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(subtask.id)}
                      className="text-gray-400 hover:text-red-500"
                      aria-label={`Remove subtask ${subtask.title}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
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
