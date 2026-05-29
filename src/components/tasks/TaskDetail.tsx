import { useState, useCallback, useMemo } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { cn, getPriorityColor, getPriorityLabel, formatDateTime } from '@/lib/utils'
import type { Task, Priority, Label, Subtask } from '@/lib/types'

interface TaskDetailProps {
  task: Task
  labels?: Label[]
  projects?: { id: string; name: string; color: string }[]
  onSave: (changes: Record<string, unknown>) => void
  saving?: boolean
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function TaskDetail({ task, labels, projects, onSave, saving }: TaskDetailProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')
  const [projectId, setProjectId] = useState(task.projectId ?? '')
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task.labels)
  const [labelInput, setLabelInput] = useState('')
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks)
  const [subtaskInput, setSubtaskInput] = useState('')
  const [dirty, setDirty] = useState(false)

  const markDirty = useCallback(() => setDirty(true), [])

  const labelMap = useMemo(() => new Map(labels?.map((l) => [l.id, l]) ?? []), [labels])

  const availableLabelSuggestions = useMemo(() => {
    const needle = labelInput.trim().toLowerCase()
    return (labels ?? []).filter((label) => {
      if (selectedLabels.includes(label.id)) return false
      if (!needle) return true
      return label.name.toLowerCase().includes(needle)
    })
  }, [labelInput, labels, selectedLabels])

  const handleSave = () => {
    onSave({
      id: task.id,
      title,
      description: description || undefined,
      priority,
      dueDate: dueDate || undefined,
      projectId: projectId || undefined,
      labels: selectedLabels,
      subtasks,
    })
  }

  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    setSubtasks((prev) => prev.map((s) => (s.id === subtaskId ? { ...s, completed } : s)))
    markDirty()
  }

  const handleSubtaskAdd = () => {
    const trimmed = subtaskInput.trim()
    if (!trimmed) return

    setSubtasks((prev) => [...prev, { id: makeId(), title: trimmed, completed: false }])
    setSubtaskInput('')
    markDirty()
  }

  const handleSubtaskDelete = (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((subtask) => subtask.id !== subtaskId))
    markDirty()
  }

  const handleAddLabel = (value: string) => {
    const trimmed = value.trim().toLowerCase()
    if (!trimmed || !labels?.length) return

    const match = labels.find((label) => label.name.toLowerCase() === trimmed)
    if (!match) return

    setSelectedLabels((prev) => (prev.includes(match.id) ? prev : [...prev, match.id]))
    setLabelInput('')
    markDirty()
  }

  const handleRemoveLabel = (labelId: string) => {
    setSelectedLabels((prev) => prev.filter((id) => id !== labelId))
    markDirty()
  }

  return (
    <div className="space-y-5 px-4 pb-24 pt-4">
      {/* Title */}
      <div>
        <label htmlFor="detail-title" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Title</label>
        <input
          id="detail-title"
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); markDirty() }}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2.5 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="detail-desc" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Description</label>
        <textarea
          id="detail-desc"
          value={description}
          onChange={(e) => { setDescription(e.target.value); markDirty() }}
          rows={3}
          placeholder="Add a description…"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2.5 text-base outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Priority */}
      <div>
        <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Priority</span>
        <div className="flex gap-2" role="radiogroup" aria-label="Priority">
          {([1, 2, 3, 4] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={priority === p}
              aria-label={getPriorityLabel(p)}
              onClick={() => { setPriority(p); markDirty() }}
              className={cn(
                'flex h-10 flex-1 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                priority === p
                  ? `${getPriorityColor(p)} border-current bg-current/10`
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
              )}
            >
              {getPriorityLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="detail-date" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Due Date</label>
        <input
          id="detail-date"
          type="date"
          value={dueDate}
          onChange={(e) => { setDueDate(e.target.value); markDirty() }}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Project */}
      {projects && projects.length > 0 && (
        <div>
          <label htmlFor="detail-project" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Project</label>
          <select
            id="detail-project"
            value={projectId}
            onChange={(e) => { setProjectId(e.target.value); markDirty() }}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Labels */}
      {labels && labels.length > 0 && (
        <div>
          <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Labels</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={labelInput}
              list="task-detail-label-list"
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddLabel(labelInput)
                }
              }}
              placeholder="Type a label"
              aria-label="Labels"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => handleAddLabel(labelInput)}
              className="h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-600 text-lg leading-none text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Add label"
            >
              +
            </button>
          </div>
          <datalist id="task-detail-label-list">
            {availableLabelSuggestions.map((label) => (
              <option key={label.id} value={label.name} />
            ))}
          </datalist>

          {selectedLabels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedLabels.map((labelId) => {
                const label = labelMap.get(labelId)
                return (
                  <button
                    key={labelId}
                    type="button"
                    onClick={() => handleRemoveLabel(labelId)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                    aria-label={`Remove label ${label?.name ?? labelId}`}
                  >
                    {label && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                        aria-hidden="true"
                      />
                    )}
                    {label?.name ?? labelId} ×
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Subtasks */}
      <div>
        <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Subtasks ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
        </span>
        <div className="mb-2 flex items-center gap-2">
          <input
            type="text"
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubtaskAdd()
              }
            }}
            placeholder="Add a subtask"
            aria-label="Subtask title"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="button"
            onClick={handleSubtaskAdd}
            className="h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-600 text-lg leading-none text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Add subtask"
          >
            +
          </button>
        </div>
        {subtasks.length > 0 && (
          <ul className="space-y-1">
            {subtasks.map((sub) => (
              <li key={sub.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Checkbox
                    checked={sub.completed}
                    onChange={(checked) => handleSubtaskToggle(sub.id, checked)}
                    label={`Mark subtask "${sub.title}" ${sub.completed ? 'incomplete' : 'complete'}`}
                  />
                  <span className={cn('text-sm dark:text-gray-200', sub.completed && 'text-gray-400 dark:text-gray-500 line-through')}>
                    {sub.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSubtaskDelete(sub.id)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label={`Delete subtask ${sub.title}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Comments (read-only) */}
      {task.comments.length > 0 && (
        <div>
          <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Comments ({task.comments.length})
          </span>
          <ul className="space-y-3">
            {task.comments.map((comment) => (
              <li key={comment.id} className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
                <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{formatDateTime(comment.createdAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Save button */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-base font-medium text-white transition-colors',
              'hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            )}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
