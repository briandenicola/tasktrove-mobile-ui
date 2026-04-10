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
      className="border-b border-gray-100"
    >
      {/* Main row */}
      <div className="flex items-center gap-1 py-1">
        <Checkbox
          checked={task.completed}
          loading={loading}
          onChange={(checked) => onToggle(task.id, checked)}
          label={`Mark "${task.title}" ${task.completed ? 'incomplete' : 'complete'}`}
        />

        <button
          type="button"
          className={cn(
            'flex min-h-[44px] flex-1 flex-col justify-center gap-0.5 text-left',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded',
          )}
          onClick={() => onTap?.(task.id)}
        >
          <span
            className={cn(
              'text-base leading-tight',
              task.completed && 'text-gray-400 line-through',
            )}
          >
            {task.title}
          </span>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span className="text-xs text-gray-500">
                {formatRelativeDate(task.dueDate)}
              </span>
            )}
            {firstLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: firstLabel.color }}
                  aria-hidden="true"
                />
                {firstLabel.name}
              </span>
            )}
            {task.subtasks.length > 0 && (
              <span className="text-xs text-gray-400">
                {completedSubtasks}/{task.subtasks.length}
              </span>
            )}
          </div>
        </button>

        {hasExpandable && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-gray-400 hover:text-gray-600"
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

      {/* Expanded section */}
      {expanded && hasExpandable && (
        <div className="pb-3 pl-12 pr-4">
          {/* Project */}
          {project && (
            <div className="mb-2 flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded"
                style={{ backgroundColor: project.color }}
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-gray-600">{project.name}</span>
            </div>
          )}

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {task.labels.map((labelId) => {
                const label = labelMap.get(labelId)
                return (
                  <span
                    key={labelId}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
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
            <ul className="space-y-0.5">
              {task.subtasks.map((sub) => (
                <li key={sub.id} className="flex items-center gap-1">
                  <Checkbox
                    checked={sub.completed}
                    onChange={(checked) => onSubtaskToggle?.(task.id, sub.id, checked)}
                    label={`Mark subtask "${sub.title}" ${sub.completed ? 'incomplete' : 'complete'}`}
                  />
                  <span className={cn('text-sm', sub.completed && 'text-gray-400 line-through')}>
                    {sub.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
