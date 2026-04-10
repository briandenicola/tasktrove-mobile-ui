import { TaskItemExpandable } from './TaskItemExpandable'
import { EmptyState } from './EmptyState'
import { PullToRefresh } from '@/components/layout/PullToRefresh'
import { groupTasksByDate } from '@/lib/utils'
import type { Task, TaskGroup, Label, Project } from '@/lib/types'

interface TaskListProps {
  tasks: Task[]
  groups?: TaskGroup[]
  labels?: Label[]
  projects?: Project[]
  onToggle: (id: string, completed: boolean) => void
  onSubtaskToggle?: (taskId: string, subtaskId: string, completed: boolean) => void
  onTap?: (id: string) => void
  onRefresh?: () => unknown
  pendingIds?: Set<string>
}

export function TaskList({
  tasks,
  groups: precomputedGroups,
  labels,
  projects,
  onToggle,
  onSubtaskToggle,
  onTap,
  onRefresh,
  pendingIds,
}: TaskListProps) {
  const groups = precomputedGroups ?? groupTasksByDate(tasks)

  if (groups.length === 0) {
    return onRefresh ? (
      <PullToRefresh onRefresh={onRefresh}>
        <EmptyState />
      </PullToRefresh>
    ) : (
      <EmptyState />
    )
  }

  const content = (
    <div role="list" className="px-4 pb-24">
      {groups.map((group) => (
        <section key={group.key} className="mb-4">
          <h2 className="sticky top-0 z-[1] bg-white/90 dark:bg-gray-900/90 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 backdrop-blur-sm">
            {group.label}
          </h2>
          {group.tasks.map((task) => (
            <TaskItemExpandable
              key={task.id}
              task={task}
              labels={labels}
              projects={projects}
              onToggle={onToggle}
              onSubtaskToggle={onSubtaskToggle}
              onTap={onTap}
              loading={pendingIds?.has(task.id)}
            />
          ))}
        </section>
      ))}
    </div>
  )

  return onRefresh ? (
    <PullToRefresh onRefresh={onRefresh}>
      {content}
    </PullToRefresh>
  ) : (
    <div className="flex-1 overflow-y-auto">{content}</div>
  )
}
