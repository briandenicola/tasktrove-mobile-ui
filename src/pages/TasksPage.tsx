import { useCallback, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { TaskList } from '@/components/tasks/TaskList'
import { useTasks, useCompleteTask } from '@/hooks/useTasks'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

export function TasksPage() {
  const { data: tasks, isLoading, error, refetch } = useTasks()
  const completeTask = useCompleteTask()
  const { logout } = useAuth()
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

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

  return (
    <AppShell
      headerRight={
        <button
          type="button"
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      }
    >
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
          tasks={tasks}
          onToggle={handleToggle}
          onRefresh={handleRefresh}
          pendingIds={pendingIds}
        />
      )}
    </AppShell>
  )
}
