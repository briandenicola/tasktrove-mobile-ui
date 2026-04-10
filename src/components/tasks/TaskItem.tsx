import { Checkbox } from '@/components/ui/Checkbox'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { cn, formatRelativeDate } from '@/lib/utils'
import type { Task } from '@/lib/types'

interface TaskItemProps {
  task: Task
  onToggle: (id: string, completed: boolean) => void
  onTap?: (id: string) => void
  loading?: boolean
}

export function TaskItem({ task, onToggle, onTap, loading }: TaskItemProps) {
  return (
    <div
      role="listitem"
      className="flex items-center gap-1 border-b border-gray-100 py-1"
    >
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
        </div>
      </button>
    </div>
  )
}
