import { useState } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { cn, formatRelativeDate } from '@/lib/utils'
import type { Task, Label, Project } from '@/lib/types'

interface TaskItemExpandableProps {
  task: Task
  labels?: Label[]
  projects?: Project[]
  onToggle: (id: string, completed: boolean) => void
  onSubtaskToggle?: (taskId: string, subtaskId: string, completed: boolean) => void
  onTap?: (id: string) => void
  loading?: boolean
}

export function TaskItemExpandable({
  task,
  labels,
  projects,
  onToggle,
  onSubtaskToggle,
  onTap,
  loading,
}: TaskItemExpandableProps) {
  const hasExpandable = task.subtasks.length > 0 || task.labels.length > 0 || !!task.projectId
  const [expanded, setExpanded] = useState(false)

  const labelMap = new Map(labels?.map((l) => [l.id, l]) ?? [])
  const projectMap = new Map(projects?.map((p) => [p.id, p]) ?? [])
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length
  const firstLabel = task.labels.length > 0 ? labelMap.get(task.labels[0]!) : undefined
  const project = task.projectId ? projectMap.get(task.projectId) : undefined

  return (
    <div
      role="listitem"
      className="border-b border-gray-100 dark:border-gray-800"
    >
      {/* Main row */}
      <div className="flex items-start gap-0 py-1">
        <div className="pt-0.5">
          <Checkbox
            checked={task.completed}
            loading={loading}
            onChange={(checked) => onToggle(task.id, checked)}
            label={`Mark "${task.title}" ${task.completed ? 'incomplete' : 'complete'}`}
          />
        </div>

        {/* Content area — tappable */}
        <button
          type="button"
          className={cn(
            'flex min-h-[44px] flex-1 flex-col justify-center gap-1 py-2 text-left',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded',
          )}
          onClick={() => onTap?.(task.id)}
        >
          <span
            className={cn(
              'text-base leading-snug',
              task.completed && 'text-gray-400 dark:text-gray-500 line-through',
            )}
          >
            {task.title}
          </span>

          {/* Meta row: priority, date, first label, subtask count */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatRelativeDate(task.dueDate)}
              </span>
            )}
            {firstLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: firstLabel.color }}
                  aria-hidden="true"
                />
                {firstLabel.name}
              </span>
            )}
            {task.subtasks.length > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
                <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M3.5 3.5h9v1h-9zm0 4h9v1h-9zm0 4h5v1h-5z" />
                </svg>
                {completedSubtasks}/{task.subtasks.length}
              </span>
            )}
          </div>
        </button>

        {/* Expand chevron */}
        {hasExpandable && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
            aria-expanded={expanded}
          >
            <svg
              className={cn('h-4 w-4 transition-transform duration-150', expanded && 'rotate-180')}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded detail panel */}
      {expanded && hasExpandable && (
        <div className="ml-11 mr-4 mb-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 space-y-3">
          {/* Project */}
          {project && (
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded"
                style={{ backgroundColor: project.color }}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Project: {project.name}</span>
            </div>
          )}

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map((labelId) => {
                const label = labelMap.get(labelId)
                return (
                  <span
                    key={labelId}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    {label && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                        aria-hidden="true"
                      />
                    )}
                    {label?.name ?? labelId}
                  </span>
                )
              })}
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Subtasks · {completedSubtasks}/{task.subtasks.length}
              </p>
              <ul className="space-y-1">
                {task.subtasks.map((sub) => (
                  <li key={sub.id} className="flex items-center gap-2.5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={sub.completed}
                      aria-label={`Mark subtask "${sub.title}" ${sub.completed ? 'incomplete' : 'complete'}`}
                      onClick={() => onSubtaskToggle?.(task.id, sub.id, !sub.completed)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {sub.completed ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded border-green-500 bg-green-500">
                          <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      ) : (
                        <span className="h-6 w-6 rounded border-2 border-gray-300 dark:border-gray-500" />
                      )}
                    </button>
                    <span className={cn('text-base', sub.completed && 'text-gray-400 dark:text-gray-500 line-through')}>
                      {sub.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
