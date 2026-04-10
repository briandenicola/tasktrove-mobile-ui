import { cn, getPriorityColor, getPriorityLabel } from '@/lib/utils'
import type { Priority } from '@/lib/types'

interface PriorityBadgeProps {
  priority: Priority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (priority === 4) return null

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-xs font-medium', getPriorityColor(priority))}
      aria-label={`Priority: ${getPriorityLabel(priority)}`}
    >
      <svg
        className="h-3 w-3"
        viewBox="0 0 12 12"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M1 11V1.5L7.5 1.5L7 3.5H11V7.5H7L7.5 5.5H3V11H1Z" />
      </svg>
      {getPriorityLabel(priority)}
    </span>
  )
}
