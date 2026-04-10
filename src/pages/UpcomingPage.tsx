import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { BottomNav } from '@/components/layout/BottomNav'
import { TaskList } from '@/components/tasks/TaskList'
import { QuickAdd } from '@/components/tasks/QuickAdd'
import { useTasks, useCompleteTask } from '@/hooks/useTasks'
import { filterUpcomingTasks } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { TaskGroup } from '@/lib/types'

export function UpcomingPage() {
  const { data: tasks, isLoading, error, refetch } = useTasks()
  const completeTask = useCompleteTask()
  const navigate = useNavigate()
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const upcomingGroups: TaskGroup[] = tasks ? filterUpcomingTasks(tasks) : []

  const handleToggle = useCallback(
    (id: string, completed: boolean) => {
      setPendingIds((prev) => new Set(prev).add(id))
      completeTask.mutate(
        { id, completed },
        {
          onSettled: () => {
            setPendingIds((prev) => {
              const next = new Set(prev)
              next.delete(id)
              return next
            })
          },
        },
      )
    },
    [completeTask],
  )

  const handleRefresh = useCallback(() => {
    return refetch()
  }, [refetch])

  const handleTap = useCallback(
    (id: string) => navigate(`/task/${id}`),
    [navigate],
  )

  // TaskList expects all tasks; we flatten groups for it
  const allUpcoming = upcomingGroups.flatMap((g) => g.tasks)

  return (
    <AppShell title="Upcoming">
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">Loading tasks…</p>
        </div>
      )}

      {error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <p className="text-sm text-red-600">Failed to load tasks</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {tasks && (
        <TaskList
          tasks={allUpcoming}
          onToggle={handleToggle}
          onTap={handleTap}
          onRefresh={handleRefresh}
          pendingIds={pendingIds}
        />
      )}

      <QuickAdd open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <BottomNav onAddTap={() => setQuickAddOpen(true)} />
    </AppShell>
  )
}
