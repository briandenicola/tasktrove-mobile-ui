import { useCallback, useRef, useState } from 'react'
import { TaskItemExpandable } from './TaskItemExpandable'
import { EmptyState } from './EmptyState'
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
  onRefresh?: () => void
  pendingIds?: Set<string>
}

const PULL_THRESHOLD = 80

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

  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]!.clientY
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (refreshing) return
      const el = scrollRef.current
      if (!el || el.scrollTop > 0) return

      const dy = e.touches[0]!.clientY - touchStartY.current
      if (dy > 0) {
        setPullDistance(Math.min(dy * 0.4, PULL_THRESHOLD + 20))
      }
    },
    [refreshing],
  )

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= PULL_THRESHOLD && onRefresh) {
      setRefreshing(true)
      setPullDistance(40)
      Promise.resolve(onRefresh()).finally(() => {
        setRefreshing(false)
        setPullDistance(0)
      })
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, onRefresh])

  if (groups.length === 0) {
    return <EmptyState />
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center text-sm text-gray-400 transition-all"
          style={{ height: pullDistance }}
        >
          {refreshing
            ? 'Refreshing…'
            : pullDistance >= PULL_THRESHOLD
              ? 'Release to refresh'
              : 'Pull to refresh'}
        </div>
      )}

      <div role="list" className="px-4 pb-24">
        {groups.map((group) => (
          <section key={group.key} className="mb-4">
            <h2 className="sticky top-0 z-[1] bg-white/90 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 backdrop-blur-sm">
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
    </div>
  )
}
